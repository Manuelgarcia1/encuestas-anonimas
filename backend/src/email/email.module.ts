// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      // …
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host: cfg.get('SMTP_HOST'), // smtp.gmail.com
          port: cfg.get<number>('SMTP_PORT'), // 465
          secure: true, // SSL/TLS desde el CONNECT
          auth: {
            user: cfg.get('SMTP_USER'),
            pass: cfg.get('SMTP_PASS'),
          },
          logger: true,
          debug: true,
        },
        defaults: { from: cfg.get('SMTP_FROM') },
        template: {
          dir: join(__dirname, '..', 'templates', 'emails'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
