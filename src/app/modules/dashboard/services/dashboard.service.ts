import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api/dashboard';

  constructor(private http: HttpClient) {}

  // Récupérer les informations utilisateur
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/`);
  }

 
  // Récupérer les éléments de la sidebar
  getMenuItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}sidebar/`);
  }
}
