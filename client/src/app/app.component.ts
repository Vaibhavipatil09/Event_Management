import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  showNavbar = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        const hiddenRoutes = ['/login', '/register'];

        this.showNavbar = !hiddenRoutes.includes(event.url);
      }
    });
  }
}