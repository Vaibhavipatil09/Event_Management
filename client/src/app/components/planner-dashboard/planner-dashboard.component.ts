import { Component, OnInit } from '@angular/core';
import { PlannerService } from '../../services/planner.service';
import { Event } from '../../models/event.model';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-planner-dashboard',
  templateUrl: './planner-dashboard.component.html',
  styleUrls: ['./planner-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class PlannerDashboardComponent implements OnInit {

  events: Event[] = [];
  tasks: Task[] = [];
  staffs: any[] = [];
  clients: any[] = [];

  showEvents: boolean = true;
  showTasks: boolean = false;

  // ✅ NEW UI Enhancements
  showToast: boolean = false;
  toastMessage: string = '';
  username: string = '';

  selectedEvent: Event = {
    title: '',
    date: '',
    location: '',
    description: '',
    status: ''
  };

  newEvent: Event = {
    title: '',
    date: '',
    location: '',
    description: '',
    status: ''
  };

  selectedClientId: number | null = null;

  newTask: Task = {
    description: '',
    status: '',
    assignedStaff: null
  };

  newTaskEventId: number | null = null;

  reassignMap: { [taskId: number]: number | null } = {};

  get plannerId(): number {
    return Number(this.authService.getUserId());
  }

  constructor(
    private plannerService: PlannerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Planner';

    this.getEvents();
    this.getTasks();
    this.getStaffs();
    this.getClients();
  }
showSuccess(message: string) {
  this.toastMessage = message;
  this.showToast = true;

  setTimeout(() => {
    this.showToast = false;
    this.toastMessage = '';
  }, 3000);
}

  navigateTo(section: string): void {
    if (section === 'events') {
      this.showEvents = true;
      this.showTasks = false;
    } else if (section === 'tasks') {
      this.showEvents = false;
      this.showTasks = true;
    }
  }

  getStaffs(): void {
    this.plannerService.getStaffs().subscribe({
      next: (data) => this.staffs = data,
      error: (err) => console.error(err)
    });
  }

  getClients(): void {
    this.plannerService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error(err)
    });
  }

  getEvents(): void {
    this.plannerService.getEvents(this.plannerId).subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error(err)
    });
  }

  getTasks(): void {
    this.plannerService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.reassignMap = {};
        data.forEach(t => {
          if (t.id != null) {
            this.reassignMap[t.id] = null;
          }
        });
      },
      error: (err) => console.error(err)
    });
  }

  createEvent(): void {
    const clientId = this.selectedClientId ?? undefined;

    this.plannerService.createEvent(this.newEvent, this.plannerId, clientId).subscribe({
      next: (event) => {
        this.events.push(event);
        this.newEvent = { title: '', date: '', location: '', description: '', status: '' };
        this.selectedClientId = null;
        this.getEvents();

        // ✅ Toast
        this.showSuccess('🎉 Event created successfully!');
      },
      error: (err) => console.error(err)
    });
  }

  editEvent(event: Event): void {
    this.selectedEvent = { ...event };
  }

  cancelEdit(): void {
    this.selectedEvent = { title: '', date: '', location: '', description: '', status: '' };
  }

  updateEvent(): void {
    this.plannerService.updateEvent(this.selectedEvent, this.selectedEvent.id!).subscribe({
      next: (updated) => {
        const index = this.events.findIndex(e => e.id === updated.id);
        if (index !== -1) this.events[index] = updated;
        this.selectedEvent = { title: '', date: '', location: '', description: '', status: '' };
        this.getEvents();

        // ✅ Toast
        this.showSuccess('✅ Event updated successfully!');
      },
      error: (err) => console.error(err)
    });
  }

  createTask(): void {
    const staffId = this.newTask.status === 'Completed' ? null : this.newTask.assignedStaff;

    const taskToSend: Task = {
      description: this.newTask.description,
      status: this.newTask.status
    };

    const eventId = this.newTaskEventId ?? undefined;

    this.plannerService.createTask(taskToSend, eventId).subscribe({
      next: (task) => {
        if (staffId) {
          this.plannerService.assignTask(task.id!, staffId).subscribe({
            next: () => this.getTasks(),
            error: (err) => console.error(err)
          });
        } else {
          this.getTasks();
        }

        this.newTask = { description: '', status: '', assignedStaff: null };
        this.newTaskEventId = null;

        // ✅ Toast
        this.showSuccess('📋 Task created successfully!');
      },
      error: (err) => console.error(err)
    });
  }

  reassignStaff(taskId: any): void {
    const staffId = this.reassignMap[taskId];
    if (!staffId) return;

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'Completed') {
      alert('Cannot assign staff to a completed task.');
      return;
    }

    this.plannerService.assignTask(taskId, staffId).subscribe({
      next: () => {
        this.reassignMap[taskId] = null;
        this.getTasks();

        // ✅ Toast
        this.showSuccess('👨‍💼 Staff assigned successfully!');
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Failed to assign staff.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}