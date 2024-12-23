import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import globalConfig from 'src/config/global.config';
import { UserService } from 'src/modules/public/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [bearer, accessToken] =
      request.headers['Authorization']?.split(' ') ||
      request.headers['authorization']?.split(' ');

    if (!accessToken || bearer !== 'Bearer') {
      throw new UnauthorizedException('Please provide an authorization token');
    }

    try {
      const decodedToken = this.jwtService.verify(accessToken, {
        secret: globalConfig().AUTH.JWT_SECRET,
      });

      const user = await this.userService.getUserById(decodedToken.id);
      // const { password, password_salt, otp, ...remainingData } = user;
      request['user'] = user;

      return true;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error.message);
      }
      console.error(error);
    }
  }
}
