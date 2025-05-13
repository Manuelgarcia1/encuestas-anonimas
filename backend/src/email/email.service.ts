// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailer: MailerService) {}

  async sendDashboardLink(to: string, dashboardUrl: string) {
    await this.mailer.sendMail({
      to,
      subject: 'Tu enlace seguro al Dashboard de Encuestas',
      template: 'dashboard-token',
      context: { dashboardUrl },
    });
  }
}
