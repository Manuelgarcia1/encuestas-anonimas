import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


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

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private apiUrl = '/api/v1/encuestas/creador';
  private respuestasApiUrl = '/api/v1/respuestas';

  constructor(private http: HttpClient) { }

  // MODIFICADO para aceptar parámetros de paginación
  getEncuestasPorToken(
    token: string,
    page: number = 1, // Página por defecto
    limit: number = 10, // Límite por defecto
    sortBy: string = 'createdAt', // Orden por defecto (ajusta según tu backend, 'id' o 'createdAt' son comunes)
    order: string = 'DESC' // Orden descendente para que las más nuevas aparezcan primero
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<any>(`${this.apiUrl}/${token}`, { params });
  }

  crearEncuesta(data: any, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${token}`, data);
  }

  getEncuestaPorId(token: string, id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${token}/encuesta/${id}`);
  }

  getTokenParticipacion(tokenDashboard: string, encuestaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tokenDashboard}/${encuestaId}/token-participacion`);
  }

  getSurveyByToken(token: string): Observable<any> {
    return this.http.get(`/api/v1/encuestas/participacion/${token}`);
  }

  updateEncuesta(token: string, encuestaId: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${token}/encuesta/${encuestaId}/actualizar`, payload);
  }

  publicarEncuesta(token: string, encuestaId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${token}/encuesta/${encuestaId}/publicar`, {});
  }

  enviarRespuestas(token: string, payload: EnviarRespuestasPayload): Observable<EnviarRespuestasResponse> {
    return this.http.post<EnviarRespuestasResponse>(`/api/v1/respuestas/${token}`, payload);
  }

  getResultadosPorTokenResultados(token_resultados: string): Observable<any> {
    return this.http.get<any>(`${this.respuestasApiUrl}/resultados/${token_resultados}`);
  }
}
