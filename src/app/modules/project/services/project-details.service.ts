import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Project } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectDetailsService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Navigate to project details page
  navigateToProjectDetails(projectId: number): void {
    this.router.navigate(['/project-details', projectId]);
  }

  // Helper method to create headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    });
  }

  // Get the script file for a specific project
  getProjectScript(projectId: number): Observable<Blob> {
    // Using the script_url directly from the project response
    return this.http.get(`${this.apiUrl}/projects/${projectId}/download-script/`, {
      headers: new HttpHeaders({
        Authorization: `Token ${localStorage.getItem('token')}`
      }),
      responseType: 'blob'
    }).pipe(
      tap(response => console.log('Script response received', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching script:', error);
        if (error.status === 404) {
          console.error('Script URL not found');
        }
        return throwError(() => new Error('Failed to download script: ' + (error.message || 'Unknown error')));
      })
    );
  }

  // Download the script file
  downloadScript(projectId: number): Observable<boolean> {
    return this.getProjectScript(projectId).pipe(
      map(blob => {
        // Check if blob is empty or invalid
        if (!blob || blob.size === 0) {
          console.error('Received empty blob');
          throw new Error('Empty script file received');
        }
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `angular-init-automation-${projectId}.sh`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return true;
      }),
      catchError(error => {
        console.error('Error in download process:', error);
        return throwError(() => error);
      })
    );
  }
}