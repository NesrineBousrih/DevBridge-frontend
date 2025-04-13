import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../../modules/auth/services/login.service';

export const isNotLoggedInGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isAuthenticated()) {
    router.navigate(['home']);
    return false;
  }

  return true;
};
