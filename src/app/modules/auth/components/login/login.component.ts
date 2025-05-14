import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService, LoginCredentials } from '../../services/login.service';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  private formBuilder = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private loginSubscription: Subscription | null = null;

  hidePassword = true;
  
  loginFormGroup = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });
  invalidCredentials = false;

  login() {
    if (this.loginFormGroup.invalid) {
      this.snackBar.open('Please fill in all fields.', 'Close', { duration: 3000, panelClass: ['error-toast'] });
      return;
    }

    const credentials: LoginCredentials = {
      username: this.loginFormGroup.value.username ?? '',
      password: this.loginFormGroup.value.password ?? ''
    };

    this.loginSubscription = this.loginService.login(credentials).subscribe({
      next: (response) => {
        this.snackBar.open('Login successful!', 'Close', { duration: 3000, panelClass: ['success-toast'] });
        
        // Route based on user_type
        if (response.user_type === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (response.user_type === 'developer') {
          this.router.navigate(['/home']);
        } else {
          // Default route if user_type is not recognized
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.invalidCredentials = true;
        this.snackBar.open(error?.error?.message || 'Invalid credentials. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-toast']
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }
}