import { Pregunta } from './pregunta.interface';
import { TiposRespuestaEnum } from '../enums/tipos-respuesta.enum';

export interface Encuesta {
  id?: number;
  nombre: string;
  preguntas: Pregunta[];
  createdAt?: string;
  tipo?: TiposRespuestaEnum;
}
