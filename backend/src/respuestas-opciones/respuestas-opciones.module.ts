import { Module } from '@nestjs/common';
import { RespuestasOpcionesService } from './services/respuestas-opciones.service';
import { RespuestasOpcionesController } from './controller/respuestas-opciones.controller';

@Module({
  controllers: [RespuestasOpcionesController],
  providers: [RespuestasOpcionesService],
})
export class RespuestasOpcionesModule {}
