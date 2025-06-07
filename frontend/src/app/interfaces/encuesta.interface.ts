import { Pregunta } from '../interfaces/pregunta.interface';
import { TiposRespuestaEnum } from '../enums/tipos-respuesta.enum';

export interface Encuesta {
  id?: number;
  nombre: string;
  preguntas: Pregunta[];
  respuestas: any[];
  createdAt?: string;
  tipo?: TiposRespuestaEnum;
  token_respuesta?: string;
  token_resultados?: string;
}
