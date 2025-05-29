import { Creador } from '../creadores/entities/creador.entity';
import { Module } from '@nestjs/common';
import { EncuestasService } from './services/encuestas.service';
import { EncuestasController } from './controller/encuestas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encuesta } from './entities/encuesta.entity';
import { Pregunta } from './../preguntas/entities/pregunta.entity';
import { CreadoresModule } from './../creadores/creadores.module';
import { LocalCacheService } from '../cache/local-cache.service';
import { Opcion } from '../opciones/entities/opcion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Creador, Encuesta, Pregunta, Opcion]),
    CreadoresModule,
  ],
  controllers: [EncuestasController],
  providers: [EncuestasService, LocalCacheService],
  exports: [EncuestasService, TypeOrmModule],
})
export class EncuestasModule {}
