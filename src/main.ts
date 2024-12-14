import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import globalConfiguration from './config/global.config';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // custom exception filter
  const logger = new Logger();
  app.useGlobalFilters(new CustomExceptionFilter(logger));
  await app.listen(globalConfiguration().PORT);
}
bootstrap();
