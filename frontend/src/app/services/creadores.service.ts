import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreadoresService {
  private apiUrl = '/api/v1/creadores';

  constructor(private http: HttpClient) {}

  requestAccess(email: string): Observable<any> {
    return this.http.post(this.apiUrl, { email });
  }
}
