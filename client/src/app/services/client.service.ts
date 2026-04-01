import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = `${environment.apiUrl}/api/client`;

  constructor(private http: HttpClient) {}

  /** Kept for backward compatibility / tests */
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events`);
  }

  /** Returns only events assigned to the logged-in client */
  getEventsByClient(clientId: any): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events/${clientId}`);
  }

  provideFeedback(eventId: any, feedback: string): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/event/${eventId}?feedback=${feedback}`,
      {}
    );
  }
}
