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
export const routes: Routes = [
 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'get-started',component: GetStartedComponent,},
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
  { path: 'home', component: HomeComponent, canActivate: [isLoggedInGuard] },
  {
    path: 'create-project',
    component: CreateProjectComponent,
    canActivate: [isLoggedInGuard],
  },
  {
    path: 'project-details',
    component: ProjectDetailsComponent,
    canActivate: [isLoggedInGuard],
  },
  { path: 'project-details/:id', component: ProjectDetailsComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [isLoggedInGuard],
    children: [
      { path: 'users', component: UserListComponent },
      { path: 'users/add', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'users/:id', component: UserDetailComponent },
      // Framework routes
      { path: 'frameworks', component: FrameworkListComponent },
      { path: 'frameworks/add', component: FrameworkFormComponent }, // Added missing "add" route
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
