import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectAdminService } from '../../services/project-admin.service';
import { FormsModule } from '@angular/forms';
import { catchError, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { LucideAngularModule } from 'lucide-angular';
import {
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  Eye,
  Edit,
  Download,
  Trash2,
  X
} from 'lucide-angular';
import { Project } from '../../../../core/models/project';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
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
  
  // Lucide icons
  plusIcon = Plus;
  searchIcon = Search;
  refreshCwIcon = RefreshCw;
  alertTriangleIcon = AlertTriangle;
  folderOpenIcon = FolderOpen;
  eyeIcon = Eye;
  editIcon = Edit;
  downloadIcon = Download;
  trash2Icon = Trash2;
  xIcon = X;
  
  constructor(
    private projectService: ProjectAdminService,
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
        take(1),
        catchError(err => {
          this.error = 'Failed to load projects. Please try again later.';
          console.error('Error loading projects:', err);
          this.toastService.showError('Failed to load projects. Please try again later.');
          return of([] as Project[]);
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
    
    // Apply tab filter
    if (this.selectedTab === 'Active') {
      // Define your active filter logic here
      this.filteredProjects = this.filteredProjects.filter(project => project.status === 'active');
    } else if (this.selectedTab === 'Archived') {
      // Define your archived filter logic here
      this.filteredProjects = this.filteredProjects.filter(project => project.status === 'archived');
    }
    
    // Apply search filter
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      this.filteredProjects = this.filteredProjects.filter(project => 
        project.project_name.toLowerCase().includes(search) ||
        (project.username && project.username.toLowerCase().includes(search)) ||
        (project.framework_name && project.framework_name.toLowerCase().includes(search)) ||
        // Add more searchable fields as needed
        project.tables.some(table => table.table_name.toLowerCase().includes(search))
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
          take(1),
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
}