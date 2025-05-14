// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard to restrict access based on user role
 * @param allowedRoles Array of user roles that are allowed to access the route
 * @returns Boolean indicating if access is allowed
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    
    // Get user type directly from localStorage
    const userType = localStorage.getItem('user_type');
    const token = localStorage.getItem('token');
    
    if (!token || !userType) {
      router.navigate(['/login']);
      return false;
    }
    
    try {
      // Check if user role is in allowed roles
      if (userType && allowedRoles.includes(userType)) {
        return true;
      }
      
      // Redirect based on role if unauthorized
      if (userType === 'developer') {
        router.navigate(['/home']);
      } else if (userType === 'admin') {
        router.navigate(['/dashboard']);
      } else {
        router.navigate(['/login']);
      }
      
      return false;
    } catch (error) {
      console.error('Error parsing user data', error);
      router.navigate(['/login']);
      return false;
    }
  };
};