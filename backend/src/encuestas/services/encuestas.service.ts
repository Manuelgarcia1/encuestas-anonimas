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

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
    @InjectRepository(Creador)
    private creadoresRepository: Repository<Creador>,
  ) {}

  // Obtener encuestas por token_dashboard
  async obtenerEncuestasPorTokenCreador(
    token_dashboard: string,
  ): Promise<Encuesta[]> {
    const creador = await this.creadoresRepository.findOne({
      where: { token_dashboard },
    });

    if (!creador) {
      throw new NotFoundException('Creador no encontrado.');
    }

    return this.encuestasRepository.find({
      where: { creador: { id: creador.id } }, // Usamos el ID directamente
      relations: ['preguntas'], // <- Aquí cargamos las preguntas de cada encuesta
    });
  }

  // Crear una encuesta
  async crearEncuesta(
    dto: CreateEncuestaDto,
    token_dashboard: string,
  ): Promise<Encuesta> {
    const creador = await this.creadoresRepository.findOne({
      where: { token_dashboard },
    });

    if (!creador) {
      throw new NotFoundException('Creador no encontrado.');
    }

    const encuesta = this.encuestasRepository.create({
      ...dto,
      tipo: EstadoEncuestaEnum.BORRADOR,
      token_respuesta: v4(),
      token_resultados: v4(),
      creador,
    });
    return await this.encuestasRepository.save(encuesta);
  }
}
