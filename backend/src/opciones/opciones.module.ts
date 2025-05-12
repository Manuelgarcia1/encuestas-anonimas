import { Module } from '@nestjs/common';
import { OpcionesService } from './services/opciones.service';
import { OpcionesController } from './controller/opciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opcion } from './entities/opcion.entity';
import { Pregunta } from './../preguntas/entities/pregunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Opcion, Pregunta])],
  controllers: [OpcionesController],
  providers: [OpcionesService],
})
export class OpcionesModule {}
