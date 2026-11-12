import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const apiUrl = environment.apiUrl.replace(/\/$/, '');
const isApiRequest = (url: string) => url === apiUrl || url.startsWith(`${apiUrl}/`);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token();
  if (!token || !isApiRequest(request.url) || request.url === `${apiUrl}/auth/login`) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if (isApiRequest(request.url) && error.status === 401 &&
        request.url !== `${apiUrl}/auth/login` && auth.authenticated()) {
      auth.closeExpired(router.url);
    }
    // A 403 leaves the session intact so the current page can show the API message.
    return throwError(() => error);
  }));
};
