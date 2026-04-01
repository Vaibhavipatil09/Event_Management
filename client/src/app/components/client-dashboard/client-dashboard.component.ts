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

  /** NEW — payment amount per event (keyed by event.id) */
  paymentAmountMap: { [key: number]: number } = {};

  /** NEW — spinner/loading state per event during payment processing */
  processingPayment: { [key: number]: boolean } = {};

  /** NEW — global payment success/error state for toast messages */
  paymentSuccess: boolean = false;
  paymentMessage: string = '';
  paymentError: string = '';

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    const clientId = this.authService.getUserId();
    if (clientId) {
      this.clientService.getEventsByClient(clientId).subscribe({
        next: (data) => this.events = data,
        error: (err) => console.error(err)
      });
    } else {
      this.clientService.getEvents().subscribe({
        next: (data) => this.events = data,
        error: (err) => console.error(err)
      });
    }
  }

  provideFeedback(eventId: any, feedback?: string): void {
    const fb = feedback || this.feedbackMap[eventId];
    this.clientService.provideFeedback(eventId, fb).subscribe({
      next: (updated) => {
        const index = this.events.findIndex(e => e.id === updated.id);
        if (index !== -1) this.events[index] = updated;
        this.feedbackMap = {};
      },
      error: (err) => console.error(err)
    });
  }

  /**
   * NEW — Pay for a completed event.
   * Only called when the event status is 'Completed' (button is shown only then in the template).
   * Guards are also applied here for safety.
   */
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

    // Reset previous messages
    this.paymentSuccess = false;
    this.paymentMessage = '';
    this.paymentError = '';

    this.processingPayment[eventId] = true;

    this.clientService.payForEvent(eventId, amount).subscribe({
      next: (response) => {
        this.processingPayment[eventId] = false;
        this.paymentSuccess = true;
        this.paymentMessage = `Transaction ID: ${response.transactionId} | ₹${response.amountPaid} paid for "${response.eventTitle}"`;
        // Clear amount input after successful payment
        this.paymentAmountMap[eventId] = 0;
      },
      error: (err) => {
        this.processingPayment[eventId] = false;
        this.paymentError = err?.error?.message || 'Payment failed. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
