// project-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService, Project, Field } from '../../services/project.service';
import { ProjectDetailsService } from '../../services/project-details.service';
import { ToastService } from '../../services/toast.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  loading: boolean = true;
  error: string | null = null;
  showConfirmDialog: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private projectDetailsService: ProjectDetailsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProject(id);
      }
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProjectById(id)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load project details';
          this.loading = false;
          console.error('Error loading project:', err);
          this.toastService.showError('Failed to load project details');
          return of(null);
        })
      )
      .subscribe(project => {
        this.project = project;
        this.loading = false;
      });
  }

  onEdit(): void {
    if (this.project) {
      this.router.navigate(['/dashboard/projects/edit', this.project.id]);
    }
  }

  openConfirmDialog(): void {
    this.showConfirmDialog = true;
  }

  cancelDelete(): void {
    this.showConfirmDialog = false;
  }

  confirmDelete(): void {
    if (this.project) {
      this.projectService.deleteProject(this.project.id!)
        .pipe(
          catchError(err => {
            this.error = 'Failed to delete project';
            console.error('Error deleting project:', err);
            this.toastService.showError('Failed to delete project');
            return of(undefined);
          })
        )
        .subscribe(() => {
          this.toastService.showSuccess('Project deleted successfully');
          this.router.navigate(['/dashboard/projects']);
        });
    }
    this.showConfirmDialog = false;
  }

  downloadScript(): void {
    if (this.project) {
      this.projectDetailsService.downloadScript(this.project.id!)
        .pipe(
          catchError(err => {
            console.error('Error downloading script:', err);
            this.toastService.showError('Failed to download script. Please try again.');
            return of(false);
          })
        )
        .subscribe(result => {
          if (result) {
            this.toastService.showSuccess('Script downloaded successfully');
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/projects']);
  }
}