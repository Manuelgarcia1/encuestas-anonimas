import { Module } from '@nestjs/common';
import { RespuestasService } from './services/respuestas.service';
import { RespuestasController } from './controller/respuestas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Respuesta } from './entities/respuesta.entity';
import { RespuestaOpcion } from '../respuestas-opciones/entities/respuestas-opcione.entity';
import { RespuestaAbierta } from '../respuestas-abiertas/entities/respuestas-abierta.entity';
import { EncuestasModule } from '../encuestas/encuestas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Respuesta, RespuestaOpcion, RespuestaAbierta]), EncuestasModule
  ],
  controllers: [RespuestasController],
  providers: [RespuestasService],
})
export class RespuestasModule {}
