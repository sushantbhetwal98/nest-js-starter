import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getUserById(userId: string) {
    try {
      const existingUser = await this.userRepo
        .createQueryBuilder()
        .where('id = :userId', { userId })
        .getOne();

      if (!existingUser) {
        throw new NotFoundException('User with the id not found');
      }
      return existingUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const existingUser = await this.userRepo
        .createQueryBuilder()
        .where('email = :email', { email })
        .getOne();

      // if (!existingUser) {
      //   throw new NotFoundException('User with the email not found.');
      // }
      return existingUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }

  async createUser(userPayload: CreateUserDto, queryRunner: QueryRunner) {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values(userPayload)
        .returning('*')
        .execute();

      return result.raw[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User with the email already exists.');
      }
      console.log(error);
      throw error;
    }
  }

  async updateUser(userId: string, userPayload: UpdateUserDto) {
    try {
      const updatedUser = await this.userRepo
        .createQueryBuilder()
        .update()
        .set(userPayload)
        .where('id = :userId', { userId })
        .execute();

      if (!updatedUser.affected) {
        throw new InternalServerErrorException(
          'Something went wrong. Please try again later.',
        );
      }
      return updatedUser.raw[0];
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw error;
    }
  }
}
