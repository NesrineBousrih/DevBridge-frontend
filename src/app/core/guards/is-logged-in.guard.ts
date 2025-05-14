// src/app/core/guards/is-logged-in.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../modules/auth/services/login.service';

/**
 * Guard to protect routes that require authentication
 * @returns Boolean indicating if access is allowed
 */
export const isLoggedInGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  
  console.log('isLoggedInGuard - Checking if user is authenticated');
  
  if (loginService.isAuthenticated()) {
    console.log('isLoggedInGuard - User is authenticated, allowing access');
    return true;
  }
  
  console.log('isLoggedInGuard - User is not authenticated, redirecting to login');
  router.navigate(['/login']);
  return false;
};