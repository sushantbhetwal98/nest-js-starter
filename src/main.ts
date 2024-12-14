import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import globalConfiguration from './config/global.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(globalConfiguration().PORT);
}
bootstrap();
