import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Home,
  FolderKanban,
  CheckSquare,
  BarChart3,
  LucideAngularModule,
  User,
  Menu,
  ChevronLeft,
} from 'lucide-angular';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  menuItems = [
    { label: 'Dashboard', icon: Home, route: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, route: '/dashboard/projects' },
    { label: 'Users', icon: User, route: '/dashboard/users' },
    { label: 'Frameworks', icon: BarChart3, route: '/dashboard/frameworks' },
  ];
  isSidebarCollapsed = false;
  menuIcon = Menu;
  closeIcon = ChevronLeft;
  constructor() {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
