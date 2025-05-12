import { Creador } from '../creadores/entities/creador.entity';
import { Module } from '@nestjs/common';
import { EncuestasService } from './services/encuestas.service';
import { EncuestasController } from './controller/encuestas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encuesta } from './entities/encuesta.entity';
import { Pregunta } from './../preguntas/entities/pregunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Creador, Encuesta, Pregunta])],
  controllers: [EncuestasController],
  providers: [EncuestasService],
})
export class EncuestasModule {}
