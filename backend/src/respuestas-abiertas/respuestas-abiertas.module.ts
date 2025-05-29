import { Module } from '@nestjs/common';
import { RespuestasAbiertasService } from './services/respuestas-abiertas.service';
import { RespuestasAbiertasController } from './controller/respuestas-abiertas.controller';

@Module({
  controllers: [RespuestasAbiertasController],
  providers: [RespuestasAbiertasService],
})
export class RespuestasAbiertasModule {}
