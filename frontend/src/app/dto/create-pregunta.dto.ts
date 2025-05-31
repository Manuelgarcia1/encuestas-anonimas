import { TiposRespuestaEnum } from '../enums/tipos-respuesta.enum';
import { CreateOpcioneDto } from './create-opcione.dto';

export interface CreatePreguntaDto {
  numero: number;
  texto: string;
  tipo: TiposRespuestaEnum;
  opciones?: CreateOpcioneDto[];
}
