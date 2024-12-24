import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { userInterface } from '../auth/interfaces/user.interface';
import { UpdateUserDto } from './dtos/users.dto';

@UseGuards(AuthGuard)
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUserByEmail(@Query('email') email: string) {
    const { password, password_salt, otp, otp_expiry, ...data } =
      await this.userService.getUserByEmail(email);
    return {
      data,
      message: 'User fetched successfully.',
    };
  }

  @Get('/me')
  getMyProfile(@GetUser() user: userInterface) {
    const { password, password_salt, otp, otp_expiry, ...data } = user;
    return {
      data,
      message: 'Profile Fetched successfully',
    };
  }

  @Get('/:userId')
  async getUserById(@Param('userId') userId: string) {
    const { password, password_salt, otp, otp_expiry, ...data } =
      await this.userService.getUserById(userId);
    return {
      data,
      message: 'User fetched successfully.',
    };
  }

  @Patch('/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserPayload: UpdateUserDto,
  ) {
    const { password, password_salt, otp, otp_expiry, ...data } =
      await this.userService.updateUser(userId, updateUserPayload);
    return {
      data,
      message: 'User updated successfully.',
    };
  }
}
