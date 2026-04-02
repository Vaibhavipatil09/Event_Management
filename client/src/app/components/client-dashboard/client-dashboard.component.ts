import { Component, OnInit, NgZone } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { Event } from '../../models/event.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

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
  paidEvents: Set<any> = new Set();
  paymentSuccess: boolean = false;
  paymentMessage: string = '';
  paymentError: string = '';

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
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

  provideFeedback(eventId: any): void {
    const fb = this.feedbackMap[eventId];
    this.clientService.provideFeedback(eventId, fb).subscribe({
      next: (updated) => {
        const index = this.events.findIndex(e => e.id === updated.id);
        if (index !== -1) this.events[index] = updated;
        this.feedbackMap = {};
      },
      error: (err) => console.error(err)
    });
  }

  payNow(eventId: any): void {
    const amount = this.paymentAmountMap[eventId];

    this.paymentSuccess = false;
    this.paymentMessage = '';
    this.paymentError = '';

    if (!amount || amount <= 0) {
      this.paymentError = 'Please enter a valid amount.';
      return;
    }

    if (!(window as any).Razorpay) {
      this.paymentError = 'Payment SDK not loaded. Please refresh the page.';
      return;
    }

    this.processingPayment[eventId] = true;

    fetch(`${environment.apiUrl}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount })
    })
      .then(res => {
        return res.json().then(data => {
          if (!res.ok) {
            const errMsg = data?.error?.description
              || data?.error?.code
              || 'Payment could not be initiated. Please try again.';
            throw new Error(errMsg);
          }
          return data;
        });
      })
      .then(order => {
        const options: any = {
          key: 'rzp_test_SYW156XbFnfQSK',
          amount: order.amount,
          currency: 'INR',
          name: 'Event Management',
          description: 'Event Payment',
          order_id: order.id,

          handler: (response: any) => {
            // NgZone.run() forces Angular to detect changes from this external callback
            this.ngZone.run(() => {
              this.processingPayment[eventId] = false;
              this.paidEvents.add(eventId);
              this.paymentSuccess = true;
              this.paymentMessage = 'Payment successful!';
              this.paymentAmountMap[eventId] = 0;
            });

            // Verify in background
            fetch(`${environment.apiUrl}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            })
              .then(res => res.json())
              .then(result => {
                this.ngZone.run(() => {
                  if (result.message) this.paymentMessage = result.message;
                });
              })
              .catch(() => {});
          },

          modal: {
            ondismiss: () => {
              this.ngZone.run(() => {
                this.processingPayment[eventId] = false;
              });
            },
            handleback: true,
            escape: true
          },

          theme: { color: '#3399cc' }
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', (response: any) => {
          rzp.close();
          this.ngZone.run(() => {
            this.processingPayment[eventId] = false;
            this.paymentError = response?.error?.description
              || response?.error?.reason
              || 'Payment failed. Please try again.';
          });
        });

        rzp.open();
      })
      .catch(err => {
        this.ngZone.run(() => {
          this.processingPayment[eventId] = false;
          this.paymentError = err.message;
        });
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
