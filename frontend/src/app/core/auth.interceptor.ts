import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token && this.shouldAddToken(request.url)) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authRequest);
    }

    return next.handle(request);
  }

  private shouldAddToken(url: string): boolean {
    // Don't add token to auth endpoints (they don't need it)
    const excludeUrls = ['/auth/login', '/auth/register'];
    return !excludeUrls.some(excludeUrl => url.includes(excludeUrl));
  }
}