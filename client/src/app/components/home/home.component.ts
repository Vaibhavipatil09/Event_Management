import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'] // ✅ FIXED
})
export class HomeComponent implements OnInit{

  username = localStorage.getItem('username') || 'Guest';
  role = localStorage.getItem('role');

  showOffer = true;

  ngOnInit() {
    setTimeout(() => {
      this.showOffer = false;
    }, 5000);
  }

  closeOffer() {
    this.showOffer = false;
  }
}