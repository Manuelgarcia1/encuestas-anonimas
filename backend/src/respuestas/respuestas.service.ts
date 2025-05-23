// src/respuestas/services/respuestas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // 1. Validar token y obtener encuesta con preguntas y opciones
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_respuesta: tokenRespuesta },
      relations: ['preguntas', 'preguntas.opciones'],
    });
    if (!encuesta) {
      throw new NotFoundException('Token inválido o encuesta no existe');
    }

    // 2. Crear set de IDs válidos
    const idsPreguntas = new Set(encuesta.preguntas.map((p) => p.id));
    const idsOpciones = new Set(
      encuesta.preguntas.flatMap((p) => p.opciones?.map((o) => o.id) || [])
    );

    // 3. Crear respuesta maestra
    const respuesta = await this.respuestaRepository.save({
      encuesta: { id: encuesta.id },
    });

    // 4. Guardar respuestas abiertas (con validación)
    for (const abierta of dto.respuestas_abiertas) {
      if (!idsPreguntas.has(abierta.id_pregunta)) {
        throw new BadRequestException(`La pregunta ${abierta.id_pregunta} no pertenece a esta encuesta`);
      }

      await this.respuestaAbiertaRepository.save({
        respuesta: { id: respuesta.id },
        pregunta: { id: abierta.id_pregunta },
        texto: abierta.texto,
      });
    }

    // 5. Guardar respuestas de opciones (con validación)
    for (const opcion of dto.respuestas_opciones) {
      if (!idsPreguntas.has(opcion.id_pregunta)) {
        throw new BadRequestException(`La pregunta ${opcion.id_pregunta} no pertenece a esta encuesta`);
      }

      for (const idOpcion of opcion.id_opciones) {
        if (!idsOpciones.has(idOpcion)) {
          throw new BadRequestException(`La opción ${idOpcion} no pertenece a esta encuesta`);
        }

        await this.respuestaOpcionRepository.save({
          respuesta: { id: respuesta.id },
          pregunta: { id: opcion.id_pregunta },
          opcion: { id: idOpcion },
        });
      }
    }
  }
}
