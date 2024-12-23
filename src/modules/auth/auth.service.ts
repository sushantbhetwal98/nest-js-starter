import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/auth.entity';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { generateOTP } from 'src/common/utils/generate-otp.utils';
import { CreateUserDto } from './dto/createUser.dto';
import { EmailService } from '../external-services/email/email.service';
import { VerifyUserDto } from './dto/verifyUser.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  private hashValue(value: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedValue = crypto
      .createHmac('sha256', salt)
      .update(value)
      .digest('hex');

    return {
      salt,
      hashedValue,
    };
  }

  async getUserByEmail(email: string) {
    try {
      const existingUser = await this.userRepo
        .createQueryBuilder()
        .where('email = :email', { email })
        .getOne();

      if (!existingUser) {
        throw new NotFoundException('User with the email not found.');
      }
      return existingUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }

  async createUser(user: CreateUserDto) {
    const { password, ...remainingData } = user;
    const generatedOtp = generateOTP();
    const hashedPasswordData = this.hashValue(password);

    // creating query runner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          ...remainingData,
          is_active: false,
          password: hashedPasswordData.hashedValue,
          password_salt: hashedPasswordData.salt,
          otp: generateOTP,
          otp_expiry: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes from now
        })
        .returning('*')
        .execute();

      const { password, password_salt, otp, ...savedUser } = result.raw[0];

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
      if (error.code === '23505') {
        throw new ConflictException('User with the email already exists.');
      }
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyUser(verifyUserPayload: VerifyUserDto) {
    try {
      const existingUser = await this.getUserByEmail(verifyUserPayload.email);
      if (existingUser.is_active) {
        throw new BadRequestException('User already verified');
      }

      if (existingUser.otp_expiry < new Date()) {
        throw new BadRequestException('OTP Expired');
      }

      if (existingUser.otp !== verifyUserPayload.otp) {
        throw new BadRequestException('OTP doesnot match');
      }

      const updateUser = await this.userRepo
        .createQueryBuilder()
        .update()
        .set({ is_active: true })
        .where('id = :userId', { userId: existingUser.id })
        .execute();

      if (!updateUser.affected) {
        throw new InternalServerErrorException(
          'Something went wrong. Please try again later.',
        );
      }
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
}
