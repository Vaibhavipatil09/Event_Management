// planner-dashboard.component.ts
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

  showEvents = true;
  showTasks  = false;

  // Toast
  showToast    = false;
  toastMessage = '';

  selectedEvent: Event = { title:'', date:'', location:'', description:'', status:'' };
  newEvent:      Event = { title:'', date:'', location:'', description:'', status:'' };
  selectedClientId: number | null = null;
  newTask: Task = { description:'', status:'', assignedStaff: null };
  newTaskEventId: number | null = null;
  reassignMap: { [taskId: number]: number | null } = {};

  get plannerId(): number { return Number(this.authService.getUserId()); }

  constructor(
    private plannerService: PlannerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEvents();
    this.getTasks();
    this.getStaffs();
    this.getClients();
  }

  private toast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3500);
  }

  navigateTo(section: string): void {
    this.showEvents = section === 'events';
    this.showTasks  = section === 'tasks';
  }

  getStaffs():  void { this.plannerService.getStaffs().subscribe({ next: d => this.staffs = d, error: e => console.error(e) }); }
  getClients(): void { this.plannerService.getClients().subscribe({ next: d => this.clients = d, error: e => console.error(e) }); }
  getEvents():  void { this.plannerService.getEvents(this.plannerId).subscribe({ next: d => this.events = d, error: e => console.error(e) }); }

  getTasks(): void {
    this.plannerService.getTasks().subscribe({
      next: data => {
        this.tasks = data;
        this.reassignMap = {};
        data.forEach((t: any) => { if (t.id != null) this.reassignMap[t.id] = null; });
      },
      error: e => console.error(e)
    });
  }

  createEvent(): void {
    const clientId = this.selectedClientId ?? undefined;
    this.plannerService.createEvent(this.newEvent, this.plannerId, clientId).subscribe({
      next: event => {
        this.events.push(event);
        this.newEvent = { title:'', date:'', location:'', description:'', status:'' };
        this.selectedClientId = null;
        this.getEvents();
        this.toast('🎉 Event "' + event.title + '" created!');
      },
      error: e => console.error(e)
    });
  }

  editEvent(event: Event): void { this.selectedEvent = { ...event }; }
  cancelEdit(): void { this.selectedEvent = { title:'', date:'', location:'', description:'', status:'' }; }

  updateEvent(): void {
    this.plannerService.updateEvent(this.selectedEvent, this.selectedEvent.id!).subscribe({
      next: updated => {
        const i = this.events.findIndex(e => e.id === updated.id);
        if (i !== -1) this.events[i] = updated;
        this.selectedEvent = { title:'', date:'', location:'', description:'', status:'' };
        this.getEvents();
        this.toast('✅ Event updated successfully!');
      },
      error: e => console.error(e)
    });
  }

  createTask(): void {
    const staffId = this.newTask.status === 'Completed' ? null : this.newTask.assignedStaff;
    const taskToSend: Task = { description: this.newTask.description, status: this.newTask.status };
    const eventId = this.newTaskEventId ?? undefined;
    this.plannerService.createTask(taskToSend, eventId).subscribe({
      next: task => {
        if (staffId) {
          this.plannerService.assignTask(task.id!, staffId).subscribe({ next: () => this.getTasks(), error: e => console.error(e) });
        } else {
          this.getTasks();
        }
        this.newTask = { description:'', status:'', assignedStaff: null };
        this.newTaskEventId = null;
        this.toast('📋 Task created successfully!');
      },
      error: e => console.error(e)
    });
  }

  reassignStaff(taskId: any): void {
    const staffId = this.reassignMap[taskId];
    if (!staffId) return;
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'Completed') { alert('Cannot assign staff to a completed task.'); return; }
    this.plannerService.assignTask(taskId, staffId).subscribe({
      next: () => { this.reassignMap[taskId] = null; this.getTasks(); this.toast('👷 Staff assigned!'); },
      error: err => { console.error(err); alert(err?.error?.message || 'Failed to assign staff.'); }
    });
  }

  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
