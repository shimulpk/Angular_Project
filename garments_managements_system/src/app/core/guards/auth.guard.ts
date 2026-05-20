import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const allowedRoles = route.data['roles'] as string[];
    const expectedRole = route.data['role'];
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = authService.currentUserValue?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.navigate(['/dashboard']);
        return false;
      }
    } else if (expectedRole && !authService.hasRole(expectedRole)) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
