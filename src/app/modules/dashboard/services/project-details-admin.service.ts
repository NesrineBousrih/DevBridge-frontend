import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProjectDetailsAdminService {
  private apiUrl = `${environment.apiUrl}/project-details`;

  constructor(private http: HttpClient) { }

  getProjectDetails(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  updateProjectDetails(projectId: number, details: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}`, details);
  }
}