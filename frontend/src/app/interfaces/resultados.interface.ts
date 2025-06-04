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

export interface EstadisticaOpcion {
  opcion: string;
  cantidad: number;
}

export interface EstadisticaPregunta {
  pregunta: string;
  tipo: string;
  estadisticas: EstadisticaOpcion[];
}

export interface EstadisticasPorTokenResultadosResponse {
  status: string;
  message: string;
  statusCode: number;
  data: {
    encuesta: {
      id: number;
      nombre: string;
      preguntas: any[]; 
      totalRespuestas: number;
    };
    totalRespuestas: number;
    porPregunta: EstadisticaPregunta[];
  };
}

