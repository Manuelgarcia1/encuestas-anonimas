import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEncuestaDto } from '../dto/create.encuesta.dto';
import { Encuesta } from '../interfaces/encuesta.interface';
import { EncuestasPorTokenResponse, TokenParticipacionResponse } from '../interfaces/encuesta-response.interface';
import { EnviarRespuestasPayload, EnviarRespuestasResponse } from '../interfaces/respuestas.interface';
import { ResultadosPorTokenResultadosResponse } from '../interfaces/resultados.interface';

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
  ): Observable<EncuestasPorTokenResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    return this.http.get<EncuestasPorTokenResponse>(`${this.apiUrl}/${token}`, { params });
  }

  crearEncuesta(data: CreateEncuestaDto, token: string): Observable<{ data: Encuesta }> {
    return this.http.post<{ data: Encuesta }>(`${this.apiUrl}/${token}`, data);
  }

  getEncuestaPorId(token: string, id: number): Observable<{ data: Encuesta }> {
    return this.http.get<{ data: Encuesta }>(`${this.apiUrl}/${token}/encuesta/${id}`);
  }

  getTokenParticipacion(tokenDashboard: string, encuestaId: number): Observable<TokenParticipacionResponse> {
    return this.http.get<TokenParticipacionResponse>(`${this.apiUrl}/${tokenDashboard}/${encuestaId}/token-participacion`);
  }

  getSurveyByToken(token: string): Observable<{ data: Encuesta }> {
    return this.http.get<{ data: Encuesta }>(`/api/v1/encuestas/participacion/${token}`);
  }

  updateEncuesta(token: string, encuestaId: number, payload: CreateEncuestaDto): Observable<{ data: Encuesta }> {
    return this.http.put<{ data: Encuesta }>(`${this.apiUrl}/${token}/encuesta/${encuestaId}/actualizar`, payload);
  }

  publicarEncuesta(token: string, encuestaId: number): Observable<{ status: string; message: string; statusCode: number }> {
    return this.http.patch<{ status: string; message: string; statusCode: number }>(`${this.apiUrl}/${token}/encuesta/${encuestaId}/publicar`, {});
  }

  enviarRespuestas(token: string, payload: EnviarRespuestasPayload): Observable<EnviarRespuestasResponse> {
    return this.http.post<EnviarRespuestasResponse>(`${this.respuestasApiUrl}/${token}`, payload);
  }

  getResultadosPorTokenResultados(token_resultados: string): Observable<ResultadosPorTokenResultadosResponse> {
    return this.http.get<ResultadosPorTokenResultadosResponse>(`${this.respuestasApiUrl}/resultados/${token_resultados}`);
  }

  getEstadisticasPorTokenResultados(token_resultados: string): Observable<any> {
    return this.http.get<any>(`${this.respuestasApiUrl}/resultados/${token_resultados}/estadisticas`);
  }
}
