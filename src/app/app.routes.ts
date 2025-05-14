import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/components/login/login.component';
import { RegisterComponent } from './modules/auth/components/register/register.component';
import { HomeComponent } from './modules/home/components/home/home.component';
import { isLoggedInGuard } from './core/guards/is-logged-in.guard';
import { isNotLoggedInGuard } from './core/guards/is-not-logged-in.guard';
import { DashboardComponent } from './modules/dashboard/pages/dashboard/dashboard.component';
import { UserListComponent } from './modules/dashboard/components/user-list/user-list.component';
import { UserDetailComponent } from './modules/dashboard/components/user-details/user-details.component';
import { UserFormComponent } from './modules/dashboard/components/user-form/user-form.component';
import { FrameworkListComponent } from './modules/dashboard/components/framework-list/framework-list.component';
import { FrameworkDetailsComponent } from './modules/dashboard/components/framework-details/framework-details.component';
import { FrameworkFormComponent } from './modules/dashboard/components/framework-form/framework-form.component';
import { CreateProjectComponent } from './modules/project/components/create-project/create-project.component';
import { ProjectDetailsComponent } from './modules/project/components/project-details/project-details.component';
import { ProjectListComponent } from './modules/dashboard/components/project-list/project-list.component';
import { ProjectDetailComponent } from './modules/dashboard/components/project-detail/project-detail.component';
import { GetStartedComponent } from './modules/getstarted/components/get-started/get-started.component';
import { ProjectUpdateComponent } from './modules/project/components/update-project/update-project.component';
import { DashboardHomeComponent } from './modules/dashboard/pages/dashboard-home/dashboard-home.component';
import { roleGuard } from './core/guards/role.guard';
import { DeveloperProfileComponent } from './modules/developer-profile/developer-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Public routes - accessible without login
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [isNotLoggedInGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [isNotLoggedInGuard],
  },
  {
    path: 'get-started',
    component: GetStartedComponent,
    canActivate: [isNotLoggedInGuard]
  },
  
  // Developer routes - require login and developer role
  {
    path: 'home', 
    component: HomeComponent, 
    canActivate: [isLoggedInGuard, roleGuard(['developer'])]
  },
  {
    path: 'developer-profile',  // Changed from profile to developer-profile
    component: DeveloperProfileComponent,
    canActivate: [isLoggedInGuard, roleGuard(['developer'])],
  },
  {
    path: 'create-project',
    component: CreateProjectComponent,
    canActivate: [isLoggedInGuard, roleGuard(['developer'])]
  },
  {
    path: 'project-details',
    component: ProjectDetailsComponent,
    canActivate: [isLoggedInGuard, roleGuard(['developer'])],
  },
  {
    path: 'project-details/:id',
    component: ProjectDetailsComponent,
    canActivate: [isLoggedInGuard, roleGuard(['developer'])],
  },
  {
    path: 'update-project/:id',
    component: ProjectUpdateComponent,
    canActivate: [isLoggedInGuard, roleGuard(['developer'])],
  },
  
  // Admin routes - require login and admin role
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [isLoggedInGuard, roleGuard(['admin'])],
    children: [
      {
        path: '',
        component: DashboardHomeComponent
      },
      { path: 'users', component: UserListComponent },
      { path: 'users/add', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'users/:id', component: UserDetailComponent },
      // Framework routes
      { path: 'frameworks', component: FrameworkListComponent },
      { path: 'frameworks/add', component: FrameworkFormComponent },
      { path: 'frameworks/edit/:id', component: FrameworkFormComponent },
      { path: 'frameworks/:id', component: FrameworkDetailsComponent },
      {
        path: 'projects',
        component: ProjectListComponent,
      },
      {
        path: 'projects/:id',
        component: ProjectDetailComponent,
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];