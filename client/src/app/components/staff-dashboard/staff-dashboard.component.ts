import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../services/staff.service';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class StaffDashboardComponent implements OnInit {

  tasks: Task[] = [];
  staffId: any = this.authService.getUserId();

  constructor(
    private staffService: StaffService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getTasks();
  }

  getTasks(): void {
    this.staffService.getTasks(this.staffId).subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error(err)
    });
  }

  updateTaskStatus(taskId: any, status: string): void {
    this.staffService.updateTaskStatus(taskId, status).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === updated.id);
        if (index !== -1) this.tasks[index] = updated;
        this.getTasks();
      },
      error: (err) => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
