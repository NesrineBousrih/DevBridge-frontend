// project-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService} from '../../../project/services/project.service';
import { ToastService } from '../../services/toast.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode: boolean = false;
  projectId: number | null = null;
  loading: boolean = false;
  frameworks: any[] = [];
  fieldTypes: string[] = ['CharField', 'IntegerField', 'BooleanField', 'DateField', 'EmailField', 'TextField', 'URLField', 'FileField'];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.projectForm = this.fb.group({
      project_name: ['', [Validators.required, Validators.minLength(3)]],
      model_name: ['', [Validators.required, Validators.minLength(3)]],
      framework: [null, Validators.required],
      fields: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFrameworks();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.projectId = +params['id'];
        this.loadProjectData(this.projectId);
      } else {
        // Add a default field for new projects
        this.addField();
      }
    });
  }

  loadFrameworks(): void {
    // Call your framework service to load available frameworks
    // For now using a placeholder
    this.projectService.getFrameworks()
      .pipe(
        catchError(err => {
          console.error('Error loading frameworks:', err);
          this.toastService.showError('Failed to load frameworks');
          return of([]);
        })
      )
      .subscribe((frameworks: any[]) => {
        this.frameworks = frameworks;
      });
  }

  loadProjectData(id: number): void {
    this.loading = true;
    this.projectService.getProjectById(id)
      .pipe(
        catchError(err => {
          console.error('Error loading project data:', err);
          this.toastService.showError('Failed to load project data');
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(project => {
        this.loading = false;
        if (project) {
          this.projectForm.patchValue({
            project_name: project.project_name,
            model_name: project.model_name,
            framework: project.framework
          });
          
          // Clear fields array before adding fields from project
          this.clearFields();
          
          // Add fields from project
          if (project.fields && project.fields.length > 0) {
            project.fields.forEach(field => {
              this.addField(field);
            });
          } else {
            // Add a default field if no fields exist
            this.addField();
          }
        } else {
          this.toastService.showError('Project not found');
          this.router.navigate(['/dashboard/projects']);
        }
      });
  }

  get fields() {
    return this.projectForm.get('fields') as FormArray;
  }

  addField(field?: Field): void {
    this.fields.push(this.fb.group({
      name: [field?.name || '', [Validators.required, Validators.minLength(2)]],
      field_type: [field?.field_type || this.fieldTypes[0], Validators.required],
      id: [field?.id || null]
    }));
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  clearFields(): void {
    while (this.fields.length !== 0) {
      this.fields.removeAt(0);
    }
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      const projectData = {
        framework: this.projectForm.value.framework,
        projectName: this.projectForm.value.project_name,
        modelName: this.projectForm.value.model_name,
        fields: this.projectForm.value.fields
      };
      
      if (this.isEditMode && this.projectId) {
        this.projectService.updateProject(this.projectId, projectData)
          .pipe(
            catchError(err => {
              console.error('Error updating project:', err);
              this.toastService.showError('Failed to update project');
              this.loading = false;
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading = false;
            this.toastService.showSuccess('Project updated successfully');
            this.router.navigate(['/dashboard/projects']);
          });
      } else {
        this.projectService.createProject(projectData)
          .pipe(
            catchError(err => {
              console.error('Error adding project:', err);
              this.toastService.showError('Failed to add project');
              this.loading = false;
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading = false;
            this.toastService.showSuccess('Project added successfully');
            this.router.navigate(['/dashboard/projects']);
          });
      }
    } else {
      this.markFormGroupTouched(this.projectForm);
      this.toastService.showWarning('Please fix the validation errors');
    }
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        if (control instanceof FormArray) {
          control.controls.forEach(c => {
            if (c instanceof FormGroup) {
              this.markFormGroupTouched(c);
            }
          });
        } else if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }
}