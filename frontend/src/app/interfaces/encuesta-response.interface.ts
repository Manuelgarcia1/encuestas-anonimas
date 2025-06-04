import { Encuesta } from './encuesta.interface';

export interface EncuestasPorTokenResponse {
  data: Encuesta | Encuesta[];
  creadorEmail?: string;
  status: string;
  message: string;
  statusCode: number;
  total: number;
}

export interface TokenParticipacionResponse {
  status: string;
  message: string;
  statusCode: number;
  data: {
    token_respuesta: string;
  };
}

export interface EncuestaDetalleResponse {
  status: string;
  message: string;
  statusCode: number;
  data: Encuesta;
}
