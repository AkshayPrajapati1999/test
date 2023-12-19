import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import * as nodemailer from 'nodemailer';
import { MESSAGES } from 'src/common/utils/constants';
import { env } from 'src/environmant/environmant';

@Injectable()
export class MailService {
  private transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      requireTLS: true,
      auth: env.auth,
      logger: true,
    });
  }

  async sendPasswordResetToken(email: string, firstName: string, token: string) {
    try {
      const sendMail = {
        from: `Meditation  ${env.from}`,
        to: email,
        subject: 'otp for password reset',
        html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                </head>
                <body>
                    <div style="background-color: #f4f4f4; padding: 20px;">
                        <h1>Password Reset</h1>
                        <p>Hi ${firstName},</p>
                        <p>Your password reset token is: ${token}</p>
                        <p>Click the following link to reset your password:</p>
                        <a href="http://localhost:3000/graphql">Reset Password</a>
                    </div>
                </body>
                </html>
            `,
      };
      await this.transporter.sendMail(sendMail);
    } catch (error) {
      // throw new HttpException(MESSAGES.EMAIL_NOT_SENT, HttpStatus.BAD_REQUEST)
      console.log(error, error.message)
      return new GraphQLError(MESSAGES.EMAIL_NOT_SENT, null);
    }
  }

  async sendAccountVErification(email: string, firstName: string, unlockOtp: string) {
    try {
      const sendMail = {
        from: `Meditation  ${env.from}`,
        to: email,
        subject: 'Verify Account',
        html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                </head>
                <body>
                    <div style="background-color: #f4f4f4; padding: 20px;">
                        <h1>ReActivate Account</h1>
                        <p>Hi ${firstName},</p>
                        <p>We got your account on Meditation and your otp for reActivatation is: ${unlockOtp}</p>
                        <p>Click the following link to reActivate your account:</p>
                        <a href="http://localhost:3000/graphql">reactivate account</a>
                    </div>
                </body>
                </html>
            `,
      }
      await this.transporter.sendMail(sendMail);
    } catch (error) {
      console.log(error, error.message)
      return new GraphQLError(MESSAGES.EMAIL_NOT_SENT, null);
    }
  }
}