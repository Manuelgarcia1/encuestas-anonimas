import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEncuestaDTO } from '../dto/create-encuesta.dto';
import { Encuesta } from '../entities/encuesta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { TokenTipoEnum } from '../enums/token-tipo.enum';

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
  ) {}

  async crearEncuesta(dto: CreateEncuestaDTO): Promise<{
    id: number;
    codigoRespuesta: string;
    codigoResultados: string;
  }> {
    const encuesta: Encuesta = this.encuestasRepository.create({
      ...dto,
      token_respuesta: v4(),
      token_resultados: v4(),
    });

    const encuestaGuardada = await this.encuestasRepository.save(encuesta);

    return {
      id: encuestaGuardada.id,
      codigoRespuesta: encuestaGuardada.token_respuesta,
      codigoResultados: encuestaGuardada.token_resultados,
    };
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
