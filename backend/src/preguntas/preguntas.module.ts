import { Module } from '@nestjs/common';
import { PreguntasService } from './services/preguntas.service';
import { PreguntasController } from './controller/preguntas.controller';
import { Pregunta } from './entities/preguntas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Pregunta])],
  controllers: [PreguntasController],
  providers: [PreguntasService],
})
export class PreguntasModule {}
