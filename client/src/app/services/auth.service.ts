import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse, Credentials } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/user`;

  constructor(private http: HttpClient) {}

  // ── STEP 1: Send OTP to email before registration ──
  sendOtp(email: string, username: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/send-otp`, { email, username });
  }

  // ── STEP 2: Submit full registration + OTP together ──
  registerWithOtp(user: User, otp: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, { ...user, otp });
  }

  // ── Original register (kept for any backward compatibility) ──
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, user);
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveRole(role: string): void {
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  saveUserId(id: number): void {
    localStorage.setItem('userId', id.toString());
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  isTokenExpired(token: string): Observable<boolean> {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return of(isExpired);
    } catch (e) {
      return of(true);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }
}
