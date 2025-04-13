import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Framework } from '../../../core/models/framework';

// Define interfaces based on your Django models
export interface Field {
  id?: number;
  name: string;
  field_type: string;
  project?: number;
}

export interface Project {
  script_url: any;
  id?: number;
  project_name: string;
  model_name: string;
  framework: number;
  user?: number;
  date_creation?: string;
  date_modification?: string;
  script_file?: string | null;
  fields?: Field[];
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  getFrameworks() {
    throw new Error('Method not implemented.');
  }
  updateProject(projectId: number, projectData: { framework: any; projectName: any; modelName: any; fields: any; }) {
    throw new Error('Method not implemented.');
  }
  getProjectScript(projectId: number) {
    throw new Error('Method not implemented.');
  }
  deleteProject(projectIdToDelete: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://127.0.0.1:8000/api/projects';

  constructor(private http: HttpClient) {}

  // Helper method to create headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
  }

  // Get project by ID
  getProjectById(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${projectId}/`, {
      headers: this.getHeaders()
    }).pipe(
      map((project) => {
        console.log('Fetched project details:', project);
        return project;
      }),
      catchError(this.handleError)
    );
  }

  // Create a new project with fields
  createProject(projectData: {
    framework: Framework | null;
    projectName: string;
    modelName: string;
    fields: Field[];
  }): Observable<Project> {
    console.log('Creating project with data:', projectData);

    // Construct the request payload
    const projectPayload = {
      framework: projectData.framework?.id ?? null, // Ensure the framework is passed as an ID
      project_name: projectData.projectName,
      model_name: projectData.modelName,
      fields: projectData.fields, // Include fields in the same request
    };

    return this.http
      .post<Project>(`${this.apiUrl}/`, projectPayload, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((createdProject) => {
          console.log('Project created successfully:', createdProject);
          return createdProject;
        }),
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Log additional details about the response
      console.error('Server error details:', error);
      if (error.error) {
        console.error('Error response body:', error.error);
      }
    }
    console.error(errorMessage);
    return throwError(() => error);
  }

  // Additional methods can be added here as needed
}