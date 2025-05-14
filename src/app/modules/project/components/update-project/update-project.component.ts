import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Project Models and Services
import { Project } from '../../../../core/models/project';
import { Framework } from '../../../../core/models/framework';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-update',
  templateUrl: './update-project.component.html',
  styleUrls: ['./update-project.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatSnackBarModule
  ]
})
export class ProjectUpdateComponent implements OnInit {
  projectId!: number;
  projectForm!: FormGroup;
  frameworks: Framework[] = [];
  loading = true;
  error = '';
  saving = false;
  currentFramework: string = '';  // Added to store the current framework name
  fieldTypes = [
    'CharField', 'TextField', 'IntegerField', 'FloatField', 'BooleanField',
    'DateField', 'DateTimeField', 'EmailField', 'URLField', 'ForeignKey'
  ];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadFrameworks();
    
    // Fix: Use switchMap to properly handle async operations
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Extracted project ID from route:', id); 
      if (id && !isNaN(+id)) {
        console.log('Parsed projectId as number:', this.projectId);
        this.projectId = +id;
        this.loadProject();
      } else {
        this.error = 'Invalid project ID';
        this.loading = false;
      }
    });
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      framework: [null],
      tables: this.fb.array([this.createTableFormGroup()]) // Add at least one table
    });
  }

  // Create a table form group with at least one field
  createTableFormGroup(): FormGroup {
    return this.fb.group({
      table_name: ['', Validators.required],
      fields: this.fb.array([this.createFieldFormGroup()])
    });
  }

  // Create a field form group
  createFieldFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['CharField', Validators.required]
    });
  }

  loadFrameworks(): void {
    this.projectService.getFrameworks().subscribe({
      next: (data) => {
        this.frameworks = data;
      },
      error: (err) => {
        this.error = 'Failed to load frameworks';
        console.error('Framework load error:', err);
      }
    });
  }

  loadProject(): void {
    this.loading = true;
    this.error = '';
    
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        console.log('Loaded project:', project);
        this.populateForm(project);
        
        // Store current framework name
        const selectedFramework = this.frameworks.find(f => f.id === project.framework);
        if (selectedFramework) {
          this.currentFramework = selectedFramework.name;
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load project details';
        console.error('Project load error:', err);
        this.loading = false;
      }
    });
  }

  populateForm(project: Project): void {
    // Reset tables FormArray
    while (this.tables.length !== 0) {
      this.tables.removeAt(0);
    }
    
    // Set basic project info - ensure framework is properly set
    this.projectForm.patchValue({
      projectName: project.project_name,
      framework: project.framework
    });
    
    // Add tables
    if (project.tables && project.tables.length > 0) {
      project.tables.forEach(table => {
        const tableGroup = this.addTable();
        tableGroup.patchValue({
          table_name: table.table_name
        });
        
        // Add fields to table
        const fieldsArray = tableGroup.get('fields') as FormArray;
        while (fieldsArray.length !== 0) {
          fieldsArray.removeAt(0);
        }
        
        if (table.fields && table.fields.length > 0) {
          table.fields.forEach(field => {
            const fieldGroup = this.addField(fieldsArray);
            fieldGroup.patchValue({
              name: field.name,
              type: field.type
            });
          });
        } else {
          // Add at least one empty field if none exists
          this.addField(fieldsArray);
        }
      });
    } else {
      // Add at least one empty table if none exists
      this.addTable();
    }
  }

  get tables(): FormArray {
    return this.projectForm.get('tables') as FormArray;
  }

  getTableFields(tableIndex: number): FormArray {
    return this.tables.at(tableIndex).get('fields') as FormArray;
  }

  addTable(): FormGroup {
    const tableGroup = this.createTableFormGroup();
    this.tables.push(tableGroup);
    return tableGroup;
  }

  addField(fieldsArray: FormArray): FormGroup {
    const fieldGroup = this.createFieldFormGroup();
    fieldsArray.push(fieldGroup);
    return fieldGroup;
  }

  removeTable(index: number): void {
    if (this.tables.length > 1) {
      this.tables.removeAt(index);
    } else {
      this.snackBar.open('Project must have at least one table', 'Close', {
        duration: 3000
      });
    }
  }

  removeField(tableIndex: number, fieldIndex: number): void {
    const fieldsArray = this.getTableFields(tableIndex);
    if (fieldsArray.length > 1) {
      fieldsArray.removeAt(fieldIndex);
    } else {
      this.snackBar.open('A table must have at least one field', 'Close', {
        duration: 3000
      });
    }
  }

  saveProject(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000
      });
      return;
    }
    
    this.saving = true;
    const formData = this.projectForm.value;
    
    // Format the data properly for the API
    const projectData = {
      projectName: formData.projectName,
      framework: this.frameworks.find(f => f.id === formData.framework) || null,
      tables: formData.tables
    };
    
    this.projectService.updateProject(this.projectId, projectData).subscribe({
      next: (response) => {
        this.saving = false;
        this.snackBar.open('Project updated successfully', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Failed to update project';
        console.error('Update error:', err);
        this.snackBar.open('Failed to update project: ' + (err.error?.error || err.message), 'Close', {
          duration: 5000
        });
      }
    });
  }

  // Utility method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          if (control.at(i) instanceof FormGroup) {
            this.markFormGroupTouched(control.at(i) as FormGroup);
          }
        }
      }
    });
  }

  // Compare framework objects for mat-select
  compareFrameworks(f1: any, f2: any): boolean {
    if (f1 === null || f2 === null) return f1 === f2;
    
    // Compare by id if objects
    if (typeof f1 === 'object' && f1 !== null) {
      return f1.id === f2;
    }
    
    // Direct comparison
    return f1 === f2;
  }

  // Get framework name by ID
  getFrameworkNameById(id: number): string {
    const framework = this.frameworks.find(f => f.id === id);
    return framework ? framework.name : '';
  }

  // Navigate back to projects list
  cancelEdit(): void {
    this.router.navigate(['/home']);
  }
}