// home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Folder, FolderPlus, Plus, Search, User, Settings, LogOut, Trash2 } from 'lucide-angular';
import { Project } from '../../../../core/models/project';
import { ProjectService } from '../../../project/services/project.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchQuery: string = '';
  showConfirmDialog: boolean = false;
  projectIdToDelete: number | null = null;
  
  // Add user property
  user = {
    username: 'Default User' // Add a default value
  };
  
  // Lucide icons
  folderIcon = Folder;
  folderPlusIcon = FolderPlus;
  plusIcon = Plus;
  searchIcon = Search;
  userIcon = User;
  settingsIcon = Settings;
  logoutIcon = LogOut;
  trashIcon = Trash2;
  
  constructor(
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Load projects
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects];
        console.log('Projects loaded:', this.projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        // You can add error handling here, such as displaying a notification
      }
    });
  }
  
  createNewProject(): void {
    this.router.navigate(['/create-project']);
  }

  searchProjects(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = query;
    this.filteredProjects = this.projects.filter(project => 
      project.project_name.toLowerCase().includes(query) || 
      project.framework_name?.toLowerCase().includes(query) ||
      // Search in table names if needed
      project.tables.some(table => table.table_name.toLowerCase().includes(query))
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  // Calculate progress percentage based on the new Project model
  getProgress(project: Project): number {
    // Using tables and fields from the new Project model
    if (project.tables && project.tables.length > 0) {
      // Count total fields across all tables
      const totalFields = project.tables.reduce((sum, table) => sum + (table.fields?.length || 0), 0);
      
      // Base progress on number of tables and fields
      if (totalFields > 0) {
        // Calculate progress based on tables and fields
        return Math.min(Math.floor((totalFields / 10) * 100), 100);
      } else {
        // Has tables but no fields
        return 40;
      }
    }
    return 20; // Default 20% if the project exists but has no tables
  }
  
  viewProject(projectId: number | undefined): void {
    if (projectId) {
      this.router.navigate(['/project-details', projectId]);
    } else {
      console.error('Cannot navigate to project detail: Project ID is undefined');
      // Optionally show a user notification
    }
  }
  
  logout(): void {
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
  
  // Show the confirm dialog with the project ID to delete
  openConfirmDialog(id: number | undefined, event: Event): void {
    event.stopPropagation(); // Prevent the card click event from triggering
    
    if (!id) {
      console.error('Cannot delete project: Project ID is undefined');
      return;
    }
    
    this.projectIdToDelete = id;
    this.showConfirmDialog = true;
  }
  goToProfile(): void {
    this.router.navigate(['/developer-profile/']);
  }
  
  // Close the dialog without deleting
  cancelDelete(): void {
    this.showConfirmDialog = false;
    this.projectIdToDelete = null;
  }

  // Confirm and execute the delete
  confirmDelete(): void {
    if (this.projectIdToDelete !== null) {
      this.projectService.deleteProject(this.projectIdToDelete)
        .subscribe({
          next: () => {
            // Remove project from local arrays
            this.projects = this.projects.filter(p => p.id !== this.projectIdToDelete);
            this.filteredProjects = this.filteredProjects.filter(p => p.id !== this.projectIdToDelete);
            console.log('Project deleted successfully');
            
            // Reset dialog state
            this.showConfirmDialog = false;
            this.projectIdToDelete = null;
            
            // You could add a toast notification here if you have a toast service
            // this.toastService.showSuccess('Project deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting project:', error);
            // Handle error, show notification to user
            // this.toastService.showError('Failed to delete project. Please try again.');
            
            // Reset dialog state
            this.showConfirmDialog = false;
            this.projectIdToDelete = null;
          }
        });
    }
  }
}