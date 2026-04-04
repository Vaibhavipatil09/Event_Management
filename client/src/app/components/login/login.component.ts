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

  // ✅ existing success toast
  showToast = false;

  // ✅ NEW: captcha popup (toast) state (popup should show only on Sign In click)
  showCaptchaToast = false;
  captchaToastMsg = '';

  // ✅ NEW: Simple Math Captcha state
  captchaA = 0;
  captchaB = 0;
  captchaOp: '+' | '-' = '+';
  captchaAnswer = 0;
  captchaQuestion = '';

  captchaInput: number | null = null;
  captchaValid = false;

  constructor(private authService: AuthService, private router: Router) {
    // ✅ captcha generated on component load
    this.generateCaptcha();
  }

  // ✅ NEW: generate captcha like "7 + 4 = ?"
  generateCaptcha(): void {
    this.captchaA = Math.floor(Math.random() * 9) + 1; // 1..9
    this.captchaB = Math.floor(Math.random() * 9) + 1; // 1..9
    this.captchaOp = Math.random() < 0.5 ? '+' : '-';

    // avoid negative answers for subtraction
    if (this.captchaOp === '-' && this.captchaB > this.captchaA) {
      [this.captchaA, this.captchaB] = [this.captchaB, this.captchaA];
    }

    this.captchaAnswer =
      this.captchaOp === '+'
        ? this.captchaA + this.captchaB
        : this.captchaA - this.captchaB;

    this.captchaQuestion = `${this.captchaA} ${this.captchaOp} ${this.captchaB} = ?`;

    // reset input + validity
    this.captchaInput = null;
    this.captchaValid = false;
  }

  // ✅ NEW: validate captcha while typing (NO popup here)
  validateCaptcha(): void {
    this.captchaValid = Number(this.captchaInput) === this.captchaAnswer;
  }

  // ✅ NEW: show popup only on submit
  private openCaptchaToast(msg: string): void {
    this.captchaToastMsg = msg;
    this.showCaptchaToast = true;

    // auto hide after 2 seconds
    setTimeout(() => {
      this.showCaptchaToast = false;
    }, 2000);
  }

  login(): void {
    // ✅ Captcha check happens ONLY when clicking Sign In
    if (!this.captchaValid) {
      this.openCaptchaToast('Captcha answer is wrong, Please try again.');
      this.generateCaptcha(); // refresh captcha after wrong attempt
      return; // stop login API call
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveRole(response.role);
        this.authService.saveUserId(response.userId);

        // ✅ Save username so home page can display it
        localStorage.setItem('username', response.username);

        this.showToast = true;

        setTimeout(() => {
          if (response.role === 'PLANNER') this.router.navigate(['/home']);
          else if (response.role === 'STAFF') this.router.navigate(['/home']);
          else if (response.role === 'CLIENT') this.router.navigate(['/home']);
        }, 1500);
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid username or password ❌');

        // optional: refresh captcha after failed login
        this.generateCaptcha();
      }
    });
  }
}
