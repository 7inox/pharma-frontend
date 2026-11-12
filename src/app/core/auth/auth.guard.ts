import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from './auth.model';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).validSession()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

export const guestGuard: CanActivateFn = () =>
  inject(AuthService).validSession() ? inject(Router).createUrlTree(['/inicio']) : true;

export const permissionGuard: CanActivateFn = route => {
  const permission = route.data['permission'] as Permiso | undefined;
  return !permission || inject(AuthService).has(permission)
    ? true
    : inject(Router).createUrlTree(['/acceso-denegado']);
};
