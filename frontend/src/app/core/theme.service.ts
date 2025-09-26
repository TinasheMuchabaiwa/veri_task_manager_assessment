import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  private readonly THEME_STORAGE_KEY = 'task-manager-theme';

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDarkMode;
    this.setTheme(isDarkMode);
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkModeSubject.value;
    this.setTheme(!currentTheme);
  }

  setTheme(isDarkMode: boolean): void {
    this.isDarkModeSubject.next(isDarkMode);

    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
      localStorage.setItem(this.THEME_STORAGE_KEY, 'dark');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
      localStorage.setItem(this.THEME_STORAGE_KEY, 'light');
    }
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
