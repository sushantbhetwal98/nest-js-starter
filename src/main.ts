import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import globalConfiguration from './config/global.config';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';
import { Logger } from '@nestjs/common';
import { CustomValidationPipe } from './common/pipe/custom-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // custom exception filter
  const loggerInstance = app.get(Logger);
  app.useGlobalFilters(new CustomExceptionFilter(loggerInstance));
  // custom validation pipe
  app.useGlobalPipes(
    new CustomValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.enableCors({
    origin: '*',
  });
  await app.listen(globalConfiguration().PORT);
}
bootstrap();
