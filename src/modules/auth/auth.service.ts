import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/auth.entity';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { generateOTP } from 'src/common/utils/generate-otp.utils';
import { CreateUserDto } from './dto/createUser.dto';
import { EmailService } from '../external-services/email/email.service';

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

      const emailResponse = await this.emailService.sendOtp(
        savedUser.first_name,
        savedUser.last_name,
        [savedUser.email],
        otp,
      );

      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        throw new ConflictException('User with the email already exists.');
      }
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
