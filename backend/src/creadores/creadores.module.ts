// src/creadores/creadores.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Creador } from './entities/creador.entity';
import { CreadoresService } from './services/creadores.service';
import { CreadoresController } from './controller/creadores.controller';

import { EmailModule } from '../email/email.module';  // ← Importa tu módulo de e-mail

@Module({
  imports: [
    // 1) Repo de Creador disponible sólo aquí
    TypeOrmModule.forFeature([Creador]),
    // 2) EmailService disponible para inyección
    EmailModule,
  ],
  providers: [CreadoresService],
  controllers: [CreadoresController],
  exports: [CreadoresService],
})
export class CreadoresModule {}
