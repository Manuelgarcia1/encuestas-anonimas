import { TiposRespuestaEnum } from '../enums/tipos-respuesta.enum';
import { CreateOpcionesDto } from './create.opciones.dto';

export interface CreatePreguntasDto {
  numero?: number;
  texto: string;
  tipo: TiposRespuestaEnum;
  opciones?: CreateOpcionesDto[];
}
