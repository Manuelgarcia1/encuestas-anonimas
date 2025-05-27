import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Encuesta } from '../entities/encuesta.entity';
import { Pregunta } from '../../preguntas/entities/pregunta.entity';
import { Opcion } from '../../opciones/entities/opcion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      order = 'ASC',
    } = getEncuestaDto;

    const cacheKey = `encuestas:${token_dashboard}:p${page}:l${limit}:s${sortBy}:${order}`;

    // 1️⃣ Intentamos leer de cache
    const cached = this.cache.get<{
      data: Encuesta[];
      total: number;
      page: number;
      limit: number;
      creadorEmail: string;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // 1 traigo al creador (incluye email)
    const creador = await this.findCreador(token_dashboard);

    // 2️⃣ Si no hay cache, vamos a BD y traemos las encuestas
    await this.findCreador(token_dashboard);
    const [data, total] = await this.encuestasRepository.findAndCount({
      where: { creador: { token_dashboard } },
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: order.toUpperCase() as 'ASC' | 'DESC' },
    });

    const result = { data, total, page, limit, creadorEmail: creador.email };

    // 3️⃣ Guardamos en cache por 60 segundos
    this.cache.set(cacheKey, result, 60);

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

    // INVALIDAR CACHE de la lista de encuestas de este creador
    this.cache.flush();
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

  /**
   * Cambia el estado de una encuesta a PUBLICADA
   */
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

    // Opcional: invalidar cache de listados si usas cache
    const page1Key = `encuestas:${token_dashboard}:p1:l10:sid:ASC`;
    this.cache.del(page1Key);

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

    // 2. Renombrar si viene nombre en el DTO
    if (dto.nombre !== undefined) {
      encuesta.nombre = dto.nombre;
      await this.encuestasRepository.save(encuesta);
    }

    // 3. Full-replace: si todas las preguntas entrantes no tienen id
    if (
      Array.isArray(dto.preguntas) &&
      dto.preguntas.length > 0 &&
      dto.preguntas.every((p) => p.id === undefined)
    ) {
      // 3.a) Recoger todos los IDs de preguntas actuales
      const preguntaIds = encuesta.preguntas.map((p) => p.id);

      // 3.b) Borrar primero todas las opciones que apuntan a esas preguntas
      if (preguntaIds.length) {
        await this.opcionRepository
          .createQueryBuilder()
          .delete()
          .from(Opcion)
          .where('id_pregunta IN (:...ids)', { ids: preguntaIds })
          .execute();
      }

      // 3.c) Borrar todas las preguntas de esta encuesta
      await this.preguntaRepository.delete({ encuesta: { id: encuestaId } });

      // 3.d) Recrear cada pregunta y sus opciones
      for (const [idx, pDto] of dto.preguntas.entries()) {
        const nuevaPreg = this.preguntaRepository.create({
          numero: idx + 1,
          texto: pDto.texto!,
          tipo: pDto.tipo!,
          encuesta,
        });
        const savedPreg = await this.preguntaRepository.save(nuevaPreg);

        for (const oDto of pDto.opciones ?? []) {
          const nuevaOp = this.opcionRepository.create({
            texto: oDto.texto!,
            numero: oDto.numero!,
            pregunta: savedPreg,
          });
          await this.opcionRepository.save(nuevaOp);
        }
      }

      // 3.e) Devolver encuesta recargada
      return this.encuestasRepository.findOneOrFail({
        where: { id: encuestaId },
        relations: ['preguntas', 'preguntas.opciones'],
      });
    }

    // 4. Lógica mixta: eliminación puntual, edición y creación

    // 4.a) Eliminar preguntas puntuales si vienen
    if (dto.eliminarPreguntas?.length) {
      const ids = dto.eliminarPreguntas;
      // eliminar opciones de esas preguntas
      await this.opcionRepository
        .createQueryBuilder()
        .delete()
        .from(Opcion)
        .where('id_pregunta IN (:...ids)', { ids })
        .execute();
      // luego eliminar las preguntas
      await this.preguntaRepository.delete({ id: In(ids) });
    }

    // 4.b) Recorrer cada pregunta para editar o crear
    for (const pq of dto.preguntas ?? []) {
      if (pq.id) {
        // 4.b.i) Editar pregunta existente
        const pregunta = await this.preguntaRepository.findOne({
          where: { id: pq.id, encuesta: { id: encuestaId } },
          relations: ['opciones'],
        });
        if (!pregunta) continue;
        if (pq.texto !== undefined) pregunta.texto = pq.texto;
        await this.preguntaRepository.save(pregunta);

        // 4.b.ii) Si vienen eliminarOpciones, borrar las opciones actuales
        if (pq.eliminarOpciones?.length) {
          await this.opcionRepository.delete({
            id: In(pq.eliminarOpciones),
          });
        }
        // 4.b.iii) Editar o crear opciones según venga `id`
        for (const oDto of pq.opciones ?? []) {
          if (oDto.id) {
            // — editar existente
            const opcion = await this.opcionRepository.findOne({
              where: { id: oDto.id },
            });
            if (opcion) {
              if (oDto.texto !== undefined) opcion.texto = oDto.texto;
              if (oDto.numero !== undefined) opcion.numero = oDto.numero;
              await this.opcionRepository.save(opcion);
              continue;
            }
            // si no existe, caerá a creación
          }
          // — crear nueva opción
          const nuevaOp = this.opcionRepository.create({
            texto: oDto.texto!,
            numero: oDto.numero!,
            pregunta,
          });
          await this.opcionRepository.save(nuevaOp);
        }
      } else {
        // 4.b.iv) Crear pregunta nueva y sus opciones
        const nuevaPregunta = this.preguntaRepository.create({
          numero: encuesta.preguntas.length + 1,
          texto: pq.texto!,
          tipo: pq.tipo!,
          encuesta,
        });
        const savedPreg = await this.preguntaRepository.save(nuevaPregunta);

        for (const oDto of pq.opciones ?? []) {
          const nuevaOp = this.opcionRepository.create({
            texto: oDto.texto!,
            numero: oDto.numero!,
            pregunta: savedPreg,
          });
          await this.opcionRepository.save(nuevaOp);
        }
      }
    }

    // 5) Invalidar cache de listado de encuestas
    this.cache.flush();

    // 6) Devolvemos la encuesta recargada
    return this.encuestasRepository.findOneOrFail({
      where: { id: encuestaId },
      relations: ['preguntas', 'preguntas.opciones'],
    });
  }
}
