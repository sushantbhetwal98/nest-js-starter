import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class AuthModule {}
