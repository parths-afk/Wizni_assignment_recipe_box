import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// interceptors - injects headers (Bearer token) into all HTTP requests.

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getToken()).pipe(
    switchMap(token => {
      let authReq = req;

      // needed to add this because of firebase behaviour
      if (token) {
        if (req.url.includes('firebaseio.com')) {
          authReq = req.clone({ setParams: { auth: token } });
        } else {
          authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            console.error('Unauthorized request - redirecting to login');
            authService.logout().then(() => router.navigate(['/login']));
          }
          return throwError(() => error);
        })
      );
    })
  );
};