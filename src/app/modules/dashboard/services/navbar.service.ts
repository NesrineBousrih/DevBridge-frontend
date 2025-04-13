import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  // Récupérer les informations de l'utilisateur connecté
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/`);
  }

  // Récupérer les notifications
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}notifications/`);
  }

  // Déconnexion
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}logout/`, {});
  }
}
