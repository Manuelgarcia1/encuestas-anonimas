import { Module } from '@nestjs/common';
import { RespuestasService } from './respuestas.service';
import { RespuestasController } from './respuestas.controller';

@Module({
  controllers: [RespuestasController],
  providers: [RespuestasService],
})
export class RespuestasModule {}
