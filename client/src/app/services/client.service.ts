import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = `${environment.apiUrl}/api/client`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events`);
  }

  getEventsByClient(clientId: any): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events/${clientId}`);
  }

  provideFeedback(eventId: any, feedback: string): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/event/${eventId}?feedback=${feedback}`,
      {}
    );
  }

  /**
   * NEW — Process payment for a completed event.
   */
  payForEvent(eventId: any, amount: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/event/${eventId}/pay?amount=${amount}`,
      {}
    );
  }

  /**
   * Persist payment success to the backend so the planner can see the PAID status.
   * Called after Razorpay's payment handler fires successfully.
   */
  markEventPaid(eventId: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/event/${eventId}/mark-paid`, {});
  }
}
