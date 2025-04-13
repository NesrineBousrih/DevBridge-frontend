import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private BASE_URL = 'http://127.0.0.1:8000/api/';

  login(credentials: LoginCredentials): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.BASE_URL}login/`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirige après déconnexion
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): Observable<{ username: string }> {
    return this.http.get<{ username: string }>(`${this.BASE_URL}user/`);
  }
}
