// Modified user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/users.service';
import { User } from '../../../../core/models/user';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadUser(id);
      }
    });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user || null;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        console.error('Error loading user:', error);
        this.toastService.showError('Failed to load user details');
      }
    });
  }

  onEdit(): void {
    if (this.user) {
      this.router.navigate(['/dashboard/users/edit', this.user.id]);
    }
  }

  onDelete(): void {
    if (this.user && confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(this.user.id!).subscribe({
        next: () => {
          this.toastService.showSuccess('User deleted successfully');
          this.router.navigate(['/dashboard/users']);
        },
        error: (error) => {
          this.error = 'Failed to delete user';
          console.error('Error deleting user:', error);
          this.toastService.showError('Failed to delete user');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users']);
  }
}