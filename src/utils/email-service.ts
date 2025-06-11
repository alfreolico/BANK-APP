import nodemailer from 'nodemailer';
import pug from 'pug';
import path from 'path';
import { envs } from '../config';
import { logError, logInfo } from './logger';

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  templateData: any;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envs.EMAIL_HOST,
      port: envs.EMAIL_PORT,
      secure: envs.EMAIL_PORT === 465,
      auth: {
        user: envs.EMAIL_USER,
        pass: envs.EMAIL_PASS,
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const templatePath = path.join(
        __dirname,
        '../templates/emails',
        `${emailData.template}.pug`
      );
      const compiledFunction = pug.compileFile(templatePath);
      const html = compiledFunction(emailData.templateData);

      const mailOptions = {
        from: `"Banking App" <${envs.EMAIL_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logInfo('Email enviado exitosamente', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      logError('Error enviando email', error as Error, {
        to: emailData.to,
        template: emailData.template,
      });
      return false;
    }
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    accountNumber: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: '¡Bienvenido a Bank App! - Cuenta creada exitosamente',
      template: 'welcome',
      templateData: {
        userName,
        userEmail,
        accountNumber,
        currentYear: new Date().getFullYear(),
        supportEmail: envs.EMAIL_USER,
        appUrl: envs.APP_URL || 'http://localhost:3000',
      },
    });
  }

  async sendTransferNotification(
    userEmail: string,
    data: {
      userName: string;
      amount: number;
      senderName: string;
      accountNumber: string;
      newBalance: number;
      transactionId: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Transferencia recibida - Bank App',
      template: 'transfer-received',
      templateData: {
        ...data,
        currentYear: new Date().getFullYear(),
        supportEmail: envs.EMAIL_USER,
        appUrl: envs.APP_URL || 'http://localhost:3000',
      },
    });
  }
}
