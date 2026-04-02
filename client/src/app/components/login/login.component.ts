import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { RouterModule } from '@angular/router';
import { User, Credentials, AuthResponse } from '../../models/user.model';

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

  constructor(private authService: AuthService, private router: Router) { }

 login(): void {

  this.authService.login(this.credentials).subscribe({

    next: (response) => {

      // ✅ SAVE DATA
      this.authService.saveToken(response.token);
      this.authService.saveRole(response.role);
      this.authService.saveUserId(response.userId);

      // ✅ SHOW TOAST ONLY AFTER SUCCESS
      this.showToast = true;

      // ⏳ Delay navigation so toast is visible
      setTimeout(() => {

        if (response.role === 'PLANNER') {
          this.router.navigate(['/planner-dashboard']);
        } 
        else if (response.role === 'STAFF') {
          this.router.navigate(['/staff-dashboard']);
        } 
        else if (response.role === 'CLIENT') {
          this.router.navigate(['/client-dashboard']);
        }

      }, 1500);

    },

    error: (err) => {
      console.error("Login failed:", err);
      alert("Invalid username or password ❌"); // simple handling
    }

  });
}
}
