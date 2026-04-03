import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  showToast = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveRole(response.role);
        this.authService.saveUserId(response.userId);
        // ✅ Save username so home page can display it
        localStorage.setItem('username', response.username);

        this.showToast = true;
        setTimeout(() => {
          if (response.role === 'PLANNER')     this.router.navigate(['/home']);
          else if (response.role === 'STAFF')  this.router.navigate(['/home']);
          else if (response.role === 'CLIENT') this.router.navigate(['/home']);
        }, 1500);
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid username or password ❌');
      }
    });
  }
}
