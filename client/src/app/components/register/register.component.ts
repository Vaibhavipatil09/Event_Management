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
  isError = false;

  constructor(private authService: AuthService, private router: Router) { }

  // register(): void {

  //   this.authService.register(this.user).subscribe({
  //     next: () => {

  //       this.toastMessage = "🎉 Account created successfully!";
  //       this.showToast = true;


  //       setTimeout(() => {
  //         this.showToast = false;
  //         this.router.navigate(['/login']);
  //       }, 2500);
  //     },

  //     error: (err) => {
  //       console.error(err);


  //       this.toastMessage = "❌ Registration failed. Try again!";
  //       this.showToast = true;

  //       setTimeout(() => {
  //         this.showToast = false;
  //       }, 2500);
  //     }
  //   });
  // }

  register(): void {
    this.authService.register(this.user).subscribe({
      next: () => {
        this.isError = false;
        this.toastMessage = "🎉 Account created successfully!";
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
          this.router.navigate(['/login']);
        }, 2500);
      },

      error: (err) => {
        this.isError = true; 
        console.error(err);

        // ADD THIS: show specific message for duplicate username
        if (err.status === 409) {
          this.toastMessage = "❌ Username already taken. Please choose another!";
        } else {
          this.toastMessage = "❌ Registration failed. Try again!";
        }

        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 2500);
      }
    });
  }
}