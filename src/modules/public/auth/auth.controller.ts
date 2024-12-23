import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { ResendOtpDto } from './dto/resendOtp.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { userInterface } from './interfaces/user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async registerUser(@Body() registerUserPayload: RegisterUserDto) {
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

  @Post('/login')
  async login(@Body() credentialsPayload: LoginDto) {
    const data = await this.authService.login(credentialsPayload);
    return {
      data,
      message: 'Login Successful',
    };
  }

  @UseGuards(AuthGuard)
  @Patch('/change-password')
  async changePassword(
    @Body() changePasswordPayload: ChangePasswordDto,
    @GetUser() user: userInterface,
  ) {
    const data = await this.authService.changePassword(
      changePasswordPayload,
      user,
    );
    return {
      data,
      message: 'Password reset successful',
    };
  }
}
