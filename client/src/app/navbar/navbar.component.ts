import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  isLoggedIn = false;
  role: string | null = null;
  isDark = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = localStorage.getItem('role');
  }
toggleTheme() {
  this.isDark = !this.isDark;
  document.body.classList.toggle('dark-mode', this.isDark);
}
  logout() {
    // 🔥 clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    // ✅ update UI instantly
    this.isLoggedIn = false;
    this.role = null;

    // ✅ Angular navigation
    this.router.navigate(['/login']);
  }
}