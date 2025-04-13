// project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService, Project } from '../../../project/services/project.service';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchText: string = '';
  selectedTab: string = 'All';
  loading: boolean = false;
  error: string | null = null;
  
  // Dialog properties
  showConfirmDialog: boolean = false;
  projectIdToDelete: number | null = null;
  
  constructor(
    private projectService: ProjectService,
    private toastService: ToastService
  ) {}
  
  ngOnInit(): void {
    this.loadProjects();
  }
  
  loadProjects(): void {
    this.loading = true;
    this.error = null;
    
    this.projectService.getProjects()
      .pipe(
        catchError(err => {
          this.error = 'Failed to load projects. Please try again later.';
          console.error('Error loading projects:', err);
          this.toastService.showError('Failed to load projects. Please try again later.');
          return of([]);
        })
      )
      .subscribe((projects: Project[]) => {
        this.loading = false;
        this.projects = projects;
        this.applyFilters();
      });
  }
  
  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.applyFilters();
  }
  
  applyFilters(): void {
    this.filteredProjects = [...this.projects];
    
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      this.filteredProjects = this.filteredProjects.filter(project => 
        project.project_name.toLowerCase().includes(search) ||
        project.model_name.toLowerCase().includes(search)
      );
    }
  }
  
  onSearch(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  
  openConfirmDialog(id: number): void {
    this.projectIdToDelete = id;
    this.showConfirmDialog = true;
  }
  
  cancelDelete(): void {
    this.showConfirmDialog = false;
    this.projectIdToDelete = null;
  }
  
  confirmDelete(): void {
    if (this.projectIdToDelete !== null) {
      this.projectService.deleteProject(this.projectIdToDelete)
        .pipe(
          catchError(err => {
            console.error('Error deleting project:', err);
            this.toastService.showError('Failed to delete project. Please try again.');
            return of(undefined);
          })
        )
        .subscribe(() => {
          this.loadProjects();
          this.toastService.showSuccess('Project deleted successfully');
          this.showConfirmDialog = false;
          this.projectIdToDelete = null;
        });
    }
  }
  
  downloadScript(projectId: number): void {
    this.projectService.getProjectScript(projectId)
      .pipe(
        catchError(err => {
          console.error('Error downloading script:', err);
          this.toastService.showError('Failed to download script. Please try again.');
          return of(undefined);
        })
      )
      .subscribe((result: any) => {
        if (result) {
          this.toastService.showSuccess('Script downloaded successfully');
        }
      });
  }
}