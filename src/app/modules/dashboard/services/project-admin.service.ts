// Project Admin Service with Authorization
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../../../core/models/project';



@Injectable({
  providedIn: 'root'
})
export class ProjectAdminService {
  private apiUrl = 'http://127.0.0.1:8000/api/projects/'; // Fixed URL with trailing slash

  constructor(private http: HttpClient) { }

  // Helper method to create headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}${id}/`, {
      headers: this.getHeaders()
    });
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, {
      headers: this.getHeaders()
    });
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}${id}/`, project, {
      headers: this.getHeaders()
    });
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, {
      headers: this.getHeaders()
    });
  }

  getProjectScript(projectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${projectId}/script/`, { 
      headers: this.getHeaders(),
      responseType: 'blob' as 'json'
    });
  }
}