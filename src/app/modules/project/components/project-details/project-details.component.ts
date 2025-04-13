import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { ProjectDetailsService } from '../../services/project-details.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { 
  Download, 
  Code, 
  Server, 
  Database, 
  Layers, 
  ArrowRight, 
  Terminal,
  Copy,
  Check
} from 'lucide-angular';


@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
})
export class ProjectDetailsComponent implements OnInit {
  projectId: number = 0; // Initialize to avoid TS2564 error
  project!: Project; // Using definite assignment assertion
  loading = true;
  error = false;
  errorMessage = '';

  downloadIcon = Download;
  codeIcon = Code;
  layersIcon = Layers;
  databaseIcon = Database;
  serverIcon = Server;
  terminalIcon = Terminal;
  arrowRightIcon = ArrowRight;
  copyIcon = Copy;
  checkIcon = Check;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private projectDetailsService: ProjectDetailsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.projectId = +id;
        if (isNaN(this.projectId)) {
          this.error = true;
          this.errorMessage = 'Invalid project ID';
          this.loading = false;
          return;
        }
        this.loadProjectDetails();
      } else {
        this.error = true;
        this.errorMessage = 'Project ID is missing';
        this.loading = false;
      }
    });
  }

  loadProjectDetails(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data: Project) => {
        this.project = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading project details', err);
        this.error = true;
        this.errorMessage = 'Failed to load project details. Please try again.';
        this.loading = false;
      }
    });
  }

  downloadScript(): void {
    if (!this.project || !this.project.id) {
      console.error('Cannot download script: Project ID is missing');
      return;
    }
    
    // Show loading indicator or disable button
    const downloadBtn = document.querySelector('[data-download-btn]') as HTMLButtonElement;
    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Downloading...';
    }
    
    this.projectDetailsService.downloadScript(this.project.id).subscribe({
      next: (success: boolean) => {
        console.log('Script downloaded successfully');
        // Reset button
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.textContent = 'Download Script';
        }
      },
      error: (err: any) => {
        console.error('Error downloading script', err);
        
        // Try alternative method if direct download fails
        if (this.project.script_url) {
          console.log('Attempting direct download from URL:', this.project.script_url);
          window.open(this.project.script_url, '_blank');
        } else {
          alert('Failed to download script. Please try again later.');
        }
        
        // Reset button
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.textContent = 'Download Script';
        }
      }
    });
  }}