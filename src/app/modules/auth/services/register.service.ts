import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private http = inject(HttpClient);
  private BASE_URL = 'http://127.0.0.1:8000/api/';

  register(credentials: RegisterCredentials): Observable<any> {
    return this.http.post<any>(this.BASE_URL + 'register/', credentials).pipe(
      tap((result: any) => {
        if (result.token) {
          console.log('Token reçu:', result.token);
          // Vous pouvez stocker le token ici si nécessaire
        } else {
          console.warn('Aucun token reçu dans la réponse.');
        }
      })
    );
  }
}
