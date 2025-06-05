import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  totalUsers: number = 0;

  // Chart configurations
  // User Distribution Chart (formerly Project Status Chart)
  public userDistributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  public userDistributionChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']
    }]
  };
  
  public userDistributionChartType: ChartType = 'pie';

  // Tech Stack Chart (based on project frameworks)
  public techStackChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  public techStackChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#0C4B33', '#DD0031', '#68A063', '#61DAFB', '#764ABC', '#F7DF1E', '#41B883', '#00D8FF']
    }]
  };
  
  public techStackChartType: ChartType = 'bar';

  // Weekly Activity Chart (based on project creation dates)
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
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#8884d8',
      backgroundColor: 'rgba(136, 132, 216, 0.1)',
      fill: true,
      label: 'Projects Created'
    }]
  };
  
  public activityChartType: ChartType = 'line';

  constructor(
    private dashboardService: DashboardService,
    private projectService: ProjectAdminService,
    private userService: UserService,
    private frameworkService: FrameworksService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load all data concurrently
    Promise.all([
      this.loadProjects(),
      this.loadUsers(),
      this.loadFrameworks()
    ]).then(() => {
      // After all data is loaded, update charts and activities
      this.updateWeeklyActivityChart();
      this.updateTechStackChart();
      this.updateUserDistributionChart();
      this.loadRecentActivities();
      
      // Force change detection to update the charts
      this.cdr.detectChanges();
      
      // Additional timeout to ensure charts are properly rendered
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
    });
  }

  private loadProjects(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.projectService.getProjects().subscribe(
        (projects) => {
          this.projects = projects || [];
          this.totalProjects = this.projects.length;
          resolve();
        },
        (error) => {
          console.error('Error loading projects:', error);
          this.projects = [];
          this.totalProjects = 0;
          resolve(); // Don't reject to allow other data to load
        }
      );
    });
  }

  private loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUsers().subscribe(
        (users) => {
          this.users = users || [];
          this.totalUsers = this.users.length;
          resolve();
        },
        (error) => {
          console.error('Error loading users:', error);
          this.users = [];
          this.totalUsers = 0;
          resolve(); // Don't reject to allow other data to load
        }
      );
    });
  }

  private loadFrameworks(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.frameworkService.getFrameworks().subscribe(
        (frameworks) => {
          this.frameworks = frameworks || [];
          resolve();
        },
        (error) => {
          console.error('Error loading frameworks:', error);
          this.frameworks = [];
          resolve(); // Don't reject to allow other data to load
        }
      );
    });
  }

  // Update weekly activity chart based on project creation dates
  private updateWeeklyActivityChart(): void {
    if (!this.projects || this.projects.length === 0) {
      return;
    }

    // Initialize data for each day of the week
    const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    
    // Get the current week's start (Monday)
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    this.projects.forEach(project => {
      // Handle potentially undefined date_creation
      if (!project.date_creation) {
        return; // Skip projects without creation date
      }

      const creationDate = new Date(project.date_creation);
      
      // Validate the date is valid
      if (isNaN(creationDate.getTime())) {
        return; // Skip invalid dates
      }
      
      // Check if the project was created this week
      if (creationDate >= startOfWeek) {
        const dayOfWeek = creationDate.getDay();
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to index 6, Monday (1) to index 0
        weeklyData[index]++;
      }
    });

    // Create new data object to trigger change detection
    this.activityChartData = {
      ...this.activityChartData,
      datasets: [{
        ...this.activityChartData.datasets[0],
        data: [...weeklyData]
      }]
    };
  }

  // Update tech stack chart based on project frameworks
  private updateTechStackChart(): void {
    if (!this.frameworks || this.frameworks.length === 0) {
      this.techStackChartData = {
        ...this.techStackChartData,
        labels: ['No Framework Data'],
        datasets: [{
          ...this.techStackChartData.datasets[0],
          data: [0]
        }]
      };
      return;
    }

    // Initialize framework count map with all available frameworks
    const frameworkCount = new Map<string, number>();
    
    // Initialize all frameworks with 0 count
    this.frameworks.forEach(framework => {
      if (framework.name) {
        frameworkCount.set(framework.name, 0);
      }
    });

    // Count frameworks used in projects
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        let frameworkName: string | null = null;
        
        // Try to get framework name from different possible fields
        if (project.framework_name && project.framework_name.trim() !== '') {
          frameworkName = project.framework_name.trim();
        } else if (project.framework) {
          // Find framework name by ID
          const framework = this.frameworks.find(f => f.id === project.framework);
          if (framework && framework.name) {
            frameworkName = framework.name;
          }
        }
        
        // Only count if we have a valid framework name
        if (frameworkName && frameworkName !== 'undefined' && frameworkName !== 'null') {
          if (frameworkCount.has(frameworkName)) {
            frameworkCount.set(frameworkName, frameworkCount.get(frameworkName)! + 1);
          } else {
            // Add new framework if not in our list
            frameworkCount.set(frameworkName, 1);
          }
        }
      });
    }

    // Convert to chart data
    
    const labels = Array.from(frameworkCount.keys()).filter(key => key && key !== 'undefined');
    const data = labels.map(label => frameworkCount.get(label) || 0);
    
    if (labels.length === 0) {
      this.techStackChartData = {
        ...this.techStackChartData,
        labels: ['No Framework Data'],
        datasets: [{
          ...this.techStackChartData.datasets[0],
          data: [0]
        }]
      };
    } else {
      this.techStackChartData = {
        ...this.techStackChartData,
        labels: [...labels],
        datasets: [{
          ...this.techStackChartData.datasets[0],
          data: [...data]
        }]
      };
    }
  }

  // Update user distribution chart based on user types
  private updateUserDistributionChart(): void {
    if (!this.users || this.users.length === 0) {
      this.userDistributionChartData = {
        ...this.userDistributionChartData,
        labels: ['No Users'],
        datasets: [{
          ...this.userDistributionChartData.datasets[0],
          data: [1]
        }]
      };
      return;
    }

    const userTypeCount = new Map<string, number>();

    // Count users by type
    this.users.forEach(user => {
      // Use user_type if available, otherwise default to 'Developer'
      // Removed user.role as it doesn't exist
      const userType = user.user_type || 'Developer';
      userTypeCount.set(userType, (userTypeCount.get(userType) || 0) + 1);
    });

    // Convert to chart data
    const labels = Array.from(userTypeCount.keys());
    const data = Array.from(userTypeCount.values());

    this.userDistributionChartData = {
      ...this.userDistributionChartData,
      labels: [...labels],
      datasets: [{
        ...this.userDistributionChartData.datasets[0],
        data: [...data]
      }]
    };
  }

  // Load recent activities based on project data
  private loadRecentActivities(): void {
    const activities: any[] = [];
    
    if (this.projects.length > 0) {
      // Sort projects by most recent updates or creation
      const sortedProjects = [...this.projects].sort((a, b) => {
        const dateStrA = a.date_modification || a.date_creation || '';
        const dateStrB = b.date_modification || b.date_creation || '';
        
        // Handle undefined dates
        if (!dateStrA && !dateStrB) return 0;
        if (!dateStrA) return 1;
        if (!dateStrB) return -1;
        
        const dateA = new Date(dateStrA);
        const dateB = new Date(dateStrB);
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateB.getTime() - dateA.getTime();
      });
      
      // Take up to 5 most recent projects
      const recentProjects = sortedProjects.slice(0, 5);
      
      recentProjects.forEach(project => {
        let actionType = 'Project created';
        
        // Determine action based on date fields
        if (project.date_modification && project.date_creation) {
          const modificationDate = new Date(project.date_modification);
          const creationDate = new Date(project.date_creation);
          
          // Validate dates before comparison
          if (!isNaN(modificationDate.getTime()) && !isNaN(creationDate.getTime())) {
            // If modification date is significantly after creation date, it's an update
            if (modificationDate.getTime() > creationDate.getTime() + 60000) { // 1 minute threshold
              actionType = 'Project updated';
            }
          }
        }
        
        const userName = project.username || 'Unknown User';
        const dateStr = project.date_modification || project.date_creation || '';
        
        // Handle undefined dates properly
        let dateObj: Date;
        if (dateStr) {
          dateObj = new Date(dateStr);
          if (isNaN(dateObj.getTime())) {
            dateObj = new Date(); // Fallback to current date for invalid dates
          }
        } else {
          dateObj = new Date(); // Fallback to current date for missing dates
        }
        
        activities.push({
          id: project.id,
          action: actionType,
          project: project.project_name || `Project ${project.id}`,
          time: this.getRelativeTimeString(dateObj),
          user: userName
        });
      });
    }
    
    this.recentActivities = activities.length > 0 ? activities : [{
      id: 0,
      action: 'No recent activities',
      project: 'N/A',
      time: 'N/A',
      user: 'N/A'
    }];
  }
  
  // Helper method to create relative time strings
  private getRelativeTimeString(date: Date): string {
    try {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (isNaN(diffInSeconds) || diffInSeconds < 0) {
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
      if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      }
      
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 'recently';
    }
  }

  changeView(view: string): void {
    this.selectedView = view;
  }
}