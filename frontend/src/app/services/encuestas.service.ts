import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private apiUrl = '/api/v1/encuestas/creador';

  constructor(private http: HttpClient) { }

  getEncuestasPorToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${token}`);
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
}
