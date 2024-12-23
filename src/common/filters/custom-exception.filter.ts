import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.getErrorMessage(exception);
    const timestamp = new Date().toISOString();

    this.logger.error(
      `${request.method} ${request.originalUrl} ${status} ${message}`,
    );

    // console.log(exception);

    response.status(status).json({
      statusCode: status,
      timestamp,
      path: request.url,
      message,
    });
  }

  private getStatusCode(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string' ? response : response['message'];
    }
    return 'Internal server error';
  }
}
