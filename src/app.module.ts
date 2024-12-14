import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import globalConfiguration from './config/global.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [globalConfiguration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
