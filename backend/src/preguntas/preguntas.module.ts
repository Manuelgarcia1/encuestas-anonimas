import { Encuesta } from './../encuestas/entities/encuesta.entity';
import { Opcion } from './../opciones/entities/opcion.entity';
import { Module } from '@nestjs/common';
import { PreguntasService } from './services/preguntas.service';
import { PreguntasController } from './controller/preguntas.controller';
import { Pregunta } from './entities/pregunta.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Encuesta, Opcion, Pregunta])],
  controllers: [PreguntasController],
  providers: [PreguntasService],
})
export class PreguntasModule {}
