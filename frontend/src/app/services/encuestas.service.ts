import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private apiUrlCreador = '/api/v1/encuestas/creador';
  private apiUrlParticipacion = '/api/v1/encuestas/participacion';

  constructor(private http: HttpClient) { }

  getEncuestasPorToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCreador}/${token}`);
  }

  crearEncuesta(data: any, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCreador}/${token}`, data);
  }

  getEncuestaPorId(token: string, id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCreador}/${token}/encuesta/${id}`);
  }

  getTokenParticipacion(tokenDashboard: string, encuestaId: number): Observable<any> {
    return this.http.get(`${this.apiUrlCreador}/${tokenDashboard}/${encuestaId}/token-participacion`);
  }

  getSurveyByToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrlParticipacion}/${token}`);
  }

  updateEncuesta(data: any, token: string, id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrlCreador}/${token}/encuesta/${id}/actualizar`, data);
  }

  enviarRespuestas(token: string, respuestas: any): Observable<any> {
  return this.http.post(`${this.apiUrlParticipacion}/${token}/responder`, respuestas);
}
}
