import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { ProjectAdminService } from '../../services/project-admin.service';
import { UserService } from '../../services/users.service';
import { FrameworksService } from '../../services/frameworks.service';
import { Project } from '../../../../core/models/project';
import { User } from '../../../../core/models/user';
import { Framework } from '../../../../core/models/framework';
import { LucideAngularModule } from 'lucide-angular';
import { 
  Activity, Database, Download, Users, Code, Server, 
  Plus, Settings, CheckCircle, AlertCircle, BarChart3 
} from 'lucide-angular';

// Chart.js imports
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgChartsModule,
    LucideAngularModule
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  // Icons
  protected readonly activityIcon = Activity;
  protected readonly databaseIcon = Database;
  protected readonly downloadIcon = Download;
  protected readonly usersIcon = Users;
  protected readonly codeIcon = Code;
  protected readonly serverIcon = Server;
  protected readonly plusIcon = Plus;
  protected readonly settingsIcon = Settings;
  protected readonly checkCircleIcon = CheckCircle;
  protected readonly alertCircleIcon = AlertCircle;
  protected readonly barChartIcon = BarChart3;

  // Data properties
  selectedView: string = 'overview';
  projects: Project[] = [];
  users: User[] = [];
  frameworks: Framework[] = [];
  recentActivities: any[] = [];
  totalProjects: number = 0;
  
 
  

  // Chart configurations
  // Project Status Chart
  public projectStatusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  public projectStatusChartData: ChartData<'pie'> = {
    labels: ['Planning', 'Development', 'Completed'],
    datasets: [{
      data: [12, 25, 18],
      backgroundColor: ['#8884d8', '#82ca9d', '#ffc658']
    }]
  };
  
  public projectStatusChartType: ChartType = 'pie';

  // Tech Stack Chart
  public techStackChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  public techStackChartData: ChartData<'bar'> = {
    labels: ['Django', 'Angular'],
    datasets: [{
      data: [35, 28, 15, 22],
      backgroundColor: ['#0C4B33', '#DD0031', '#68A063', '#61DAFB']
    }]
  };
  
  public techStackChartType: ChartType = 'bar';

  // Activity Chart
  public activityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: {
        tension: 0.4
      }
    }
  };
  
  public activityChartData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [12, 19, 8, 24, 15, 6, 4],
      borderColor: '#8884d8',
      backgroundColor: 'rgba(136, 132, 216, 0.1)',
      fill: true
    }]
  };
  
  public activityChartType: ChartType = 'line';

  constructor(
    private dashboardService: DashboardService,
    private projectService: ProjectAdminService,
    private userService: UserService,
    private frameworkService: FrameworksService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load projects
    this.projectService.getProjects().subscribe(
      (projects) => {
        this.projects = projects;
        this.totalProjects = projects.length;
        
        // Update project status chart with real data
        const planning = projects.filter(p => p.status === 'planning').length;
        const development = projects.filter(p => p.status === 'development').length;
        const completed = projects.filter(p => p.status === 'completed').length;
        
        this.projectStatusChartData.datasets[0].data = [planning, development, completed];
        
        // Load users first, then load recent activities
        this.userService.getUsers().subscribe(
          (users) => {
            this.users = users;
            
            // Now load recent activities with user data available
            this.loadRecentActivities();
          },
          (error) => console.error('Error loading users:', error)
        );
      },
      (error) => console.error('Error loading projects:', error)
    );

    // Load frameworks and update tech stack distribution
    this.loadFrameworksData();
  }
  
  // New method to load framework data and update tech stack chart
  loadFrameworksData(): void {
    this.frameworkService.getFrameworks().subscribe(
      (frameworks) => {
        // Check if frameworks is null, undefined or empty
        if (!frameworks || frameworks.length === 0) {
          console.warn('No frameworks data received, using default values');
          this.frameworks = [
            { id: 1, name: 'Angular', type: 'frontend' } as Framework,
            { id: 2, name: 'Django', type: 'backend' } as Framework
          ];
        } else {
          this.frameworks = frameworks;
        }
        
        // Process frameworks for tech stack chart
        this.updateTechStackChart(this.frameworks);
      },
      (error) => {
        console.error('Error loading frameworks:', error);
        // Use default frameworks data if there's an error
        this.frameworks = [
          { id: 1, name: 'Angular', type: 'frontend' } as Framework,
          { id: 2, name: 'Django', type: 'backend' } as Framework
        ];
        this.updateTechStackChart(this.frameworks);
      }
    );
  }
  
  // Method to update tech stack chart based on frameworks data
  updateTechStackChart(frameworks: Framework[]): void {
    // Group frameworks by type (or any relevant property)
    const frameworkTypes = new Map<string, number>();
    
    // Count frameworks by name/type
    frameworks.forEach(framework => {
      if (framework && framework.name) {
        const name = framework.name;
        frameworkTypes.set(name, (frameworkTypes.get(name) || 0) + 1);
      }
    });
    
    // Prepare data for chart
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];
    
    // Generate color palette based on number of frameworks
    const baseColors = ['#0C4B33', '#DD0031', '#68A063', '#61DAFB', '#764ABC', '#F7DF1E', '#41B883', '#00D8FF'];
    
    // Convert Map to arrays for chart data
    let i = 0;
    frameworkTypes.forEach((count, name) => {
      labels.push(name);
      data.push(count);
      backgroundColor.push(baseColors[i % baseColors.length]);
      i++;
    });
    
    // If no data, set defaults
    if (labels.length === 0) {
      labels.push('Angular', 'Django');
      data.push(1, 1);
      backgroundColor.push('#DD0031', '#0C4B33');
    }
    
    // Update chart data
    this.techStackChartData.labels = labels;
    this.techStackChartData.datasets[0].data = data;
    this.techStackChartData.datasets[0].backgroundColor = backgroundColor;
  }
  
  // New method to load recent activities
  loadRecentActivities(): void {
    // Get activities from projects and users
    const activities: any[] = [];
    
    if (this.projects.length > 0) {
      // Sort projects by most recent updates
      // Handle missing date fields safely
      const sortedProjects = [...this.projects].sort((a, b) => {
        // Default to current time if dates are missing
        // Handle undefined values safely
        const dateStrA = a.date_modification || a.date_creation || '';
        const dateStrB = b.date_modification || b.date_creation || '';
        
        const dateA = dateStrA ? new Date(dateStrA) : new Date();
        const dateB = dateStrB ? new Date(dateStrB) : new Date();
        
        return dateB.getTime() - dateA.getTime();
      });
      
      // Take up to 5 most recent projects
      const recentProjects = sortedProjects.slice(0, 5);
      
      // Transform into activity records
      recentProjects.forEach(project => {
        // Determine action type based on project status or other properties
        let actionType = 'Project updated';
        if (project.status === 'planning') {
          actionType = 'Project created';
        } else if (project.status === 'completed') {
          actionType = 'Project completed';
        }
        
        // Find the user who created this project
       
        let userName  = project.username; //'Unknown user';
       // if (project.username && this.users && this.users.length > 0) //{
          //const user = this.users.find(u => u.id === project.date_creation);
          //if (user) {
           // userName = user.username;
          //}
       // }
        
        // Create activity entry with safe date handling
        // FIX: Convert string to Date object - handle undefined values safely
        const dateStr = project.date_modification || project.date_creation || '';
        const dateObj = dateStr ? new Date(dateStr) : new Date();
        
        activities.push({
          id: project.id,
          action: actionType,
          project: project.project_name || `Project ${project.id}`,
          time: this.getRelativeTimeString(dateObj),
          user: userName
        });
      });
    }
    
    this.recentActivities = activities;
    
    // If no activities were generated, add a default one
    if (activities.length === 0) {
      this.recentActivities = [{
        id: 0,
        action: 'No recent activities',
        project: 'N/A',
        time: 'N/A',
        user: 'N/A'
      }];
    }
  }
  
  // Helper method to create relative time strings (e.g., "10 minutes ago")
  getRelativeTimeString(date: Date): string {
    try {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (isNaN(diffInSeconds)) {
        return 'recently';
      }
      
      if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 'recently';
    }
  }

  changeView(view: string): void {
    this.selectedView = view;
  }
}