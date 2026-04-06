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

  // ── OTP step state ──
  otpStep    = false;   // false = show registration form, true = show OTP input
  otpValue   = '';      // what the user types in the OTP box
  sendingOtp = false;   // spinner on "Send OTP" button

  // ── Toast ──
  showToast    = false;
  toastMessage = '';
  isError      = false;

  // ── Password toggle ──
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── STEP 1: Validate form then send OTP ──
  sendOtp(): void {
    this.sendingOtp = true;
    this.authService.sendOtp(this.user.email, this.user.username).subscribe({
      next: () => {
        this.sendingOtp = false;
        this.otpStep = true;
        this.showToastMsg(`OTP sent to ${this.user.email}. Check your inbox.`, false);
      },
      error: (err) => {
        this.sendingOtp = false;
        const msg = err.status === 409
          ? '❌ Username already taken. Please choose another!'
          : '❌ Failed to send OTP. Check your email address and try again.';
        this.showToastMsg(msg, true);
      }
    });
  }

  // ── STEP 2: Submit OTP + full user data ──
  register(): void {
    this.authService.registerWithOtp(this.user, this.otpValue).subscribe({
      next: () => {
        this.isError = false;
        this.toastMessage = '🎉 Account created successfully!';
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        if (err.status === 400) {
          this.showToastMsg('❌ Invalid or expired OTP. Please try again.', true);
        } else if (err.status === 409) {
          this.showToastMsg('❌ Username already taken. Please choose another!', true);
        } else {
          this.showToastMsg('❌ Registration failed. Try again.', true);
        }
      }
    });
  }

  // ── Go back to form from OTP screen ──
  backToForm(): void {
    this.otpStep  = false;
    this.otpValue = '';
  }

  // ── Helper ──
  private showToastMsg(msg: string, error: boolean): void {
    this.toastMessage = msg;
    this.isError      = error;
    this.showToast    = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
