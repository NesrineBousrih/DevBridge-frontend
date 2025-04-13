import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FrameworksService } from '../../services/frameworks.service';
import { Framework } from '../../../../core/models/framework';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-framework-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './framework-details.component.html',
  styleUrls: ['./framework-details.component.scss']
})
export class FrameworkDetailsComponent implements OnInit {
  framework: Framework | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private frameworkService: FrameworksService,
    private toastService: ToastService
  ) {
    
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadFramework(id);
      }
    });
  }

  loadFramework(id: number): void {
    this.loading = true;
    this.frameworkService.getFrameworkById(id).subscribe({
      next: (framework) => {
        this.framework = framework || null;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load framework details';
        this.loading = false;
        console.error('Error loading framework:', error);
        this.toastService.showError('Failed to load framework details');
      }
    });
  }

  onEdit(): void {
    if (this.framework) {
      this.router.navigate(['/dashboard/frameworks/edit', this.framework.id]);
    }
  }

  onDelete(): void {
    if (this.framework && confirm('Are you sure you want to delete this framework?')) {
      this.frameworkService.deleteFramework(this.framework.id!).subscribe({
        next: () => {
          this.toastService.showSuccess('Framework deleted successfully');
          this.router.navigate(['/dashboard/frameworks']);
        },
        error: (error) => {
          this.error = 'Failed to delete framework';
          console.error('Error deleting framework:', error);
          this.toastService.showError('Failed to delete framework');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/frameworks']);
  }
}