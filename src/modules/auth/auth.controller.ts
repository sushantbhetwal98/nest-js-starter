import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { ResendOtpDto } from './dto/resendOtp.dto';

@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async registerUser(@Body() registerUserPayload: CreateUserDto) {
    const data = await this.authService.createUser(registerUserPayload);
    return {
      data,
      message: 'User Registered Successfully.',
    };
  }

  @Patch('/verify')
  async verifyUser(@Body() verifyOtpPayload: VerifyUserDto) {
    const data = await this.authService.verifyUser(verifyOtpPayload);
    return {
      data,
      message: 'User Verified Successfully.',
    };
  }

  @Patch('/resend-otp')
  async resendOtp(@Body() body: ResendOtpDto) {
    const data = await this.authService.resendOtp(body.email);
    return {
      data,
      message: 'OTP resend to your email.',
    };
  }
}
