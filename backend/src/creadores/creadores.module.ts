// src/creadores/creadores.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Creador } from './entities/creador.entity';
import { CreadoresService } from './creadores.service';
import { CreadoresController } from './creadores.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Creador]),
  ],
  providers: [CreadoresService],
  controllers: [CreadoresController],
  exports: [CreadoresService],
})
export class CreadoresModule {}
