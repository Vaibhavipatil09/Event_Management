import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    const token = this.authService.getToken() || '';
    return this.authService.isTokenExpired(token).pipe(
      map(isExpired => {
        if (isExpired) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}