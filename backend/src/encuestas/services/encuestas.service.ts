import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Encuesta } from '../entities/encuesta.entity';
import { Pregunta } from '../../preguntas/entities/pregunta.entity';
import { Opcion } from '../../opciones/entities/opcion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { v4 } from 'uuid';
import { EstadoEncuestaEnum } from '../enums/estado-encuestas.enum';
import { Creador } from '../../creadores/entities/creador.entity';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { GetEncuestaDto } from '../dto/get-encuesta.dto';
import { LocalCacheService } from '../../cache/local-cache.service';
import { UpdateEncuestaDto } from '../dto/update-encuesta.dto';

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
    @InjectRepository(Pregunta)
    private readonly preguntaRepository: Repository<Pregunta>,
    @InjectRepository(Opcion)
    private readonly opcionRepository: Repository<Opcion>,
    @InjectRepository(Creador)
    private creadoresRepository: Repository<Creador>,
    private cache: LocalCacheService,
  ) {}

  private async findCreador(token_dashboard: string): Promise<Creador> {
    const creador = await this.creadoresRepository.findOne({
      where: { token_dashboard },
    });
    if (!creador) {
      throw new NotFoundException('Creador no encontrado.');
    }
    return creador;
  }

  private clearCacheForEncuestas(token_dashboard: string): void {
    const indexKey = `encuestas:index:${token_dashboard}`;
    const keys = this.cache.get<string[]>(indexKey) ?? [];

    for (const key of keys) {
      this.cache.del(key);
    }

    this.cache.del(indexKey);
  }

  async obtenerEncuestasPorTokenCreador(
    token_dashboard: string,
    getEncuestaDto: GetEncuestaDto,
  ): Promise<{
    data: Encuesta[];
    total: number;
    page: number;
    limit: number;
    creadorEmail: string;
  }> {
    // 🔢 Extraemos parámetros de paginación y ordenamiento del DTO
    const {
      page = 1, // Página actual (por defecto 1)
      limit = 10, // Cantidad de encuestas por página (por defecto 10)
      sortBy = 'id', // Campo por el que se ordena (por defecto id)
      order = 'ASC', // Orden (ascendente o descendente)
    } = getEncuestaDto;

    // 🔐 Clave única para la cache de esta combinación de parámetros
    const cacheKey = `encuestas:${token_dashboard}:p${page}:l${limit}:s${sortBy}:${order}`;

    // 🗂️ Clave del índice que contiene todos los keys de cache para este dashboard
    const indexKey = `encuestas:index:${token_dashboard}`;

    // 1️⃣ Intentamos obtener los resultados desde la cache
    const cached = this.cache.get<{
      data: Encuesta[];
      total: number;
      page: number;
      limit: number;
      creadorEmail: string;
    }>(cacheKey);

    if (cached) {
      // Si existe en cache, lo devolvemos directamente (ahorramos llamada a la base de datos)
      console.log('datos obtenidos desde cache:', cacheKey);
      return cached;
    }

    // 2️⃣ Si no está en cache, buscamos en la base de datos

    // Primero obtenemos al creador por el token del dashboard
    const creador = await this.findCreador(token_dashboard);

    // Luego buscamos todas las encuestas del creador, con paginación y orden
    const [data, total] = await this.encuestasRepository.findAndCount({
      where: { creador: { token_dashboard } },
      take: limit, // Límite por página
      skip: (page - 1) * limit, // Desplazamiento según la página
      order: { [sortBy]: order.toUpperCase() as 'ASC' | 'DESC' },
      relations: ['respuestas'], // Incluimos la relación con respuestas
    });

    // Creamos el objeto resultado con toda la información requerida
    const result = { data, total, page, limit, creadorEmail: creador.email };

    // 3️⃣ Guardamos el resultado en la cache por 60 segundos
    this.cache.set(cacheKey, result, 60);

    // 4️⃣ Guardamos el cacheKey en el índice de keys del dashboard, si no está aún
    // Esto permite borrar luego todas las keys asociadas al dashboard si es necesario
    const storedKeys = (await this.cache.get<string[]>(indexKey)) ?? [];
    if (!storedKeys.includes(cacheKey)) {
      storedKeys.push(cacheKey);
      this.cache.set(indexKey, storedKeys);
    }

    // 5️⃣ Devolvemos los datos obtenidos de la base
    return result;
  }

  async obtenerEncuestaPorTokenCreadorYId(
    token_dashboard: string,
    encuestaId: number,
  ): Promise<Encuesta> {
    // 1) verificar creador por token
    const creador = await this.creadoresRepository.findOne({
      where: { token_dashboard },
    });
    if (!creador) {
      throw new NotFoundException('Token de creador inválido.');
    }

    // 2) obtener encuesta que pertenezca a ese creador
    const encuesta = await this.encuestasRepository.findOne({
      where: {
        id: encuestaId, // número, no string
        creador: {
          // anidado sobre la relación ManyToOne
          token_dashboard: token_dashboard, // propiedad camelCase de tu entidad Creador
        },
      },
      relations: ['preguntas', 'preguntas.opciones'], //carga preguntas y opciones
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada para este creador.');
    }

    return encuesta;
  }

  async crearEncuesta(
    dto: CreateEncuestaDto,
    token_dashboard: string,
  ): Promise<Encuesta> {
    const creador = await this.findCreador(token_dashboard);

    const encuesta = this.encuestasRepository.create({
      ...dto,
      tipo: EstadoEncuestaEnum.BORRADOR,
      token_respuesta: v4(),
      token_resultados: v4(),
      creador,
    });

    const saved = await this.encuestasRepository.save(encuesta);
    this.clearCacheForEncuestas(token_dashboard);

    return saved;
  }

  async obtenerTokenRespuesta(
    tokenDashboard: string,
    idEncuesta: number,
  ): Promise<string> {
    const encuesta = await this.encuestasRepository.findOne({
      where: {
        id: idEncuesta,
        creador: { token_dashboard: tokenDashboard },
      },
      relations: ['creador'],
    });
    if (!encuesta) {
      throw new NotFoundException(
        `Encuesta ${idEncuesta} no encontrada o no pertenece al creador.`,
      );
    }
    return encuesta.token_respuesta;
  }

  /**
   * Busca la encuesta por token_respuesta e incluye preguntas y sus opciones.
   * Lanza 404 si no existe.
   */

  async findEncuestaByToken(token: string): Promise<Encuesta> {
    const encuesta = await this.encuestasRepository.findOne({
      where: { token_respuesta: token },
      relations: ['preguntas', 'preguntas.opciones'],
    });
    if (!encuesta) {
      throw new NotFoundException('Token de respuesta inválido.');
    }
    return encuesta;
  }

  // Cambia el estado de una encuesta a PUBLICADA

  async publicarEncuesta(
    token_dashboard: string,
    encuestaId: number,
  ): Promise<EstadoEncuestaEnum> {
    // Reutilizamos el método que valida creador y carga la encuesta con sus relaciones
    const encuesta = await this.obtenerEncuestaPorTokenCreadorYId(
      token_dashboard,
      encuestaId,
    );

    // Cambiamos el enum de estado
    encuesta.tipo = EstadoEncuestaEnum.PUBLICADA;

    // Guardamos el cambio
    const updated = await this.encuestasRepository.save(encuesta);

    this.clearCacheForEncuestas(token_dashboard);

    return updated.tipo;
  }

  // Editar encuesta
  async updateEncuesta(
    token_dashboard: string,
    encuestaId: number,
    dto: UpdateEncuestaDto,
  ): Promise<Encuesta> {
    // 1. Cargar encuesta y validar creador
    const encuesta = await this.encuestasRepository.findOne({
      where: { id: encuestaId, creador: { token_dashboard } },
      relations: ['preguntas', 'preguntas.opciones'],
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada o creador inválido.');
    }

    // 2. Renombrar encuesta si se indica
    if (dto.nombre !== undefined) {
      encuesta.nombre = dto.nombre;
      await this.encuestasRepository.save(encuesta);
    }

    // 3. Eliminar preguntas completas si se especifica
    if (dto.eliminarPreguntas?.length) {
      const ids = dto.eliminarPreguntas;

      await this.opcionRepository
        .createQueryBuilder()
        .delete()
        .from(Opcion)
        .where('id_pregunta IN (:...ids)', { ids })
        .execute();

      await this.preguntaRepository.delete({ id: In(ids) });
    }

    // 3.b Eliminar preguntas que no estén en el array
    const idsEnviados = (dto.preguntas ?? [])
      .filter((p) => p.id)
      .map((p) => p.id);
    if (idsEnviados.length > 0) {
      const preguntasAEliminar = await this.preguntaRepository.find({
        where: {
          encuesta: { id: encuestaId },
          id: Not(In(idsEnviados)),
        },
        relations: ['opciones'],
      });

      const idsAEliminar = preguntasAEliminar.map((p) => p.id);
      if (idsAEliminar.length > 0) {
        await this.opcionRepository.delete({
          pregunta: { id: In(idsAEliminar) },
        });
        await this.preguntaRepository.delete({ id: In(idsAEliminar) });
      }
    }

    // 4. Procesar cada pregunta del DTO
    for (const pq of dto.preguntas ?? []) {
      const esEdicion = pq.id !== undefined && pq.id !== null;

      if (esEdicion) {
        // 4.a) Buscar la pregunta existente
        const pregunta = await this.preguntaRepository.findOne({
          where: { id: pq.id, encuesta: { id: encuestaId } },
          relations: ['opciones'],
        });

        if (!pregunta) {
          console.warn('⚠️ Pregunta no encontrada para edición:', pq.id);
          continue;
        }

        // 4.b) Actualizar texto y tipo SIEMPRE si se indica
        if (pq.texto !== undefined) {
          pregunta.texto = pq.texto;
        }
        if (pq.tipo !== undefined) {
          pregunta.tipo = pq.tipo;
        }
        await this.preguntaRepository.save(pregunta);

        // 4.c) Eliminar opciones específicas si se indica eliminarOpciones
        if (
          Array.isArray(pq.eliminarOpciones) &&
          pq.eliminarOpciones.length > 0
        ) {
          await this.opcionRepository.delete({
            id: In(pq.eliminarOpciones),
            pregunta: { id: pregunta.id },
          });
        }

        // 4.d) Reemplazo total de opciones si se incluye el array completo
        if (Array.isArray(pq.opciones)) {
          // Primero eliminamos TODAS las opciones existentes
          await this.opcionRepository.delete({ pregunta: { id: pregunta.id } });

          // Luego insertamos todas las nuevas opciones
          for (const oDto of pq.opciones) {
            if (!oDto.texto || oDto.numero == null) continue;

            const nuevaOpcion = this.opcionRepository.create({
              texto: oDto.texto,
              numero: oDto.numero,
              pregunta: { id: pregunta.id },
            });

            await this.opcionRepository.save(nuevaOpcion);
          }
        }
      } else {
        // 4.e) Crear nueva pregunta
        const cantidadPreguntas = await this.preguntaRepository.count({
          where: { encuesta: { id: encuestaId } },
        });

        const nuevaPregunta = this.preguntaRepository.create({
          numero: cantidadPreguntas + 1,
          texto: pq.texto!,
          tipo: pq.tipo!,
          encuesta,
        });

        const savedPregunta = await this.preguntaRepository.save(nuevaPregunta);

        for (const oDto of pq.opciones ?? []) {
          if (!oDto.texto || oDto.numero == null) continue;

          const nuevaOpcion = this.opcionRepository.create({
            texto: oDto.texto,
            numero: oDto.numero,
            pregunta: savedPregunta,
          });

          await this.opcionRepository.save(nuevaOpcion);
        }
      }
    }

    // 5. Limpiar caché asociada al dashboard
    this.clearCacheForEncuestas(token_dashboard);

    // 6. Devolver la encuesta actualizada con relaciones
    return this.encuestasRepository.findOneOrFail({
      where: { id: encuestaId },
      relations: ['preguntas', 'preguntas.opciones'],
    });
  }
}
