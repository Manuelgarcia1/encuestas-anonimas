import { Option } from '../interfaces/opcion.interface';
import { TiposRespuestaEnum } from '../enums/tipos-respuesta.enum';

export interface Pregunta {
  id?: number; 
  _tempId?: number;
  text: string;
  type: string;
  active: boolean;
  showMenu?: boolean;
  options?: Option[];
  numero?: number; 
  respuestas?: string;
}


