import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/users.service';
import { User } from '../../../../core/models/user';
import { ToastService } from '../../services/toast.service';
import { catchError } from 'rxjs/operators';
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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
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
        })
      )
      .subscribe(user => {
        this.loading = false;
        if (user) {
          this.userForm.patchValue({
            username: user.username,
            password: user.password
          });
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
        const updatedUser = { ...userData, id: this.userId };
        this.userService.updateUser(updatedUser)
          .pipe(
            catchError(err => {
              console.error('Error updating user:', err);
              this.toastService.showError('Failed to update user');
              this.loading = false;
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading = false;
            this.toastService.showSuccess('User updated successfully');
            this.router.navigate(['/dashboard/users']);
          });
      } else {
        const newUser = new User(
          userData.username,
          userData.password
        );
        this.userService.addUser(newUser)
          .pipe(
            catchError(err => {
              console.error('Error adding user:', err);
              
              this.loading = false;
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading = false;
            this.toastService.showSuccess('User added successfully');
            this.router.navigate(['/dashboard/users']);
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