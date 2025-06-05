// Project Details Admin Service with Authorization
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../../../core/models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectDetailsAdminService {
  private apiUrl = 'http://127.0.0.1:8000/api/projects/'; 

  constructor(private http: HttpClient) { }
  
  // Helper method to create headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
  }

  getProjectDetails(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${projectId}/`, {
      headers: this.getHeaders()
    });
  }
  
  updateProjectDetails(projectId: number, details: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${projectId}/`, details, {
      headers: this.getHeaders()
    });
  }
}
