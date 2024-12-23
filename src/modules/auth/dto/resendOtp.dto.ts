import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
