import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { generateOTP } from 'src/common/utils/generate-otp.utils';
import { RegisterUserDto } from './dto/register.dto';
import { EmailService } from '../../external-services/email/email.service';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { userInterface } from './interfaces/user.interface';
import globalConfig from 'src/config/global.config';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private hashValue(value: string, defaultsalt?: string) {
    const salt = defaultsalt ?? crypto.randomBytes(16).toString('hex');
    const hashedValue = crypto
      .createHmac('sha256', salt)
      .update(value)
      .digest('hex');

    return {
      salt,
      hashedValue,
    };
  }

  private async createTokens(user: userInterface) {
    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: globalConfig().AUTH.JWT_SECRET,
        expiresIn: globalConfig().AUTH.ACCESS_TOKEN_EXPIRY,
      },
    );
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      {
        secret: globalConfig().AUTH.JWT_SECRET,
        expiresIn: globalConfig().AUTH.REFRESH_TOKEN_EXPIRY,
      },
    );

    return {
      accessToken,
      access_expires: this.jwtService.decode(accessToken).exp,
      refreshToken,
      refresh_expires: this.jwtService.decode(refreshToken).exp,
    };
  }

  async createUser(user: RegisterUserDto) {
    const { password, ...remainingData } = user;
    const generatedOtp = generateOTP();
    const hashedPasswordData = this.hashValue(password);

    // creating query runner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userPayload = {
        ...remainingData,
        is_active: false,
        password: hashedPasswordData.hashedValue,
        password_salt: hashedPasswordData.salt,
        otp: generatedOtp,
        otp_expiry: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes from now
      };

      const { password, password_salt, otp, ...savedUser } =
        await this.userService.createUser(userPayload, queryRunner);

      await this.emailService.sendOtp(
        savedUser.first_name,
        savedUser.last_name,
        [savedUser.email],
        otp,
      );

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyUser(verifyUserPayload: VerifyUserDto) {
    try {
      const existingUser = await this.userService.getUserByEmail(
        verifyUserPayload.email,
      );

      if (!existingUser) {
        throw new NotFoundException('User with the email doesnot exists');
      }

      if (existingUser.is_active) {
        throw new BadRequestException('User already verified');
      }

      if (existingUser.otp_expiry < new Date()) {
        throw new BadRequestException('OTP Expired');
      }

      if (existingUser.otp !== verifyUserPayload.otp) {
        throw new BadRequestException('OTP doesnot match');
      }

      await this.userService.updateUser(existingUser.id, {
        is_active: true,
      });

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }

  async resendOtp(email: string) {
    // creating query runner for transaction
    const generatedOtp = generateOTP();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updatedUserResponse = await queryRunner.manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          otp: generateOTP,
          otp_expiry: new Date(new Date().getTime() + 5 * 60 * 1000),
        })
        .where('email = :email', { email })
        .returning('*')
        .execute();

      if (!updatedUserResponse.affected) {
        throw new NotFoundException('User with the email not found');
      }

      const updatedUser = updatedUserResponse.raw[0];

      if (updatedUser.is_active) {
        throw new BadRequestException('User already verified');
      }

      await this.emailService.sendOtp(
        updatedUser.first_name,
        updatedUser.last_name,
        [updatedUser.email],
        updatedUser.otp,
      );

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(credentials: LoginDto) {
    try {
      const existingUser = await this.userService.getUserByEmail(
        credentials.email,
      );
      if (!existingUser) {
        throw new BadRequestException('Invalid Credentials');
      }

      const newHashData = this.hashValue(
        credentials.password,
        existingUser.password_salt,
      );

      if (newHashData.hashedValue !== existingUser.password) {
        throw new BadRequestException('Invalid Credentials');
      }

      const tokens = await this.createTokens(existingUser);

      const { password, password_salt, otp, ...userInfo } = existingUser;

      return { user: userInfo, ...tokens };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }

  async changePassword(
    changePasswordPayload: ChangePasswordDto,
    user: userInterface,
  ) {
    try {
      const oldHashedPasswordData = this.hashValue(
        changePasswordPayload.password,
        user.password_salt,
      );

      if (oldHashedPasswordData.hashedValue !== user.password) {
        throw new BadRequestException("Old Password didn't match");
      }

      const hashedPasswordData = this.hashValue(
        changePasswordPayload.newPassword,
      );

      await this.userService.updateUser(user.id, {
        password: hashedPasswordData.hashedValue,
        password_salt: hashedPasswordData.salt,
      });

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }
}
