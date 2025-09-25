import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

interface StandardResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on service initialization
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearAuthData();
      }
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<StandardResponse<AuthResponse>>('/auth/register', request)
      .pipe(
        map(response => response.data),
        tap(authData => {
          this.handleAuthSuccess(authData);
        })
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<StandardResponse<AuthResponse>>('/auth/login', request)
      .pipe(
        map(response => response.data),
        tap(authData => {
          this.handleAuthSuccess(authData);
        })
      );
  }

  private handleAuthSuccess(authData: AuthResponse): void {
    // Store JWT token
    localStorage.setItem(this.TOKEN_KEY, authData.token);

    // Create user object and store it
    const user: User = {
      id: 0, // Will be set by backend in future
      username: authData.username,
      createdAt: new Date() // Placeholder
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired (basic JWT parsing)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}