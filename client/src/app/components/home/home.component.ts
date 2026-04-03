import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // ✅ Pull real username from localStorage (saved on login)
  username = localStorage.getItem('username') || '';
  role = localStorage.getItem('role');
  showOffer = true;

  currentSlide = 0;
  private slideTimer: any;

  // clientLogos = [
  //   { name: 'Amazon', color: '#FF9900', bg: '#FFF3E0', icon: '📦' },
  //   { name: 'Google', color: '#4285F4', bg: '#E8F0FE', icon: '🔍' },
  //   { name: 'Microsoft', color: '#00A4EF', bg: '#E3F2FD', icon: '🪟' },
  //   { name: 'Infosys', color: '#007CC3', bg: '#E1F5FE', icon: '💼' },
  //   { name: 'TCS', color: '#0072C6', bg: '#E3F2FD', icon: '🏢' },
  //   { name: 'Wipro', color: '#341C66', bg: '#F3E5F5', icon: '⚡' },
  //   { name: 'Meta', color: '#1877F2', bg: '#E8F4FD', icon: '🌐' },
  //   { name: 'Apple', color: '#555', bg: '#F5F5F5', icon: '🍎' },
  // ];

  clientLogos = [
  { img: 'https://1000logos.net/wp-content/uploads/2016/10/Amazon-logo-meaning.jpg' },
  { img: 'https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/master/pass/google-logo.jpg' },
  { img: 'https://static.vecteezy.com/system/resources/previews/050/816/799/non_2x/bookmyshow-transparent-icon-free-png.png' },
  { img: 'https://play-lh.googleusercontent.com/HcQNhKAOGBvV0OXP-LLrqltZulaXbyK3A-Am2i1JGH1NKIs3RvIqjJa7m-kNyHaNhujI' },
  { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_7c5ntMMlh2vFkMrDUU6bHBj5WdV3h1gH9w&s' },
  { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYJjBlvPGGVYNtf_eukbArBw_Df_CFLKuBWg&s' },
  { img: 'https://logosandtypes.com/wp-content/uploads/2020/08/Reliance.png' },
  { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP9g7-hkZEXxThotsLBNCFaHo2JMM22EaerA&s' }
];


  // visible window index for the slider
  visibleStart = 0;
  readonly VISIBLE = 4; // show 4 logos at a time

  ngOnInit(): void {
    setTimeout(() => { this.showOffer = false; }, 5000);
    // Auto-slide logos
    this.slideTimer = setInterval(() => {
      this.nextLogos();
    }, 2800);
  }

  ngOnDestroy(): void {
    clearInterval(this.slideTimer);
  }

  closeOffer(): void { this.showOffer = false; }

  get visibleLogos() {
    const len = this.clientLogos.length;
    return Array.from({ length: this.VISIBLE }, (_, i) =>
      this.clientLogos[(this.visibleStart + i) % len]
    );
  }

  nextLogos(): void {
    this.visibleStart = (this.visibleStart + 1) % this.clientLogos.length;
  }

  prevLogos(): void {
    this.visibleStart = (this.visibleStart - 1 + this.clientLogos.length) % this.clientLogos.length;
  }
}

