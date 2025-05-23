// src/respuestas/services/respuestas.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    // 1. Obtener encuesta
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_respuesta: tokenRespuesta },
      relations: ['preguntas', 'preguntas.opciones'],
    });
    if (!encuesta) {
      throw new NotFoundException('Token inválido o encuesta no existe');
    }

    // 2. Clasificar preguntas
    const preguntasAbiertas = encuesta.preguntas.filter(
      (p) => !p.opciones || p.opciones.length === 0,
    );
    const preguntasOpciones = encuesta.preguntas.filter(
      (p) => p.opciones && p.opciones.length > 0,
    );

    const idsPreguntasAbiertas = new Set(preguntasAbiertas.map((p) => p.id));
    const idsPreguntasOpciones = new Set(preguntasOpciones.map((p) => p.id));
    const idsOpciones = new Set(
      preguntasOpciones.flatMap((p) => p.opciones.map((o) => o.id)),
    );

    // ✅ 3. Validar duplicados
    const preguntasRespondidas = new Set<number>();

    // 🔍 4. Validar preguntas abiertas
    for (const abierta of dto.respuestas_abiertas) {
      const id = abierta.id_pregunta;
      if (!idsPreguntasAbiertas.has(id)) {
        throw new BadRequestException(
          `La pregunta ${id} no es una pregunta abierta válida`,
        );
      }
      if (preguntasRespondidas.has(id)) {
        throw new BadRequestException(`La pregunta ${id} ya fue respondida`);
      }
      preguntasRespondidas.add(id);
    }

    // 🔍 5. Validar preguntas de opción
    for (const opcion of dto.respuestas_opciones) {
      const id = opcion.id_pregunta;
      if (!idsPreguntasOpciones.has(id)) {
        throw new BadRequestException(
          `La pregunta ${id} no es una pregunta de opciones válida`,
        );
      }
      if (preguntasRespondidas.has(id)) {
        throw new BadRequestException(`La pregunta ${id} ya fue respondida`);
      }
      preguntasRespondidas.add(id);

      for (const idOpcion of opcion.id_opciones) {
        if (!idsOpciones.has(idOpcion)) {
          throw new BadRequestException(
            `La opción ${idOpcion} no pertenece a esta encuesta`,
          );
        }
      }
    }

    // ✅ 6. Verificar que todas las preguntas fueron respondidas
    const idsEsperados = new Set(encuesta.preguntas.map((p) => p.id));
    if (preguntasRespondidas.size !== idsEsperados.size) {
      const faltantes = [...idsEsperados].filter(
        (id) => !preguntasRespondidas.has(id),
      );
      throw new BadRequestException(
        `Faltan respuestas para las preguntas: ${faltantes.join(', ')}`,
      );
    }

    // 🧾 7. Guardar respuesta maestra
    const respuesta = await this.respuestaRepository.save({
      encuesta: { id: encuesta.id },
    });

    // 8. Guardar respuestas abiertas
    for (const abierta of dto.respuestas_abiertas) {
      await this.respuestaAbiertaRepository.save({
        respuesta: { id: respuesta.id },
        pregunta: { id: abierta.id_pregunta },
        texto: abierta.texto,
      });
    }

    // 9. Guardar respuestas opciones
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

  async obtenerResultados(tokenResultados: string) {
    // 1. Obtener encuesta con relaciones
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_resultados: tokenResultados },
      relations: [
        'preguntas',
        'preguntas.opciones',
        'respuestas',
        'respuestas.respuestasAbiertas',
        'respuestas.respuestasAbiertas.pregunta',
        'respuestas.opciones',
        'respuestas.opciones.opcion',
      ],
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    // 2. Inicializar estructura de resultados
    const resultados = {
      encuesta: {
        id: encuesta.id,
        nombre: encuesta.nombre,
        totalRespuestas: encuesta.respuestas?.length || 0, // Usamos las respuestas cargadas
        preguntas: [] as any[],
      },
    };

    // 3. Procesar cada pregunta
    for (const pregunta of encuesta.preguntas || []) {
      const preguntaResultado = {
        id: pregunta.id,
        texto: pregunta.texto,
        tipo: pregunta.tipo,
        respuestas: [] as any[],
      };

      if (pregunta.tipo === 'ABIERTA') {
        // Procesar respuestas abiertas
        const respuestas = (encuesta.respuestas || [])
          .flatMap((r) => r.respuestasAbiertas || [])
          .filter((ra) => ra?.pregunta?.id === pregunta.id) // ← Usa la relación pregunta.id
          .map((ra) => ra.texto);

        preguntaResultado.respuestas = respuestas;
      } else {
        // Procesar opciones múltiples
        preguntaResultado.respuestas = (pregunta.opciones || []).map(
          (opcion) => {
            const count = (encuesta.respuestas || [])
              .flatMap((r) => r.opciones || [])
              .filter((ro) => ro?.opcion?.id === opcion.id).length;

            return {
              opcion: opcion.texto,
              count,
              porcentaje:
                resultados.encuesta.totalRespuestas > 0
                  ? Math.round(
                      (count / resultados.encuesta.totalRespuestas) * 100,
                    )
                  : 0,
            };
          },
        );
      }

      resultados.encuesta.preguntas.push(preguntaResultado);
    }

    return resultados;
  }
}
