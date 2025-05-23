import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private apiUrl = '/api/v1/encuestas/creador';

  constructor(private http: HttpClient) {}

  getEncuestasPorToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${token}`);
  }

  crearEncuesta(data: any, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${token}`, data);
  }

  getEncuestaPorId(token: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${token}/${id}`);
  }

  getTokenDeParticipacionPorId(token: string, id: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${token}/${id}/token-participacion`
    );
  }
}
