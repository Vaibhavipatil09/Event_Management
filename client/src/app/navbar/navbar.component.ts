// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
    // Restore saved theme on load
    const saved = localStorage.getItem('ev-theme');
    if (saved === 'dark') {
      this.isDark = true;
      document.body.classList.add('dark-mode');
    } else {
      this.isDark = false;
      document.body.classList.remove('dark-mode');
    }
    this.loadUser();

    // Re-check login state on every navigation (fixes stale state)
    this.router.events.subscribe(() => this.loadUser());
  }

  loadUser(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = localStorage.getItem('role');
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('ev-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('ev-theme', 'light');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.isLoggedIn = false;
    this.role = null;
    this.router.navigate(['/login']);
  }
}
