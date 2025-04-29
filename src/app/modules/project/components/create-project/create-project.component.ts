import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import {
  LucideAngularModule,
  Code,
  Server,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-angular';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FrameworksService } from '../../../dashboard/services/frameworks.service';
import { Framework } from '../../../../core/models/framework';
import { ToastService } from '../../../dashboard/services/toast.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define valid project types
type ProjectType = 'Frontend' | 'Backend';

interface ModelDefinition {
  id: string;
  name: string;
}

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule, MatSnackBarModule],
})
export class CreateProjectComponent implements OnInit {
  currentStep: number = 1;
  projectType: ProjectType | null = null;
  selectedFramework: Framework | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  // Add model creation option properties
  modelCreationOption: 'manual' | 'database' = 'manual';
  dbConnectionForm: FormGroup;
  availableTables: string[] = [];
  filteredTables: string[] = [];
  tableSearchQuery: string = '';
  
  // Multiple table selection
  selectedTables: string[] = [];
  tableStructures: { [key: string]: Array<{ name: string; type: string }> } = {};
  expandedTables: Set<string> = new Set();
  allTablesLoaded: boolean = false;

  // Multiple model management for manual mode
  models: ModelDefinition[] = [];
  modelForms: { [key: string]: FormGroup } = {};
  expandedModels: Set<string> = new Set();
  modelSearchQuery: string = '';
  filteredModels: ModelDefinition[] = [];

  // Icons
  codeIcon = Code;
  serverIcon = Server;
  chevronLeftIcon = ChevronLeft;
  chevronRightIcon = ChevronRight;
  checkCircleIcon = CheckCircle;
  plusIcon = Plus;
  trashIcon = Trash2;

