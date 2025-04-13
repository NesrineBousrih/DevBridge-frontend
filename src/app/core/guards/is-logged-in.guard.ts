import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../../modules/auth/services/login.service';
import { catchError, map, of } from 'rxjs';

export const isLoggedInGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // Vérifie si un token est présent (authentifié)
  if (loginService.isAuthenticated()) {
    return true;
  }

  // Tente de récupérer l'utilisateur si pas encore chargé
  return loginService.getUser().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['login']);
      return of(false);
    })
  );
};
