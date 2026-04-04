// client-dashboard.component.ts
import { Component, NgZone, OnInit } from '@angular/core';
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
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadPaidEvents(); // restore from localStorage before loading events
    this.getEvents();
  }

  // ── localStorage helpers ──────────────────────────────────

  private storageKey(): string {
    return `paidEvents_${this.authService.getUserId()}`;
  }

  private loadPaidEvents(): void {
    try {
      const stored = localStorage.getItem(this.storageKey());
      if (stored) {
        const ids: any[] = JSON.parse(stored);
        ids.forEach(id => this.paidEvents.add(id));
      }
    } catch { /* ignore parse errors */ }
  }

  private persistPaidEvent(eventId: any): void {
    try {
      const stored = localStorage.getItem(this.storageKey());
      const ids: any[] = stored ? JSON.parse(stored) : [];
      if (!ids.includes(eventId)) {
        ids.push(eventId);
        localStorage.setItem(this.storageKey(), JSON.stringify(ids));
      }
    } catch { /* ignore storage errors */ }
  }

  // ─────────────────────────────────────────────────────────

  getEvents(): void {
    const clientId = this.authService.getUserId();
    if (clientId) {
      this.clientService.getEventsByClient(clientId).subscribe({
        next: (data) => {
          this.events = data;
          // Sync paidEvents Set with DB — handles page refresh / cross-device
          data.forEach(e => {
            if (e.paymentStatus === 'SUCCESS' && e.id != null) {
              this.paidEvents.add(e.id);
            }
          });
        },
        error: (err) => console.error(err)
      });
    } else {
      this.clientService.getEvents().subscribe({
        next: (data) => {
          this.events = data;
          data.forEach(e => {
            if (e.paymentStatus === 'SUCCESS' && e.id != null) {
              this.paidEvents.add(e.id);
            }
          });
        },
        error: (err) => console.error(err)
      });
    }
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

    this.paymentSuccess = false;
    this.paymentMessage = '';
    this.paymentError   = '';

    if (!amount || amount <= 0) {
      this.paymentError = 'Please enter a valid payment amount.';
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
            this.ngZone.run(() => {
              this.processingPayment[eventId] = false;
              this.paidEvents.add(eventId);
              this.persistPaidEvent(eventId); // ← save to localStorage
              this.paymentSuccess = true;
              this.paymentMessage = 'Payment successful!';
              this.paymentAmountMap[eventId] = 0;

              // Optimistically update local event object
              const idx = this.events.findIndex(e => e.id === eventId);
              if (idx !== -1) {
                this.events[idx] = { ...this.events[idx], paymentStatus: 'SUCCESS' };
              }
            });

            // Persist payment status to backend so the planner is notified
            this.clientService.markEventPaid(eventId).subscribe({
              error: () => { /* silently fail — localStorage still works */ }
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

          theme: { color: '#6C63FF' }
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

  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
