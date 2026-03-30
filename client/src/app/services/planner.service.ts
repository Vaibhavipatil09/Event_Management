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

  createEvent(event: Event, plannerId: number): Observable<Event> {
    return this.http.post<Event>(
      `${this.baseUrl}/event?plannerId=${plannerId}`,
      event
    );
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(
      `${this.baseUrl}/event/${id}`,
      event
    );
  }

  getEventsByPlanner(plannerId: number): Observable<Event[]> {
    return this.http.get<Event[]>(
      `${this.baseUrl}/events?plannerId=${plannerId}`
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/task`,
      task
    );
  }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks`);
  }

  assignTask(taskId: number, staffId: number): Observable<Task> {
    return this.http.post<Task>(
      `${this.baseUrl}/tasks/${taskId}/assign/${staffId}`,
      {}
    );
  }
}
