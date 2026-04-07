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

  /** tracks which task card has the feedback panel open */
  feedbackOpenTaskId: any = null;
  /** holds the feedback text being typed */
  feedbackText: { [taskId: number]: string } = {};
  /** tracks submitted feedback per task to show success */
  feedbackSubmitted: { [taskId: number]: boolean } = {};

  get completedTasks(): number {
    return this.tasks.filter(t => t.status === 'Completed' || t.status === 'COMPLETED').length;
  }
  get pendingTasks(): number {
    return this.tasks.length - this.completedTasks;
  }
  get progressPct(): number {
    return this.tasks.length ? Math.round((this.completedTasks / this.tasks.length) * 100) : 0;
  }

  constructor(
    private staffService: StaffService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void { this.getTasks(); }

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

  toggleFeedback(taskId: any): void {
    this.feedbackOpenTaskId = this.feedbackOpenTaskId === taskId ? null : taskId;
  }

  submitFeedback(taskId: any): void {
    const text = (this.feedbackText[taskId] || '').trim();
    if (!text) return;
    this.staffService.submitFeedback(taskId, text).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === updated.id);
        if (index !== -1) this.tasks[index] = updated;
        this.feedbackSubmitted[taskId] = true;
        this.feedbackOpenTaskId = null;
        this.feedbackText[taskId] = '';
      },
      error: (err) => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

