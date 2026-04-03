// client-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { Event } from '../../models/event.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ClientDashboardComponent implements OnInit {

  events: Event[] = [];
  feedbackMap: { [key: number]: string } = {};
  paymentAmountMap: { [key: number]: number } = {};
  processingPayment: { [key: number]: boolean } = {};
  paymentSuccess = false;
  paymentMessage = '';
  paymentError   = '';

  get completedCount(): number {
    return this.events.filter(e => e.status === 'Completed').length;
  }
  get pendingCount(): number {
    return this.events.length - this.completedCount;
  }
  get progressPct(): number {
    return this.events.length
      ? Math.round((this.completedCount / this.events.length) * 100)
      : 0;
  }

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void { this.getEvents(); }

  getEvents(): void {
    const clientId = this.authService.getUserId();
    const obs = clientId
      ? this.clientService.getEventsByClient(clientId)
      : this.clientService.getEvents();
    obs.subscribe({ next: d => this.events = d, error: e => console.error(e) });
  }

  provideFeedback(eventId: any, feedback?: string): void {
    const fb = feedback || this.feedbackMap[eventId];
    this.clientService.provideFeedback(eventId, fb).subscribe({
      next: updated => {
        const i = this.events.findIndex(e => e.id === updated.id);
        if (i !== -1) this.events[i] = updated;
        this.feedbackMap = {};
      },
      error: e => console.error(e)
    });
  }

  payForEvent(eventId: any): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event || event.status !== 'Completed') {
      this.paymentError = 'Payment is only allowed for completed events.';
      return;
    }
    const amount = this.paymentAmountMap[eventId];
    if (!amount || amount <= 0) {
      this.paymentError = 'Please enter a valid payment amount.';
      return;
    }
    this.paymentSuccess = false;
    this.paymentMessage = '';
    this.paymentError   = '';
    this.processingPayment[eventId] = true;

    this.clientService.payForEvent(eventId, amount).subscribe({
      next: response => {
        this.processingPayment[eventId] = false;
        this.paymentSuccess = true;
        this.paymentMessage = `✅ ₹${response.amountPaid} paid for "${response.eventTitle}" — TxID: ${response.transactionId}`;
        this.paymentAmountMap[eventId] = 0;
        setTimeout(() => { this.paymentSuccess = false; }, 5000);
      },
      error: err => {
        this.processingPayment[eventId] = false;
        this.paymentError = err?.error?.message || 'Payment failed. Please try again.';
        setTimeout(() => { this.paymentError = ''; }, 5000);
      }
    });
  }

  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
