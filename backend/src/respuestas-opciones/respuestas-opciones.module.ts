import { Module } from '@nestjs/common';
import { RespuestasOpcionesService } from './respuestas-opciones.service';
import { RespuestasOpcionesController } from './respuestas-opciones.controller';

@Module({
  controllers: [RespuestasOpcionesController],
  providers: [RespuestasOpcionesService],
})
export class RespuestasOpcionesModule {}
