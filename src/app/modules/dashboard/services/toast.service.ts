// src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  success(arg0: string) {
    throw new Error('Method not implemented.');
  }
  private toastSubject = new Subject<ToastMessage>();
  public toast$ = this.toastSubject.asObservable();

  showSuccess(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration: number = 3000): void {
    this.show(message, 'error', duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  showWarning(message: string, duration: number = 3000): void {
    this.show(message, 'warning', duration);
  }

  private show(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number): void {
    this.toastSubject.next({ message, type, duration });
  }
}