import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FrameworksService } from '../../services/frameworks.service';
import { Framework } from '../../../../core/models/framework';
import { ToastService } from '../../services/toast.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-framework-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './framework-form.component.html',
  styleUrls: ['./framework-form.component.scss']
})
export class FrameworkFormComponent implements OnInit {
  frameworkForm: FormGroup;
  isEditMode: boolean = false;
  frameworkId: number | null = null;
  loading: boolean = false;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private frameworkService: FrameworksService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.frameworkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      short_description: [''],
      logo: [null],
      type: ['frontend', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.frameworkId = +params['id'];
        this.loadFrameworkData(this.frameworkId);
      }
    });
  }

  loadFrameworkData(id: number): void {
    this.loading = true;
    this.frameworkService.getFrameworkById(id)
      .pipe(
        catchError(err => {
          console.error('Error loading framework data:', err);
          this.toastService.showError('Failed to load framework data');
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(framework => {
        this.loading = false;
        if (framework) {
          this.frameworkForm.patchValue({
            name: framework.name,
            short_description: framework.short_description || ''
          });
          
          // If there's a logo URL in the framework data
          if (framework.logo_url) {
            this.logoPreview = framework.logo_url;
          }
        } else {
          this.toastService.showError('Framework not found');
          this.router.navigate(['/dashboard/frameworks']);
        }
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Update form control with file
      this.frameworkForm.patchValue({
        logo: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.frameworkForm.valid) {
      this.loading = true;
      
      // Create framework object with form values
      const frameworkData: Framework = {
        name: this.frameworkForm.get('name')?.value,
        short_description: this.frameworkForm.get('short_description')?.value,
        logo: this.frameworkForm.get('logo')?.value,
        project_type: '',
        type: 'frontend'
      };
      
      if (this.isEditMode && this.frameworkId) {
        frameworkData.id = this.frameworkId;
        this.frameworkService.updateFramework(frameworkData)
          .pipe(
            catchError(err => {
              console.error('Error updating framework:', err);
              this.toastService.showError('Failed to update framework');
              this.loading = false;
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading = false;
            this.toastService.showSuccess('Framework updated successfully');
            this.router.navigate(['/dashboard/frameworks']);
          });
      } else {
        this.frameworkService.addFramework(frameworkData)
          .pipe(
            catchError(err => {
              console.error('Error adding framework:', err);
              this.toastService.showError('Failed to add framework');
              this.loading = false;
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading = false;
            this.toastService.showSuccess('Framework added successfully');
            this.router.navigate(['/dashboard/frameworks']);
          });
      }
    } else {
      this.markFormGroupTouched(this.frameworkForm);
      this.toastService.showWarning('Please fix the validation errors');
    }
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}