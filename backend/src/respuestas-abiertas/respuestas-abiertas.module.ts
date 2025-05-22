import { Module } from '@nestjs/common';
import { RespuestasAbiertasService } from './respuestas-abiertas.service';
import { RespuestasAbiertasController } from './respuestas-abiertas.controller';

@Module({
  controllers: [RespuestasAbiertasController],
  providers: [RespuestasAbiertasService],
})
export class RespuestasAbiertasModule {}
