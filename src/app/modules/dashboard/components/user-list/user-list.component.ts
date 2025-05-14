import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/users.service';
import { User } from '../../../../core/models/user';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchText: string = '';
  selectedTab: string = 'All';
  loading: boolean = false;
  error: string | null = null;
  
  // Dialog properties
  showConfirmDialog: boolean = false;
  userIdToDelete: number | null = null;
  
  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getUsers()
      .pipe(
        catchError(err => {
          this.error = 'Failed to load users. Please try again later.';
          console.error('Error loading users:', err);
          this.toastService.showError('Failed to load users. Please try again later.');
          return of([]);
        })
      )
      .subscribe(users => {
        this.loading = false;
        this.users = users;
        this.applyFilters();
      });
  }
  
  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.applyFilters();
  }
  
  applyFilters(): void {
    // Start with all users
    let filtered = [...this.users];
    
    // Apply search filter if text is present
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(search)
      );
    }
    
    // Apply user type filter based on selected tab
    if (this.selectedTab !== 'All') {
      filtered = filtered.filter(user => 
        user.user_type.toLowerCase() === this.selectedTab.toLowerCase()
      );
    }
    
    this.filteredUsers = filtered;
  }
  
  onSearch(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  
  // Show the confirm dialog with the user ID to delete
  openConfirmDialog(id: number): void {
    this.userIdToDelete = id;
    this.showConfirmDialog = true;
  }
  
  // Close the dialog without deleting
  cancelDelete(): void {
    this.showConfirmDialog = false;
    this.userIdToDelete = null;
  }
  
  // Confirm and execute the delete
  confirmDelete(): void {
    if (this.userIdToDelete !== null) {
      this.userService.deleteUser(this.userIdToDelete)
        .pipe(
          catchError(err => {
            console.error('Error deleting user:', err);
            this.toastService.showError('Failed to delete user. Please try again.');
            return of(undefined);
          })
        )
        .subscribe(() => {
          this.loadUsers();
          this.toastService.showSuccess('User deleted successfully');
          this.showConfirmDialog = false;
          this.userIdToDelete = null;
        });
    }
  }
}