  // Project form
  projectForm: FormGroup;
  
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
    // Initialize project form
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
    });

    // Initialize database connection form
    this.dbConnectionForm = this.fb.group({
      host: ['', Validators.required],
      port: ['5432', [Validators.required, Validators.pattern('^[0-9]+$')]],
      databaseName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    // Optional: Pre-fetch frameworks
    
    // Add first model when in manual mode
    if (this.modelCreationOption === 'manual') {
      this.addNewModel();
    }
  }

  // Set model creation option
  setModelCreationOption(option: 'manual' | 'database'): void {
    this.modelCreationOption = option;
    
    // Reset database-related data when switching options
    if (option === 'manual') {
      if (this.models.length === 0) {
        this.addNewModel();
      }
    } else {
      this.availableTables = [];
      this.filteredTables = [];
      this.selectedTables = [];
      this.tableStructures = {};
      this.expandedTables.clear();
      this.allTablesLoaded = false;
    }
  }

  // Create a new model form
  createModelForm(modelName: string = ''): FormGroup {
    return this.fb.group({
      modelName: [modelName, Validators.required],
      fields: this.fb.array([])
    });
  }

  // Form array getter for a specific model's fields
  getModelFields(modelId: string): FormArray {
    return this.modelForms[modelId].get('fields') as FormArray;
  }

  // Create a new field form group
  createField(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      field_type: ['CharField', Validators.required], // Match exactly with your Django model field name
    });
  }

  // Add a new model
  addNewModel(): void {
    const modelId = 'model_' + Date.now().toString();
    const newModel: ModelDefinition = {
      id: modelId,
      name: '',
    };
    
    this.models.push(newModel);
    this.modelForms[modelId] = this.createModelForm();
    
    // Add a default field
    this.addField(modelId);
    
    // Expand the new model
    this.expandedModels.add(modelId);
    
    // Update filtered models
    this.filterModels();
  }

  // Delete a model
  deleteModel(modelId: string): void {
    const index = this.models.findIndex(m => m.id === modelId);
    if (index !== -1) {
      this.models.splice(index, 1);
      delete this.modelForms[modelId];
      this.expandedModels.delete(modelId);
      this.filterModels();
    }
  }

  // Toggle model details expansion
  toggleModelDetails(modelId: string): void {
    if (this.expandedModels.has(modelId)) {
      this.expandedModels.delete(modelId);
    } else {
      this.expandedModels.add(modelId);
    }
  }

  // Check if a model is expanded
  isModelExpanded(modelId: string): boolean {
    return this.expandedModels.has(modelId);
  }

  // Filter models based on search query
  filterModels(): void {
    if (!this.modelSearchQuery) {
      this.filteredModels = [...this.models];
    } else {
      const query = this.modelSearchQuery.toLowerCase();
      this.filteredModels = this.models.filter(model => 
        model.name.toLowerCase().includes(query)
      );
    }
  }

  // Add a field to a specific model
  addField(modelId: string): void {
    const fieldsArray = this.getModelFields(modelId);
    fieldsArray.push(this.createField());
  }

  // Remove a field from a specific model
  removeField(modelId: string, index: number): void {
    const fieldsArray = this.getModelFields(modelId);
    fieldsArray.removeAt(index);
  }

  // Get the number of fields for a model
  getModelFieldsCount(modelId: string): number {
    const fieldsArray = this.getModelFields(modelId);
    return fieldsArray ? fieldsArray.length : 0;
  }

  // Update model name when it changes in the form
  updateModelName(modelId: string): void {
    const modelIndex = this.models.findIndex(m => m.id === modelId);
    if (modelIndex !== -1) {
      const newName = this.modelForms[modelId].get('modelName')?.value;
      this.models[modelIndex].name = newName;
    }
  }

  // Database connection method
  connectToDatabase(): void {
    if (this.dbConnectionForm.valid) {
      this.isLoading = true;
      
      const connectionData = this.dbConnectionForm.value;
      
      // Call your database connection service
      this.projectService.connectToDatabase(connectionData).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.availableTables = data.tables || [];
          this.filteredTables = [...this.availableTables];
          this.selectedTables = [];
          this.tableStructures = {};
          this.expandedTables.clear();
          this.allTablesLoaded = false;
          
          if (this.availableTables.length === 0) {
            this.snackBar.open('No tables found in the database', 'Close', {
              duration: 3000
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to connect to database. Please check your credentials.', 'Close', {
            duration: 3000,
            panelClass: ['error-toast']
          });
        }
      });
    } else {
      this.dbConnectionForm.markAllAsTouched();
    }
  }

  // Filter tables based on search query
  filterTables(): void {
    if (!this.tableSearchQuery) {
      this.filteredTables = [...this.availableTables];
    } else {
      const query = this.tableSearchQuery.toLowerCase();
      this.filteredTables = this.availableTables.filter(table => 
        table.toLowerCase().includes(query)
      );
    }
  }

  // Toggle table selection
  toggleTableSelection(tableName: string): void {
    const index = this.selectedTables.indexOf(tableName);
    if (index === -1) {
      this.selectedTables.push(tableName);
    } else {
      this.selectedTables.splice(index, 1);
    }
  }

  // Select all tables
  selectAllTables(): void {
    this.selectedTables = [...this.filteredTables];
  }

  // Clear table selection
  clearTableSelection(): void {
    this.selectedTables = [];
  }

  // Load table structures for all selected tables
  loadTableStructures(): void {
    if (this.selectedTables.length === 0) {
      this.snackBar.open('Please select at least one table', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    this.tableStructures = {};
    this.allTablesLoaded = false;
    
    // Create an array of observables for each table structure request
    const structureRequests: Observable<any>[] = this.selectedTables.map(tableName => {
      return this.projectService.getTableStructure(this.dbConnectionForm.value, tableName).pipe(
        catchError(error => {
          console.error(`Error loading structure for table ${tableName}:`, error);
          return of({ tables_structure: { [tableName]: [] } });
        })
      );
    });

    // Use forkJoin to execute all requests in parallel
    forkJoin(structureRequests).subscribe({
      next: (results) => {
        results.forEach((result, index) => {
          const tableName = this.selectedTables[index];
          if (result.tables_structure && result.tables_structure[tableName]) {
            this.tableStructures[tableName] = result.tables_structure[tableName];
          } else {
            this.tableStructures[tableName] = [];
          }
        });
        
        this.isLoading = false;
        this.allTablesLoaded = true;
        
        // Expand the first table by default
        if (this.selectedTables.length > 0) {
          this.expandedTables.add(this.selectedTables[0]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load some table structures', 'Close', {
          duration: 3000,
          panelClass: ['error-toast']
        });
      }
    });
  }

  // Toggle table details expansion
  toggleTableDetails(tableName: string): void {
    if (this.expandedTables.has(tableName)) {
      this.expandedTables.delete(tableName);
    } else {
      this.expandedTables.add(tableName);
    }
  }

  // Check if a table is expanded
  isTableExpanded(tableName: string): boolean {
    return this.expandedTables.has(tableName);
  }

  // Get fields for a table
  getTableFields(tableName: string): Array<{ name: string; type: string }> {
    return this.tableStructures[tableName] || [];
  }

  // Get number of fields for a table
  getTableFieldsCount(tableName: string): number {
    return (this.tableStructures[tableName] || []).length;
  }

  // Validate project form
  isProjectValid(): boolean {
    const projectNameValid = this.projectForm.get('projectName')?.valid || false;
    
    if (this.modelCreationOption === 'manual') {
      // For manual, we need at least one model with a valid name and fields
      if (this.models.length === 0) {
        return false;
      }
      
      // Check if all models have a valid name and at least one field
      const allModelsValid = this.models.every(model => {
        const form = this.modelForms[model.id];
        const modelNameValid = form.get('modelName')?.valid || false;
        const fieldsArray = form.get('fields') as FormArray;
        const hasFields = fieldsArray.length > 0;
        const allFieldsValid = Array.from({length: fieldsArray.length}).every((_, i) => {
          const field = fieldsArray.at(i);
          return field.get('name')?.valid && field.get('field_type')?.valid;
        });
        
        return modelNameValid && hasFields && allFieldsValid;
      });
      
      return projectNameValid && allModelsValid && this.selectedFramework !== null && this.projectType !== null;
    } else { // database option
      return projectNameValid && 
             this.selectedTables.length > 0 && 
             this.allTablesLoaded &&
             this.selectedFramework !== null && 
             this.projectType !== null;
    }
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

  createProject(): void {
    // Always attempt to create the project without validation check
    this.isLoading = true;
    
    let tables: Array<{
      table_name: string;
      fields: Array<{
        name: string;
        type: string;
      }>;
    }> = [];
  
    if (this.modelCreationOption === 'manual') {
      // For manual option, use all defined models
      tables = this.models.map(model => {
        const form = this.modelForms[model.id];
        const fieldsArray = form.get('fields') as FormArray;
        
        return {
          table_name: form.get('modelName')?.value || 'Unnamed Model',
          fields: fieldsArray.value.map((field: any) => ({
            name: field.name || 'unnamed_field',
            type: field.field_type || 'text'
          }))
        };
      });
    } else {
      // For database option, use all selected tables with their structures
      tables = this.selectedTables.map(tableName => ({
        table_name: tableName,
        fields: this.tableStructures[tableName] || []
      }));
    }
    
    // Create project data
    const projectData = {
      projectType: this.projectType ?? 'web',
      framework: this.selectedFramework,
      projectName: this.projectForm.get('projectName')?.value || 'New Project',
      tables: tables,
      generatedFromDatabase: this.modelCreationOption === 'database',
      dbConnectionDetails: this.modelCreationOption === 'database' ? this.dbConnectionForm.value : null
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
  }
  
  // This method is used by the template to determine if the Create Project button should be enabled
  isFormValid(): boolean {
    // Always return true to enable the Create Project button
    return true;
  }
  
  // This method can be removed since we're no longer checking validation before project creation
  // but if needed elsewhere, implement a simple version
  
  
  // Safe access to frameworks
  getFrameworks(type: ProjectType | null): Framework[] {
    return type ? this.frameworks[type] : [];
  }}