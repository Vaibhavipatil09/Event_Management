import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule]
})
export class RegisterComponent {

  user: User = {
    username: '',
    email: '',
    password: '',
    role: 'PLANNER'
  };

  showToast = false;
  toastMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {

    this.authService.register(this.user).subscribe({
      next: () => {
        
        this.toastMessage = "🎉 Account created successfully!";
        this.showToast = true;

        
        setTimeout(() => {
          this.showToast = false;
          this.router.navigate(['/login']);
        }, 2500);
      },

      error: (err) => {
        console.error(err);

      
        this.toastMessage = "❌ Registration failed. Try again!";
        this.showToast = true;

        setTimeout(() => {
          this.showToast = false;
        }, 2500);
      }
    });
  }
}