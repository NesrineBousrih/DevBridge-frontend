import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Field {
  id?: number;
  name: string;
  dataType: string;
  isRequired: boolean;
}

export interface Project {
  id?: number;
  project_name: string;
  model_name: string;
  description?: string;
  status: string;
  framework: {
    id: number;
    name: string;
  };
  created_at?: Date;
  fields?: Field[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectAdminService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProjectScript(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}/script`, { 
      responseType: 'blob' as 'json'
    });
  }
}