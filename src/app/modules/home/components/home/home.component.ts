// home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Folder, FolderPlus, Plus, Search } from 'lucide-angular';
import { Project } from '../../../../core/models/project';
import { ProjectService } from '../../../project/services/project.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchQuery: string = '';
  
  // Lucide icons
  folderIcon = Folder;
  folderPlusIcon = FolderPlus;
  plusIcon = Plus;
  searchIcon = Search;

  constructor(
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Charger les projets
    this.loadProjects();
  }

  loadProjects(): void {
    // Dans un cas réel, vous utiliseriez votre service
    // this.projectService.getProjects().subscribe(projects => {
    //   this.projects = projects;
    //   this.filteredProjects = [...projects];
    // });

    // Données de test
    this.projects = [
      {
        id: 1,
        project_name: 'Site E-commerce',
        model_name: 'Product',
        framework: {
          id: 1, name: 'Django',
          project_type: '',
          type: 'frontend'
        },
        user: 1,
        date_creation: '2025-03-15',
        date_modification: '2025-04-01',
        fields: [
          {
            name: 'name',
            field_type: ''
          },
          {
            name: 'price',
            field_type: ''
          }
        ]
      },
      {
        id: 2,
        project_name: 'Application mobile',
        model_name: 'Order',
        framework: {
          id: 1, name: 'Django',
          project_type: '',
          type: 'frontend'
        },
        user: 1,
        date_creation: '2025-03-28',
        date_modification: '2025-03-30',
        fields: [
          {
            name: 'customer',
            field_type: ''
          },
          {
            name: 'total',
            field_type: ''
          }
        ]
      },
      {
        id: 3,
        project_name: 'Plateforme éducative',
        model_name: 'Course',
        framework: {
          id: 2, name: 'FastAPI',
          project_type: '',
          type: 'frontend'
        },
        user: 1,
        date_creation: '2025-04-05',
        date_modification: '2025-04-08',
        fields: [
          {
            name: 'title',
            field_type: ''
          },
          {
            name: 'description',
            field_type: ''
          }
        ]
      }
    ];
    this.filteredProjects = [...this.projects];
  }

  createNewProject(): void {
    this.router.navigate(['/create-project']);
  }

  searchProjects(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = query;
    this.filteredProjects = this.projects.filter(project => 
      project.project_name.toLowerCase().includes(query) || 
      project.model_name.toLowerCase().includes(query)
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  // Calculer le pourcentage de progression
  getProgress(project: Project): number {
    // Exemple simple: si le projet a des champs définis, on considère qu'il a progressé
    if (project.fields && project.fields.length > 0) {
      return Math.min(Math.floor((project.fields.length / 5) * 100), 100);
    }
    return 20; // Par défaut, 20% si le projet existe mais n'a pas de champs
  }
}