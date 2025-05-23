// src/respuestas/services/respuestas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encuesta } from '../encuestas/entities/encuesta.entity';
import { Respuesta } from '../respuestas/entities/respuesta.entity';
import { RespuestaOpcion } from '../respuestas-opciones/entities/respuestas-opcione.entity';
import { RespuestaAbierta } from '../respuestas-abiertas/entities/respuestas-abierta.entity';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';

@Injectable()
export class RespuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestaRepository: Repository<Encuesta>,
    @InjectRepository(Respuesta)
    private respuestaRepository: Repository<Respuesta>,
    @InjectRepository(RespuestaOpcion)
    private respuestaOpcionRepository: Repository<RespuestaOpcion>,
    @InjectRepository(RespuestaAbierta)
    private respuestaAbiertaRepository: Repository<RespuestaAbierta>,
  ) {}

  async crearRespuesta(tokenRespuesta: string, dto: CreateRespuestaDto) {
    // 1. Validar token y obtener encuesta
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_respuesta: tokenRespuesta },
    });
    if (!encuesta)
      throw new NotFoundException('Token inválido o encuesta no existe');

    // 2. Crear respuesta maestra (solo guarda el ID de la encuesta)
    const respuesta = await this.respuestaRepository.save({
      encuesta: { id: encuesta.id },
    });

    // 3. Guardar respuestas abiertas
    for (const abierta of dto.respuestas_abiertas) {
      await this.respuestaAbiertaRepository.save({
        respuesta: { id: respuesta.id },
        pregunta: { id: abierta.id_pregunta },
        texto: abierta.texto,
      });
    }

    // 4. Guardar respuestas de opciones
    for (const opcion of dto.respuestas_opciones) {
      for (const idOpcion of opcion.id_opciones) {
        await this.respuestaOpcionRepository.save({
          respuesta: { id: respuesta.id },
          pregunta: { id: opcion.id_pregunta },
          opcion: { id: idOpcion },
        });
      }
    }
  }
}
