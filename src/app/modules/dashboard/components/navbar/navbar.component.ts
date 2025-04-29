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
    
  
  }
  
  logout(): void {
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}