import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/send')
  async sendEmail(@Body() emailPayload: any) {
    const data = await this.emailService.sendEmail(emailPayload);
    return {
      data,
    };
  }
}
