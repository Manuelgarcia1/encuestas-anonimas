export interface RespuestaAbierta {
  id_pregunta: number;
  texto: string;
}

export interface RespuestaOpcion {
  id_pregunta: number;
  id_opciones: number[];
}

export interface EnviarRespuestasPayload {
  respuestas_abiertas: RespuestaAbierta[];
  respuestas_opciones: RespuestaOpcion[];
}

export interface EnviarRespuestasResponse {
  status: string;
  message: string;
  statusCode: number;
}
