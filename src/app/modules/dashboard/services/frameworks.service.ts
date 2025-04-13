
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Framework } from '../../../core/models/framework';

@Injectable({
  providedIn: 'root'
})
export class FrameworksService {
  createProject(projectData: { projectType: ("frontend" | "backend") | null; framework: Framework | null; projectName: any; fields: any; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://127.0.0.1:8000/api/frameworks'
  constructor(private http: HttpClient) {}
  
  // Get all frameworks
  getFrameworks(): Observable<Framework[]> {
    return this.http.get<Framework[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Get framework by ID
  getFrameworkById(id: number): Observable<Framework> {
    return this.http.get<Framework>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Add new framework
  addFramework(framework: Framework): Observable<Framework> {
    // For file uploads, use FormData
    const formData = new FormData();
    formData.append('name', framework.name);
    
    if (framework.short_description) {
      formData.append('short_description', framework.short_description);
    }
    
    // Handle logo as a File object if it exists
    if (framework.logo && framework.logo instanceof File) {
      formData.append('logo', framework.logo);
    }
    
    return this.http.post<Framework>(`${this.apiUrl}/`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Update framework
  updateFramework(framework: Framework): Observable<Framework> {
    // For file uploads, use FormData
    const formData = new FormData();
    formData.append('name', framework.name);
    
    if (framework.short_description) {
      formData.append('short_description', framework.short_description);
    }
    
    // Handle logo as a File object if it exists
    if (framework.logo && framework.logo instanceof File) {
      formData.append('logo', framework.logo);
    }
    
    return this.http.put<Framework>(`${this.apiUrl}/${framework.id}/`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Delete framework
  deleteFramework(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`)
      .pipe(
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
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  getFrameworksByType(type: string): Observable<Framework[]> {
    return this.http.get<Framework[]>(`${this.apiUrl}?type=${type}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}
