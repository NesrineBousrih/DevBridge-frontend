import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  LucideAngularModule,
  Code,
  Server,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-angular';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FrameworksService } from '../../../dashboard/services/frameworks.service';
import { Framework } from '../../../../core/models/framework';
import { ToastService } from '../../../dashboard/services/toast.service';
import { ProjectService, Field } from '../../services/project.service';
import { Router } from '@angular/router';

// Define valid project types
type ProjectType = 'Frontend' | 'Backend';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, MatSnackBarModule],
})
export class CreateProjectComponent implements OnInit {
  currentStep: number = 1;
  projectType: ProjectType | null = null;
  selectedFramework: Framework | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  codeIcon = Code;
  serverIcon = Server;
  chevronLeftIcon = ChevronLeft;
  chevronRightIcon = ChevronRight;
  checkCircleIcon = CheckCircle;

  // Form for model fields
  modelForm: FormGroup;

  // Field type options (matching Django model choices)
  fieldTypes: string[] = [
    'CharField',
    'TextField',
    'IntegerField',
    'BooleanField',
    'DateField',
    'DateTimeField',
    'EmailField',
    'FileField',
    'ImageField',
    'ForeignKey',
    'ManyToManyField',
  ];

  // Frameworks for each type
  frameworks: Record<ProjectType, Framework[]> = {
    Frontend: [],
    Backend: [],
  };

  constructor(
    private fb: FormBuilder,
    private frameworksService: FrameworksService,
    private projectService: ProjectService,
    private toastService: ToastService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.modelForm = this.fb.group({
      projectName: ['', Validators.required],
      modelName: ['', Validators.required],
      fields: this.fb.array([this.createField()]),
    });
  }

  ngOnInit(): void {
    // Optional: Pre-fetch frameworks
  }

  // Form array getter for fields
  get fields(): FormArray {
    return this.modelForm.get('fields') as FormArray;
  }

  // Create a new field form group
  createField(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      field_type: ['CharField', Validators.required], // Match exactly with your Django model field name
    });
  }

  // Add a new field
  addField(): void {
    this.fields.push(this.createField());
  }

  // Remove a field
  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  // Navigation methods
  nextStep(): void {
    this.currentStep = Math.min(this.currentStep + 1, 3);
  }

  prevStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  // New method to fetch frameworks by type
  fetchFrameworks(type: ProjectType): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.frameworksService.getFrameworksByType(type).subscribe({
      next: (data) => {
        this.frameworks[type] = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load frameworks. Please try again.';
        this.isLoading = false;
        this.snackBar.open('Failed to load frameworks', 'Close', {
          duration: 3000,
          panelClass: ['error-toast']
        });
      }
    });
  }

  // Selection handlers
  selectProjectType(type: ProjectType): void {
    this.projectType = type;
    this.fetchFrameworks(type); // Fetch frameworks when type is selected
    this.nextStep();
  }

  selectFramework(framework: Framework): void {
    this.selectedFramework = framework;
    this.nextStep();
  }

  // Create project
  createProject(): void {
    if (this.modelForm.valid && this.selectedFramework && this.projectType) {
      this.isLoading = true;
      
      // Create project data with project_type field to match Django model
      const projectData = {
        projectType: this.projectType,
        framework: this.selectedFramework,
        projectName: this.modelForm.get('projectName')?.value,
        modelName: this.modelForm.get('modelName')?.value,
        fields: this.fields.value as Field[],
      };

      console.log('Sending project data:', projectData);
      
      this.projectService.createProject(projectData).subscribe({
		next: (createdProject) => {
		  this.isLoading = false;
		  this.snackBar.open('Project created successfully!', 'Close', {
			duration: 3000,
			panelClass: ['success-toast']
		  });
	  
		  // Redirect to project details page with the created project's ID
		  const projectId = createdProject.id;
		  this.router.navigate([`/project-details/${projectId}`]);
		},
		error: (error) => {
		  this.isLoading = false;
		  this.snackBar.open('Failed to create project. Please try again.', 'Close', {
			duration: 3000,
			panelClass: ['error-toast']
		  });
		  console.error('Project creation error:', error);
		}
	  });
    } else {
      this.modelForm.markAllAsTouched();
      
      // Display error toast notification
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-toast']
      });
    }
  }

  // Safe access to frameworks
  getFrameworks(type: ProjectType | null): Framework[] {
    return type ? this.frameworks[type] : [];
  }
}