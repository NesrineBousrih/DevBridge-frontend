import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FrameworksService } from '../../services/frameworks.service';
import { Framework } from '../../../../core/models/framework';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-framework-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './framework-list.component.html',
  styleUrls: ['./framework-list.component.scss'],
})
export class FrameworkListComponent implements OnInit {
  frameworks: Framework[] = [];
  filteredFrameworks: Framework[] = [];
  searchText: string = '';
  loading: boolean = false;
  error: string | null = null;

  // Confirmation dialog properties
  showConfirmDialog: boolean = false;
  frameworkIdToDelete: number | null = null;

  constructor(private frameworkService: FrameworksService) {}

  ngOnInit(): void {
    this.loadFrameworks();
  }

  loadFrameworks(): void {
    this.loading = true;
    this.error = null;

    this.frameworkService
      .getFrameworks()
      .pipe(
        catchError((err) => {
          this.error = 'Failed to load frameworks. Please try again later.';
          console.error('Error loading frameworks:', err);
          return of([]);
        })
      )
      .subscribe((data) => {
        this.loading = false;
        this.frameworks = data;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    this.filteredFrameworks = [...this.frameworks];

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      this.filteredFrameworks = this.filteredFrameworks.filter((framework) =>
        framework.name.toLowerCase().includes(search)
      );
    }
  }

  onSearch(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  // Open delete confirmation dialog
  openConfirmDialog(id: number): void {
    this.frameworkIdToDelete = id;
    this.showConfirmDialog = true;
  }

  // Close dialog
  cancelDelete(): void {
    this.showConfirmDialog = false;
    this.frameworkIdToDelete = null;
  }

  // Confirm and execute delete
  confirmDelete(): void {
    if (this.frameworkIdToDelete !== null) {
      this.frameworkService
        .deleteFramework(this.frameworkIdToDelete)
        .pipe(
          catchError((err) => {
            console.error('Error deleting framework:', err);
            return of(undefined);
          })
        )
        .subscribe(() => {
          this.loadFrameworks();
          this.showConfirmDialog = false;
          this.frameworkIdToDelete = null;
        });
    }
  }
}
