import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Encuesta } from '../entities/encuesta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { EstadoEncuestaEnum } from '../enums/estado-encuestas.enum';
import { Creador } from '../../creadores/entities/creador.entity';
import { CreateEncuestaDto } from '../dto/create-encuesta.dto';
import { GetEncuestaDto } from '../dto/get-encuesta.dto';
import { LocalCacheService } from '../../cache/local-cache.service';

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
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
  ): Promise<{ data: Encuesta[]; total: number; page: number; limit: number }> {
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
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2️⃣ Si no hay cache, vamos a BD
    await this.findCreador(token_dashboard);
    const [data, total] = await this.encuestasRepository.findAndCount({
      where: { creador: { token_dashboard } },
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: order.toUpperCase() as 'ASC' | 'DESC' },
    });

    const result = { data, total, page, limit };

    // 3️⃣ Guardamos en cache por 60 segundos
    this.cache.set(cacheKey, result, 60);

    return result;
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
    // Usamos la misma clave que en obtenerEncuestasPorTokenCreador
    const page1Key = `encuestas:${token_dashboard}:p1:l10:sid:ASC`;
    this.cache.del(page1Key);
    // Si tienes más combinaciones de page/limit/sort,
    // podrías limpiar todas con flush():
    // this.cache.flush();

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
}
