import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import globalConfig from 'src/config/global.config';

@Injectable()
export class EmailService {
  private emailTransport() {
    const transporter = nodemailer.createTransport({
      host: globalConfig().EMAIL.HOST,
      port: globalConfig().EMAIL.PORT,
      secure: false,
      auth: {
        user: globalConfig().EMAIL.USER,
        pass: globalConfig().EMAIL.PASSWORD,
      },
    });
    return transporter;
  }

  async sendEmail(email: any) {
    const { recipients, subject, html } = email;
    const transport = this.emailTransport();
    const options: nodemailer.SendMailOptions = {
      from: globalConfig().EMAIL.USER,
      to: recipients,
      subject: subject,
      html: html,
    };

    try {
      await transport.sendMail(options);
      const data = 'email send successfully';
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
