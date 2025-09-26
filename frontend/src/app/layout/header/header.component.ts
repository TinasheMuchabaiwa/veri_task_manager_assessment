import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  breadcrumbs: string = 'Dashboard';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.updateBreadcrumbs((event as NavigationEnd).url);
      });

    this.updateBreadcrumbs(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(segment => segment);

    if (segments.includes('dashboard')) {
      if (segments.includes('tasks')) {
        this.breadcrumbs = 'Dashboard / All Tasks';
      } else if (segments.includes('completed')) {
        this.breadcrumbs = 'Dashboard / Completed Tasks';
      } else if (segments.includes('profile')) {
        this.breadcrumbs = 'Dashboard / Profile';
      } else if (segments.includes('settings')) {
        this.breadcrumbs = 'Dashboard / Settings';
      } else {
        this.breadcrumbs = 'Dashboard';
      }
    } else {
      this.breadcrumbs = 'Dashboard';
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
