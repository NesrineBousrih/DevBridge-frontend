import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Framework } from '../../../core/models/framework';
import { Project } from '../../../core/models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  updateTables(projectId: number, arg1: string, arg2: { table_name: any; }) {
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

  // Get all projects
  getProjects(): Observable<Project[]> {
    return this.http
      .get<Project[]>(`${this.apiUrl}/`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((projects) => {
          console.log('Fetched projects:', projects);
          return projects;
        }),
        catchError(this.handleError)
      );
  }

  // Get project by ID
  getProjectById(projectId: number): Observable<Project> {
    return this.http
      .get<Project>(`${this.apiUrl}/${projectId}/`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((project) => {
          console.log('Fetched project details:', project);
          return project;
        }),
        catchError(this.handleError)
      );
  }

  // Create a new project with tables
  createProject(projectData: {
    projectType?: string;
    framework: Framework | null;
    projectName: string;
    tables: Array<{
      table_name: string;
      fields: Array<{
        name: string;
        type: string;
      }>;
    }>;
    generatedFromDatabase?: boolean;
    dbConnectionDetails?: any;
  }): Observable<Project> {
    console.log('Creating project with data:', projectData);

    // Construct the request payload
    const projectPayload = {
      project_type: projectData.projectType,
      framework: projectData.framework?.id ?? null,
      project_name: projectData.projectName,
      tables: projectData.tables,
      generated_from_database: projectData.generatedFromDatabase || false,
      db_connection_details: projectData.dbConnectionDetails || null
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

  // Update existing project
  updateProject(
    projectId: number,
    projectData: {
      framework: any;
      projectName: any;
      tables: Array<{
        table_name: string;
        fields: Array<{
          name: string;
          type: string;
        }>;
      }>;
    }
  ): Observable<Project> {
    const projectPayload = {
      framework: projectData.framework?.id ?? null,
      project_name: projectData.projectName,
      tables: projectData.tables
    };

    return this.http
      .put<Project>(`${this.apiUrl}/${projectId}/`, projectPayload, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((updatedProject) => {
          console.log('Project updated successfully:', updatedProject);
          return updatedProject;
        }),
        catchError(this.handleError)
      );
  }

  // Delete project
  deleteProject(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}/`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  // Add this method to your ProjectService class

  // Add this method to your existing ProjectService class

  updateProjectTable(
    projectId: number,
    payload: {
      operation: string;
      table_data: {
        table_name: string;
        fields?: Array<{
          name: string;
          type: string;
        }>;
      };
    }
  ): Observable<any> {
    console.log('Updating project table with ID:', projectId);
    console.log('Payload:', payload);
  
    return this.http
      .post<any>(
        `${this.apiUrl}/${projectId}/`,
        payload, // Send the payload as the request body
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => {
          console.log(`Table ${payload.operation} successful:`, response);
          return response;
        }),
        catchError(this.handleError)
      );
  }
  
  // Connect to database
  connectToDatabase(connectionData: {
    host: string;
    port: string;
    databaseName: string;
    username: string;
    password: string;
  }): Observable<{ tables: string[] }> {
    return this.http
      .post<{ tables: string[] }>(`${this.apiUrl}/connect_database/`, connectionData, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          console.log('Database connection successful:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get table structure
  getTableStructure(
    connectionData: {
      host: string;
      port: string;
      databaseName: string;
      username: string;
      password: string;
    }, 
    tableName: string
  ): Observable<{ tables_structure: { [key: string]: Array<{ name: string; type: string }> } }> {
    const payload = {
      ...connectionData,
      table_name: tableName
    };
    
    return this.http
      .post<{ tables_structure: { [key: string]: Array<{ name: string; type: string }> } }>(
        `${this.apiUrl}/get_table_structure/`, 
        payload, 
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => {
          console.log('Fetched table structure:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get project script
  getProjectScript(projectId: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${projectId}/script/`, {
        headers: this.getHeaders(),
        responseType: 'blob'
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Get frameworks
  getFrameworks(): Observable<Framework[]> {
    return this.http
      .get<Framework[]>('http://127.0.0.1:8000/api/frameworks/', {
        headers: this.getHeaders(),
      })
      .pipe(
        map((frameworks) => {
          console.log('Fetched frameworks:', frameworks);
          return frameworks;
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
}