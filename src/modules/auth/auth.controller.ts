import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';

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
}
