import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';
    const code = exception?.response?.error || exception?.code || 'INTERNAL_ERROR';

    this.logger.error(`${request.method} ${request.url} ${status} - ${message}`, exception.stack);

    response.status(status).json({
      error: {
        code,
        message,
        requestId: request.requestId || '',
        ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
      },
    });
  }
}
