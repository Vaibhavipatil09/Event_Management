import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private baseUrl = `${environment.apiUrl}/api/staff`;

    constructor(private http: HttpClient) {}

  getAssignedTasks(staffId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/${staffId}`);
  }

  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.baseUrl}/tasks/${taskId}?status=${status}`,
      {}
    );
  }
}

