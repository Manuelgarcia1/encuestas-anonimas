export interface RespuestaIndividualAPregunta {
  pregunta: string;
  tipo: string;
  opciones?: string[];
  texto?: string;
}

export interface ConjuntoDeRespuestas {
  respuestaId: number;
  fecha: string;
  respuestas: RespuestaIndividualAPregunta[];
}

export interface ApiResultadosIndividuales {
  encuesta: {
    id: number;
    nombre: string;
    totalRespuestas: number;
  };
  respuestas: ConjuntoDeRespuestas[];
}

export interface ResultadosPorTokenResultadosResponse {
  status: string;
  message: string;
  statusCode: number;
  data: ApiResultadosIndividuales;
}
