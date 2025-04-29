import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectAdminService } from '../../services/project-admin.service';
import { ProjectDetailsAdminService } from '../../services/project-details-admin.service';
import { ToastService } from '../../services/toast.service';
import { catchError, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { Project } from '../../../../core/models/project';
import { ChevronDown, ChevronUp, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  projectId!: number;
  project: Project | null = null;
  detailForm!: FormGroup;
  loading = false;
  error: string | null = null;
  showConfirmDialog = false;
  ChevronDown=ChevronDown;
  ChevronUp=ChevronUp;
  
  constructor(
    private projectAdminService: ProjectAdminService,
    private projectDetailsService: ProjectDetailsAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService
  ) { }
  
  ngOnInit(): void {
    this.initForm();
    this.loadProject();
  }
  
  initForm(): void {
    this.detailForm = this.fb.group({
      // Define your form fields here
    });
  }
  
  loadProject(): void {
    this.loading = true;
    this.error = null;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/projects']);
      return;
    }
    
    this.projectId = +id;
    this.projectAdminService.getProject(this.projectId)
      .subscribe( {
        next:(project)=>{
          this.loading = false;
          this.project = project || null;
          if (this.project){
          this.updateForm(this.project);
          }
        },
        error: (error) => {
          this.error = 'Failed to load project details';
          this.loading = false;
          console.error('Error loading project:', error);
          this.toastService.showError('Failed to load project details');
        }
      });
  }
  
  updateForm(project: Project): void {
    // Update form with project data
  }
  
  onSubmit(): void {
    if (this.detailForm.invalid) {
      return;
    }
    
    this.loading = true;
    const updatedData = this.detailForm.value;
    
    this.projectDetailsService.updateProjectDetails(this.projectId, updatedData)
      .pipe(
        catchError(err => {
          console.error('Error updating project:', err);
          this.toastService.showError('Failed to update project details');
          return of(null);
        })
      )
      .subscribe((result) => {
        this.loading = false;
        if (result) {
          this.toastService.showSuccess('Project details updated successfully');
        }
      });
  }

  // Add missing methods referenced in the template
  goBack(): void {
    this.router.navigate(['/dashboard/projects']);
  }
  
  onEdit(): void {
    this.router.navigate(['/dashboard/projects/edit', this.projectId]);
  }
  
  openConfirmDialog(): void {
    this.showConfirmDialog = true;
  }
  
  cancelDelete(): void {
    this.showConfirmDialog = false;
  }
  
  confirmDelete(): void {
    if (this.project && this.project.id) {
      this.projectAdminService.deleteProject(this.project.id)
        .pipe(
          take(1),
          catchError(err => {
            console.error('Error deleting project:', err);
            this.toastService.showError('Failed to delete project. Please try again.');
            return of(undefined);
          })
        )
        .subscribe(() => {
          this.toastService.showSuccess('Project deleted successfully');
          this.router.navigate(['/dashboard/projects']);
        });
    }
  }
  
  downloadScript(): void {
    if (this.project && this.project.id) {
      this.projectAdminService.getProjectScript(this.project.id)
        .pipe(
          take(1),
          catchError(err => {
            console.error('Error downloading script:', err);
            this.toastService.showError('Failed to download script. Please try again.');
            return of(undefined);
          })
        )
        .subscribe((result) => {
          if (result) {
            this.toastService.showSuccess('Script downloaded successfully');
          }
        });
    }
  }
  expandedTables: { [key: number]: boolean } = {};

toggleTable(index: number): void {
  this.expandedTables[index] = !this.expandedTables[index];
}

}