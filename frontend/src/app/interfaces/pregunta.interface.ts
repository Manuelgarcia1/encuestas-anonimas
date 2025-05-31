import { Opcion } from './opcion.interace';
import { TiposRespuestaEnum } from '../enums/tipos-respuesta.enum';

export interface Pregunta {
  id: number;
  texto: string;
  tipo: TiposRespuestaEnum;
  opciones?: Opcion[];
}
