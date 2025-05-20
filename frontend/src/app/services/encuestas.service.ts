import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private apiUrl = '/api/v1/encuestas';

  constructor(private http: HttpClient) {}

  getEncuestasPorToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
