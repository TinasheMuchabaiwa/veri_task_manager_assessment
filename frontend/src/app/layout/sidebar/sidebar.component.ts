import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../core/theme.service';
import { User } from '../../models/user.model';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isDarkMode = false;

  @Output() menuItemClicked = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  navigationItems: NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', active: true },
    { label: 'All Tasks', icon: 'assignment', route: '/tasks' },
    { label: 'Completed', icon: 'done_all', route: '/completed' }
  ];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDarkMode => {
        this.isDarkMode = isDarkMode;
      });

    this.updateActiveNavigation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateTo(item: NavigationItem): void {
    this.navigationItems.forEach(nav => nav.active = false);
    item.active = true;
    this.router.navigate([item.route]);
    this.menuItemClicked.emit();
  }

  logout(): void {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      this.authService.logout();
    }
  }

  private updateActiveNavigation(): void {
    const currentRoute = this.router.url;
    this.navigationItems.forEach(item => {
      item.active = currentRoute.startsWith(item.route);
    });
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }
}
