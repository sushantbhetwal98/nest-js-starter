import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, { message: 'First Name must be 2 to 50 characters long' })
  @MinLength(2, { message: 'First Name must be 2 to 50 characters long' })
  first_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Middle Name must be 2 to 50 characters long' })
  @MinLength(2, { message: 'Middle Name must be 2 to 50 characters long' })
  middle_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Last Name must be 2 to 50 characters long' })
  @MaxLength(50, { message: 'Last Name must be 2 to 50 characters long' })
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  password_salt: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsDate()
  otp_expiry: Date;

  @IsBoolean()
  is_active: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
