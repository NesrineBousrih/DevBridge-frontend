import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  LucideAngularModule,
  User, 
  Bell, 
  LogOut, 
  Settings,
  LayoutDashboard 
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: any = {};
  notifications: any[] = [];
  
  // Icon definitions
  userIcon = User;
  bellIcon = Bell;
  logoutIcon = LogOut;
  settingsIcon = Settings;
  dashboardIcon = LayoutDashboard;
  
  constructor(
    private navbarService: NavbarService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Load user info
    this.navbarService.getUserInfo().subscribe({
      next: (data) => { 
        this.user = data; 
      },
      error: (err) => { 
        console.error('User info error:', err); 
      }
    });
    
    // Load notifications
    this.navbarService.getNotifications().subscribe({
      next: (data) => { 
        this.notifications = data; 
      },
      error: (err) => { 
        console.error('Notifications error:', err); 
      }
    });
  }
  
  logout(): void {
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}