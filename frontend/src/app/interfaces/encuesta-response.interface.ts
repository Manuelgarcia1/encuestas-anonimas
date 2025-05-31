import { Encuesta } from './encuesta.interface';

export interface EncuestasPorTokenResponse {
  data: Encuesta | Encuesta[];
  creadorEmail?: string;
  status: string;
  message: string;
  statusCode: number;
}
