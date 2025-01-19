import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authKey = inject(AuthService).getToken();
  if (authKey) { return true; } else { router.navigate(['/login']); return false; }
};
