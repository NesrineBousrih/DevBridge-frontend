import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users'; // Base API URL

  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/', user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}/`, user);
  }

  updateUserProfile(user: User): Observable<User> {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Authorization': `Token ${token}`
    };
    
    return this.http.put<User>(`${this.apiUrl}/update_me/`, user, { headers });
  }
  
  // Implement the method for handling profile photo upload with FormData
  updateUserProfileWithPhoto(formData: FormData): Observable<User> {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Authorization': `Token ${token}`
    };
    
    // Note: Don't set Content-Type header manually - it will be set automatically 
    // with the correct boundary for multipart/form-data when using FormData
    
    return this.http.put<User>(`${this.apiUrl}/update_me/`, formData, { headers });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}/`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/by-username/${username}/`);
  }
  
  getCurrentUserProfile(): Observable<User> {
    const token = localStorage.getItem('token');
  
    const headers = {
      'Authorization': `Token ${token}`
    };
    
    return this.http.get<User>(`${this.apiUrl}/me/`, { headers });
  }
 
}