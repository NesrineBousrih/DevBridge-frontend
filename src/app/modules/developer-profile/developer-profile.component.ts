import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../dashboard/services/users.service';
import { User } from '../../core/models/user';
import { LoginService } from '../auth/services/login.service';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-developer-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    LucideAngularModule,
    MatSnackBarModule
  ],
  templateUrl: './developer-profile.component.html',
  styleUrls: ['./developer-profile.component.scss']
})
export class DeveloperProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading: boolean = true;
  currentUser: User | null = null;
  changePassword: boolean = false;
  error: string | null = null;
  userId: number | null = null;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  photoPreview: string | null = null;
  profilePhotoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private loginService: LoginService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      profilePhoto: [''],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.loginService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Load the current user profile using the authentication token
    this.loadCurrentUserProfile();
  }

  // Show toast message
  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`toast-${type}`]
    });
  }

  loadCurrentUserProfile(): void {
    this.loading = true;
    
    // Use the new endpoint to directly get the current user profile using the token
    this.userService.getCurrentUserProfile()
      .pipe(
        catchError(error => {
          console.error('Error loading user profile:', error);
          this.showToast('Failed to load user profile', 'error');
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.userId = user.id || null;
          this.profileForm.patchValue({
            username: user.username || '',
            email: user.email || ''
          });
        } else {
          this.showToast('User not found', 'error');
          this.router.navigate(['/login']);
        }
      });
  }

  toggleChangePassword(): void {
    this.changePassword = !this.changePassword;
    
    if (this.changePassword) {
      this.profileForm.get('currentPassword')?.setValidators([Validators.required]);
      this.profileForm.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.profileForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.profileForm.get('currentPassword')?.clearValidators();
      this.profileForm.get('newPassword')?.clearValidators();
      this.profileForm.get('confirmPassword')?.clearValidators();
      
      // Reset password fields
      this.profileForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    
    this.profileForm.get('currentPassword')?.updateValueAndValidity();
    this.profileForm.get('newPassword')?.updateValueAndValidity();
    this.profileForm.get('confirmPassword')?.updateValueAndValidity();
  }

  onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      this.profilePhotoFile = file;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.photoPreview = null;
      this.profilePhotoFile = null;
    }
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.username) {
      return 'U';
    }
    
    return this.currentUser.username.charAt(0).toUpperCase();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.showToast('Please fix the validation errors', 'warning');
      return;
    }

    if (this.changePassword) {
      if (this.profileForm.get('newPassword')?.value !== this.profileForm.get('confirmPassword')?.value) {
        this.showToast('New password and confirmation do not match', 'error');
        return;
      }
    }

    this.loading = true;
    
    if (!this.userId) {
      this.showToast('User ID not found', 'error');
      this.loading = false;
      return;
    }

    // Prepare update messages based on changes
    const usernameChanged = this.profileForm.get('username')?.value !== this.currentUser?.username;
    const emailChanged = this.profileForm.get('email')?.value !== this.currentUser?.email;
    const passwordChanged = this.changePassword && this.profileForm.get('newPassword')?.value;
    const photoChanged = !!this.profilePhotoFile;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('id', this.userId.toString());
    formData.append('username', this.profileForm.get('username')?.value);
    formData.append('email', this.profileForm.get('email')?.value);
    formData.append('user_type', this.currentUser?.user_type || 'developer');
    
    if (this.profilePhotoFile) {
      formData.append('profile_photo', this.profilePhotoFile);
    }
    
    if (this.changePassword && this.profileForm.get('newPassword')?.value) {
      formData.append('password', this.profileForm.get('newPassword')?.value);
      formData.append('current_password', this.profileForm.get('currentPassword')?.value);
    }
    
    this.userService.updateUserProfileWithPhoto(formData)
      .pipe(
        catchError(err => {
          console.error('Error updating profile:', err);
          if (err.error?.detail) {
            this.showToast(err.error.detail, 'error');
          } else {
            this.showToast('Failed to update profile', 'error');
          }
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((response: User | null) => {
        if (response) {
          // Show specific success messages based on what was updated
          if (usernameChanged) {
            this.showToast('Username updated successfully');
          }
          if (emailChanged) {
            this.showToast('Email updated successfully');
          }
          if (passwordChanged) {
            this.showToast('Password updated successfully');
          }
          if (photoChanged) {
            this.showToast('Profile photo updated successfully');
          }
          
          // If nothing specific was changed, show a generic success message
          if (!usernameChanged && !emailChanged && !passwordChanged && !photoChanged) {
            this.showToast('Profile updated successfully');
          }
          
          // Reset password fields if they were being changed
          if (this.changePassword) {
            this.profileForm.patchValue({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            this.toggleChangePassword();
          }
          
          // Reload user profile to get updated data including the new profile photo URL
          this.loadCurrentUserProfile();
        }
      });
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}