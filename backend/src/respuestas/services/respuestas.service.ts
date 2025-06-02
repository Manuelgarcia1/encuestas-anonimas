import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encuesta } from '../../encuestas/entities/encuesta.entity';
import { Respuesta } from '../../respuestas/entities/respuesta.entity';
import { RespuestaOpcion } from '../../respuestas-opciones/entities/respuestas-opcione.entity';
import { RespuestaAbierta } from '../../respuestas-abiertas/entities/respuestas-abierta.entity';
import { CreateRespuestaDto } from './../dto/create-respuesta.dto';
import { EncuestasService } from '../../encuestas/services/encuestas.service';

/**
 * Servicio encargado de manejar el almacenamiento de respuestas
 * a encuestas y la obtención de resultados consolidados.
 */
@Injectable()
export class RespuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestaRepository: Repository<Encuesta>,
    private readonly encuestasService: EncuestasService,
    @InjectRepository(Respuesta)
    private respuestaRepository: Repository<Respuesta>,
    @InjectRepository(RespuestaOpcion)
    private respuestaOpcionRepository: Repository<RespuestaOpcion>,
    @InjectRepository(RespuestaAbierta)
    private respuestaAbiertaRepository: Repository<RespuestaAbierta>,
  ) {}

  /**
   * Guarda una nueva respuesta a una encuesta, validando que todas las
   * preguntas hayan sido respondidas correctamente.
   */
  async crearRespuesta(tokenRespuesta: string, dto: CreateRespuestaDto) {
    // Paso 1: Obtener encuesta por token
    const encuesta =
      await this.encuestasService.findEncuestaByToken(tokenRespuesta);
    if (!encuesta) {
      throw new NotFoundException('Token inválido o encuesta no existe');
    }

    // Paso 2: Clasificar preguntas según si tienen opciones o son abiertas
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

    // Paso 3: Inicializar conjunto para validar duplicados
    const preguntasRespondidas = new Set<number>();

    // Paso 4: Validar que las preguntas abiertas existan y no se repitan
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

    // Paso 5: Validar preguntas con opciones múltiples
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

      // Validar que las opciones elegidas existan en la encuesta
      for (const idOpcion of opcion.id_opciones) {
        if (!idsOpciones.has(idOpcion)) {
          throw new BadRequestException(
            `La opción ${idOpcion} no pertenece a esta encuesta`,
          );
        }
      }
    }

    // Paso 6: Verificar que se respondieron todas las preguntas
    const idsEsperados = new Set(encuesta.preguntas.map((p) => p.id));
    if (preguntasRespondidas.size !== idsEsperados.size) {
      const faltantes = [...idsEsperados].filter(
        (id) => !preguntasRespondidas.has(id),
      );
      throw new BadRequestException(
        `Faltan respuestas para las preguntas: ${faltantes.join(', ')}`,
      );
    }

    // Paso 7: Guardar respuesta principal (referencia a la encuesta)
    const respuesta = await this.respuestaRepository.save({
      encuesta: { id: encuesta.id },
    });

    // Paso 8: Guardar respuestas abiertas asociadas a la respuesta
    for (const abierta of dto.respuestas_abiertas) {
      await this.respuestaAbiertaRepository.save({
        respuesta: { id: respuesta.id },
        pregunta: { id: abierta.id_pregunta },
        texto: abierta.texto,
      });
    }

    // Paso 9: Guardar respuestas de opción múltiple
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

  /**
   * Obtiene un resumen de resultados de una encuesta, incluyendo
   * respuestas abiertas y conteo/porcentaje de selección por opción.
   */
  async obtenerResultados(tokenResultados: string) {
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
        'respuestas.opciones.opcion.pregunta',
      ],
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    const respuestasCompletas = encuesta.respuestas.map((respuesta) => {
      const respuestasPorPregunta = encuesta.preguntas.map((pregunta) => {
        if (pregunta.tipo === 'ABIERTA') {
          const respuestaAbierta = respuesta.respuestasAbiertas?.find(
            (ra) => ra.pregunta?.id === pregunta.id,
          );
          return {
            pregunta: pregunta.texto,
            tipo: pregunta.tipo,
            texto: respuestaAbierta?.texto ?? null,
          };
        } else {
          const opcionesSeleccionadas = respuesta.opciones
            ?.filter((ro) => ro.opcion?.pregunta?.id === pregunta.id)
            .map((ro) => ro.opcion.texto);
          return {
            pregunta: pregunta.texto,
            tipo: pregunta.tipo,
            opciones: opcionesSeleccionadas,
          };
        }
      });

      return {
        respuestaId: respuesta.id,
        fecha: respuesta.fecha_respuesta,
        respuestas: respuestasPorPregunta,
      };
    });

    return {
      encuesta: {
        id: encuesta.id,
        nombre: encuesta.nombre,
        totalRespuestas: respuestasCompletas.length,
      },
      respuestas: respuestasCompletas,
    };
  }

  async obtenerResultadosPorEncuesta(tokenResultados: string) {
    // Paso 1: Buscar la encuesta por su token de resultados
    // y cargar todas las relaciones necesarias para procesar los resultados
    const encuesta = await this.encuestaRepository.findOne({
      where: { token_resultados: tokenResultados },
      relations: [
        'preguntas',
        'preguntas.opciones', // Opciones posibles por pregunta
        'respuestas',
        'respuestas.respuestasAbiertas', // Respuestas abiertas escritas
        'respuestas.respuestasAbiertas.pregunta',
        'respuestas.opciones', // Respuestas seleccionadas en preguntas cerradas
        'respuestas.opciones.opcion', // Referencia a la opción elegida
      ],
    });

    // Si no se encuentra la encuesta, lanzar una excepción
    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    // Paso 2: Inicializar la estructura base del resultado
    const resultados = {
      encuesta: {
        id: encuesta.id,
        nombre: encuesta.nombre,
        totalRespuestas: encuesta.respuestas?.length || 0, // Total de formularios respondidos
        preguntas: [] as any[], // Aquí se irán agregando los resultados por pregunta
      },
    };

    // Paso 3: Recorrer cada pregunta de la encuesta
    for (const pregunta of encuesta.preguntas || []) {
      // Estructura para almacenar los resultados de una pregunta
      const preguntaResultado = {
        id: pregunta.id,
        texto: pregunta.texto,
        tipo: pregunta.tipo,
        respuestas: [] as any[], // Se llenará según si es abierta o cerrada
      };

      if (pregunta.tipo === 'ABIERTA') {
        // Si la pregunta es abierta, se listan los textos escritos por los encuestados
        const respuestas = (encuesta.respuestas || [])
          .flatMap((r) => r.respuestasAbiertas || []) // Agrupa todas las respuestas abiertas
          .filter((ra) => ra?.pregunta?.id === pregunta.id) // Filtra las de esta pregunta
          .map((ra) => ra.texto); // Se queda solo con el texto escrito

        // Se agregan al resultado de la pregunta
        preguntaResultado.respuestas = respuestas;
      } else {
        // Si es una pregunta cerrada, se cuentan cuántas veces fue elegida cada opción
        preguntaResultado.respuestas = (pregunta.opciones || []).map(
          (opcion) => {
            // Cuenta cuántas veces esta opción fue seleccionada
            const count = (encuesta.respuestas || [])
              .flatMap((r) => r.opciones || []) // Agrupa todas las selecciones
              .filter((ro) => ro?.opcion?.id === opcion.id).length; // Filtra las de esta opción

            return {
              opcion: opcion.texto, // Texto de la opción
              count, // Cantidad de veces seleccionada
              porcentaje:
                resultados.encuesta.totalRespuestas > 0
                  ? Math.round(
                      (count / resultados.encuesta.totalRespuestas) * 100,
                    )
                  : 0, // Porcentaje sobre el total de respuestas
            };
          },
        );
      }

      // Agrega el resultado de esta pregunta al array de preguntas
      resultados.encuesta.preguntas.push(preguntaResultado);
    }

    // Paso final: retornar el resumen de resultados
    return resultados;
  }
}
