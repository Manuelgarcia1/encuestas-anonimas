// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host:   cfg.get('SMTP_HOST'),
          port:   cfg.get<number>('SMTP_PORT'),
          secure: cfg.get<boolean>('SMTP_SECURE'),
          auth: {
            user: cfg.get('SMTP_USER'),
            pass: cfg.get('SMTP_PASS'),
          },
        },
        defaults: { from: cfg.get('SMTP_FROM') },
        template: {
          dir:     join(__dirname, '..', 'templates', 'emails'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],  // aquí sí inyectas tu ConfigService global
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
