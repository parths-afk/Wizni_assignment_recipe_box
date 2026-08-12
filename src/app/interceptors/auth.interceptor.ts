import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getToken()).pipe(
    switchMap(token => {
      let authReq = req;

      if (token) {
        // If talking to Firebase Realtime DB, attach token as a query parameter
        if (req.url.includes('firebaseio.com')) {
          authReq = req.clone({ setParams: { auth: token } });
        } else {
          // If talking to a standard backend, use the Bearer header
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