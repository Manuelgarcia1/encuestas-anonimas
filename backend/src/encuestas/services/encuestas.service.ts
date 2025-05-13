import { BadRequestException, Injectable } from '@nestjs/common';
import { Encuesta } from '../entities/encuesta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { TokenTipoEnum } from '../enums/token-tipo.enum';
import { EstadoEncuestaEnum } from '../enums/estado-encuestas.enum';
import { Creador } from '../../creadores/entities/creador.entity';

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
    @InjectRepository(Creador)
    private creadoresRepository: Repository<Creador>,
  ) {}

  // encuestas.service.ts
  async obtenerEncuestasPorTokenCreador(
    token_dashboard: string,
  ): Promise<Encuesta[]> {
    return this.encuestasRepository.find({
      where: { creador: { token_dashboard } },
    });
  }

  async crearEncuesta(
    nombre: string,
    token_dashboard: string,
  ): Promise<Encuesta> {
    const creador = await this.creadoresRepository.findOneOrFail({
      where: { token_dashboard },
    });

    const encuesta = this.encuestasRepository.create({
      nombre,
      tipo: EstadoEncuestaEnum.BORRADOR,
      token_respuesta: v4(),
      token_resultados: v4(),
      creador,
    });

    return this.encuestasRepository.save(encuesta);
  }

  async obtenerEncuesta(
    id: number,
    codigo: string,
    codigoTipo: TokenTipoEnum.RESPUESTA | TokenTipoEnum.RESULTADOS,
  ): Promise<Encuesta> {
    const query = this.encuestasRepository
      .createQueryBuilder('encuesta')
      .innerJoinAndSelect('encuesta.preguntas', 'pregunta')
      .leftJoinAndSelect('pregunta.opciones', 'preguntaOpcion')
      .where('encuesta.id = :id', { id });

    switch (codigoTipo) {
      case TokenTipoEnum.RESPUESTA:
        query.andWhere('encuesta.codigoRespuesta = :codigo', { codigo });
        break;

      case TokenTipoEnum.RESULTADOS:
        query.andWhere('encuesta.codigoResultados = :codigo', { codigo });
        break;
    }

    query.orderBy('pregunta.numero', 'ASC');
    query.addOrderBy('preguntaOpcion.numero', 'ASC');

    const encuesta = await query.getOne();

    if (!encuesta) {
      throw new BadRequestException('Datos de encuesta no válidos');
    }

    return encuesta;
  }
}
