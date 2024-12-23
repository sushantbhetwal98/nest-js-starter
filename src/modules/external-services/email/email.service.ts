import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import globalConfig from 'src/config/global.config';
import { generateOtpEmailTemplate } from './template/otp.template';

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

  async sendOtp(
    firstName: string,
    lastName: string,
    recipients: string[],
    otp: string,
  ) {
    const transport = this.emailTransport();
    const emailHtml = generateOtpEmailTemplate(firstName, lastName, otp);
    const options: nodemailer.SendMailOptions = {
      from: globalConfig().EMAIL.USER,
      to: recipients,
      subject: `Verify Your Email`,
      html: emailHtml,
    };
    try {
      await transport.sendMail(options);
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
