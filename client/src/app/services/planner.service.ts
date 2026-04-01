import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {
  private baseUrl = `${environment.apiUrl}/api/planner`;

  constructor(private http: HttpClient) {}

  getStaffs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/staff`);
  }

  /** Fetch all registered clients for the dropdown */
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clients`);
  }

  createEvent(event: Event, plannerId?: number, clientId?: number): Observable<Event> {
    let url = `${this.baseUrl}/event?plannerId=${plannerId ?? ''}`;
    if (clientId != null) {
      url += `&clientId=${clientId}`;
    }
    return this.http.post<Event>(url, event);
  }

  updateEvent(event: Event, id?: any): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/event/${id}`, event);
  }

  getEvents(plannerId?: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events?plannerId=${plannerId}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/task`, task);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks`);
  }

  assignTask(taskId: any, staffId: any): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/tasks/${taskId}/assign/${staffId}`,
      {}
    );
  }
}
