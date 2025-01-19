import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core'
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authToken = inject(AuthService).getToken();
  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${authToken}`),
  });
  return next(newReq);
};
