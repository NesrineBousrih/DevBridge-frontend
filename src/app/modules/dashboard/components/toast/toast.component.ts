import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  }> = [];
  
  private nextId = 0;
  private subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.toastService.toast$.subscribe(toast => {
        this.showToast(toast);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showToast(toast: ToastMessage): void {
    const id = this.nextId++;
    
    // Add toast to array (initially invisible)
    this.toasts.push({
      id,
      message: toast.message,
      type: toast.type,
      visible: false
    });
    
    // Set timeout to make toast visible (for animation)
    setTimeout(() => {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) {
        this.toasts[index].visible = true;
      }
    }, 50);
    
    // Set timeout to remove toast
    setTimeout(() => {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) {
        this.toasts[index].visible = false;
        
        // Remove toast from array after animation
        setTimeout(() => {
          this.toasts = this.toasts.filter(t => t.id !== id);
        }, 300);
      }
    }, toast.duration || 3000);
  }
}