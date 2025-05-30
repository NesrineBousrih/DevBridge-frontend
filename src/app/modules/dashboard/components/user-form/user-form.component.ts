import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/users.service';
import { User } from '../../../../core/models/user';
import { ToastService } from '../../services/toast.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean = false;
  userId: number | null = null;
  loading: boolean = false;
  userTypes: string[] = ['developer', 'admin'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      user_type: ['developer', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        
        // Update password validation - make it optional in edit mode
        this.userForm.get('password')?.setValidators(this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();
        
        this.loadUserData(this.userId);
      }
    });
  }

  loadUserData(id: number): void {
    this.loading = true;
    this.userService.getUserById(id)
      .pipe(
        catchError(err => {
          console.error('Error loading user data:', err);
          this.toastService.showError('Failed to load user data');
          this.loading = false;
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(user => {
        if (user) {
          console.log('Loaded user data:', user);
          // Handle case when user exists but doesn't have user_type yet
          const userType = user.user_type || 'developer';
          
          this.userForm.patchValue({
            username: user.username,
            user_type: userType,
            email: user.email || ''
          });
          
          // For security reasons, don't populate the password field
          // Instead, make it optional in edit mode
          this.userForm.get('password')?.setValidators([]);
          this.userForm.get('password')?.updateValueAndValidity();
        } else {
          this.toastService.showError('User not found');
          this.router.navigate(['/dashboard/users']);
        }
      });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const userData = this.userForm.value;
      
      if (this.isEditMode && this.userId) {
        // Handle empty password in edit mode - don't send it if empty
        const updatedUser: User = {
          id: this.userId,
          username: userData.username,
          user_type: userData.user_type,
          email: userData.email,
          password: '',
          current_password: ''
        };
        
        // Only include password if it's provided
        if (userData.password && userData.password.trim() !== '') {
          updatedUser.password = userData.password;
          updatedUser.current_password = userData.password;
        }
        
        console.log('Sending update with data:', updatedUser);
        
        this.userService.updateUser(updatedUser)
          .pipe(
            catchError(err => {
              console.error('Error updating user:', err);
              this.toastService.showError('Failed to update user');
              return of(null);
            }),
            finalize(() => this.loading = false)
          )
          .subscribe(response => {
            if (response) {
              console.log('Update successful:', response);
              this.toastService.showSuccess('User updated successfully');
              this.router.navigate(['/dashboard/users']);
            }
          });
      } else {
        const newUser = new User(
          userData.username,
          userData.password,
          userData.user_type,
          userData.email
        );
        
        this.userService.addUser(newUser)
          .pipe(
            catchError(err => {
              console.error('Error adding user:', err);
              this.toastService.showError('Failed to add user');
              return of(null);
            }),
            finalize(() => this.loading = false)
          )
          .subscribe(response => {
            if (response) {
              this.toastService.showSuccess('User added successfully');
              this.router.navigate(['/dashboard/users']);
            }
          });
      }
    } else {
      this.markFormGroupTouched(this.userForm);
      this.toastService.showWarning('Please fix the validation errors');
    }
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