import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ProjectDetailsService } from '../../services/project-details.service';
import { CommonModule } from '@angular/common';
import { List, LucideAngularModule } from 'lucide-angular';
import { 
  Download, 
  Code, 
  Server, 
  Database, 
  Layers, 
  ArrowRight, 
  Terminal,
  Copy,
  Check,
  Folder,
  Package,
  FileCode,
  Info,
  File,
  Edit   // Added Edit icon for the update button
} from 'lucide-angular';
import { Project } from '../../../../core/models/project';

type TabType = 'script' | 'zip'; // Define a union type for the tabs

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
  activeTab: TabType = 'script'; // Default active tab with proper type

  downloadIcon = Download;
  codeIcon = Code;
  layersIcon = Layers;
  databaseIcon = Database;
  serverIcon = Server;
  terminalIcon = Terminal;
  arrowRightIcon = ArrowRight;
  copyIcon = Copy;
  checkIcon = Check;
  fileCodeIcon = FileCode;
  folderIcon = Folder;
  packageIcon = Package;
  infoIcon = Info;
  listIcon = List;
  fileIcon = File;
  editIcon = Edit;  // Added Edit icon for update button

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

  // Add navigate method for update button
  navigateToUpdateProject(): void {
    if (this.project && this.project.id) {
      this.router.navigate(['/update-project', this.project.id]);
    }
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
        // You could add a toast notification here
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
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

  downloadZip(): void {
    if (!this.project || !this.project.id) {
      console.error('Cannot download ZIP: Project ID is missing');
      return;
    }
    
    // Show loading indicator or disable button
    const downloadZipBtn = document.querySelector('[data-download-zip-btn]') as HTMLButtonElement;
    if (downloadZipBtn) {
      downloadZipBtn.disabled = true;
      downloadZipBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Downloading...';
    }
    // Try alternative method if direct download fails
    if (this.project.zip_file) {
      console.log('Attempting direct download from URL:', this.project.zip_file);
      window.open(this.project.zip_file, '_blank');
    } else {
      alert('Failed to download zipfile. Please try again later.');
    }
    
    // Reset button
    if (downloadZipBtn) {
      downloadZipBtn.disabled = false;
      downloadZipBtn.textContent = 'Download ZIP';
    }
  }
}