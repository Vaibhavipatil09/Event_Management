import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  role: string | null = null;
  isDark = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Restore saved theme
    const saved = localStorage.getItem('ev-theme');
    this.isDark = saved === 'dark';
    document.body.classList.toggle('dark-mode', this.isDark);

    this.loadUser();
    // Re-check login on every navigation
    this.router.events.subscribe(() => this.loadUser());
  }

  loadUser(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = localStorage.getItem('role');
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-mode', this.isDark);
    localStorage.setItem('ev-theme', this.isDark ? 'dark' : 'light');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    this.isLoggedIn = false;
    this.role = null;
    this.router.navigate(['/login']);
  }

  /** Navigate to home then scroll to a section fragment */
  scrollToSection(sectionId: string): void {
    const currentUrl = this.router.url;
    if (currentUrl === '/home' || currentUrl === '/') {
      // Already on home — just scroll
      this._scroll(sectionId);
    } else {
      // Navigate to home first, then scroll after render
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => this._scroll(sectionId), 150);
      });
    }
  }

  scrollToTop(): void {
    const currentUrl = this.router.url;
    if (currentUrl === '/home' || currentUrl === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/home']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  private _scroll(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  isMenuOpen = false;

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}
}
