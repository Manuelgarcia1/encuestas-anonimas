import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestAccessResponse } from '../interfaces/request-access-response.interface';

@Injectable({ providedIn: 'root' })
export class CreadoresService {
  private apiUrl = '/api/v1/creadores';

  constructor(private http: HttpClient) {}

  requestAccess(email: string): Observable<RequestAccessResponse> {
    return this.http.post<RequestAccessResponse>(this.apiUrl, { email });
  }
}
