import { Component, inject, OnDestroy } from '@angular/core';
import { 
  AbstractControl, 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RegisterService, RegisterCredentials } from '../../services/register.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatButtonModule, 
    MatInputModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnDestroy {
  private formBuilder = inject(FormBuilder);
  private registerService = inject(RegisterService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private registerSubscription: Subscription | null = null;

  registerFormGroup: FormGroup;

  constructor() {
    this.registerFormGroup = this.formBuilder.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password strength
  passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return passwordValid ? null : { 'passwordStrength': true };
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  // Helper method to check if a form control is invalid and touched/dirty
  isFieldInvalid(controlName: string): boolean {
    const control = this.registerFormGroup.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Method to get specific error for a form control
  getErrorMessage(controlName: string): string {
    const control = this.registerFormGroup.get(controlName);
    
    if (!control) return '';

    if (control.hasError('required')) {
      return `${this.capitalizeFirstLetter(controlName)} is required`;
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Invalid email address';
    }

    if (controlName === 'password') {
      if (control.hasError('minlength')) {
        return 'Password must be at least 6 characters long';
      }
      if (control.hasError('passwordStrength')) {
        return 'Password must include uppercase, lowercase, number, and special character';
      }
    }

    if (controlName === 'confirmPassword' && control.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  // Utility to capitalize first letter
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  register() {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.registerFormGroup.controls).forEach(field => {
      const control = this.registerFormGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });

    // Check form validity
    if (this.registerFormGroup.invalid) {
      this.snackBar.open('Please correct the errors in the form', 'Close', {
        duration: 3000,
        panelClass: ['error-toast']
      });
      return;
    }

    const { confirmPassword, ...credentials } = this.registerFormGroup.value;

    this.registerSubscription = this.registerService.register(credentials as RegisterCredentials).subscribe({
      next: () => { 
        // Success toast and navigation
        this.snackBar.open('Registration successful! Redirecting to login...', 'Close', {
          duration: 3000,
          panelClass: ['success-toast']
        });

        // Slight delay to allow user to see the toast
        setTimeout(() => {
          this.navigateToLogin();
        }, 1500);
      },
      error: (error) => {
        // Error toast
        const errorMessage = error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-toast']
        });
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['auth/login']);
  }

  ngOnDestroy(): void {
    this.registerSubscription?.unsubscribe();
  }
}