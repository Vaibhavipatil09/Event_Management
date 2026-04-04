import { Component, HostListener, OnInit } from '@angular/core';
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
  showTasks = false;

  showToast = false;
  toastMessage = '';

  selectedEvent: Event = { title: '', date: '', location: '', description: '', status: '' };
  newEvent: Event = { title: '', date: '', location: '', description: '', status: '' };

  selectedClientId: number | null = null;

  newTask: Task = { description: '', status: '', assignedStaff: null };
  newTaskEventId: number | null = null;

  reassignMap: { [taskId: number]: number | null } = {};

  /** Name of the currently open custom dropdown — null means all closed */
  openDropdown: string | null = null;

  get plannerId(): number {
    return Number(this.authService.getUserId());
  }

  constructor(
    private plannerService: PlannerService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getEvents();
    this.getTasks();
    this.getStaffs();
    this.getClients();
  }

  // ── Custom dropdown helpers ─────────────────────────────────────────────────

  /** Close all dropdowns when clicking anywhere outside */
  @HostListener('document:click')
  closeAllDropdowns(): void {
    this.openDropdown = null;
  }

  /** Toggle a named dropdown; stopPropagation prevents document:click from closing it immediately */
  toggleDropdown(name: string, e: MouseEvent): void {
    e.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  getClientName(id: number | null): string {
    if (!id) return '— Select Client —';
    return this.clients.find(c => c.id == id)?.username ?? '— Select Client —';
  }

  getStaffName(id: any): string {
    if (!id) return '— None —';
    return this.staffs.find(s => s.id == id)?.username ?? '— None —';
  }

  getEventTitle(id: number | null): string {
    if (!id) return '— Select Event —';
    return this.events.find(e => e.id == id)?.title ?? '— Select Event —';
  }

  // ───────────────────────────────────────────────────────────────────────────

  private toast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  navigateTo(section: string): void {
    this.showEvents = section === 'events';
    this.showTasks = section === 'tasks';
  }

  getStaffs(): void {
    this.plannerService.getStaffs().subscribe(d => this.staffs = d);
  }

  getClients(): void {
    this.plannerService.getClients().subscribe(d => this.clients = d);
  }

  getEvents(): void {
    this.plannerService.getEvents(this.plannerId).subscribe(d => this.events = d);
  }

  getTasks(): void {
    this.plannerService.getTasks().subscribe(data => {
      this.tasks = data;
      this.reassignMap = {};
      data.forEach(t => {
        if (t.id != null) this.reassignMap[t.id] = null;
      });
    });
  }

  // createEvent(): void {
  //   const clientId = this.selectedClientId ?? undefined;

  //   this.plannerService
  //     .createEvent(this.newEvent, this.plannerId, clientId)
  //     .subscribe(event => {
  //       this.events.push(event);
  //       this.newEvent = { title: '', date: '', location: '', description: '', status: '' };
  //       this.selectedClientId = null;
  //       this.getEvents();
  //       this.toast(`🎉 Event "${event.title}" created!`);
  //     });
  // }

  createEvent(): void {
  const clientId = this.selectedClientId ?? undefined;

  this.plannerService
    .createEvent(this.newEvent, this.plannerId, clientId)
    .subscribe({
      next: (event) => {
        this.events.push(event);
        this.newEvent = { title: '', date: '', location: '', description: '', status: '' };
        this.selectedClientId = null;

        this.toast(`🎉 Event "${event.title}" created!`);
        this.getEvents();
      },

      error: (err) => {
        // 🔴 UNAUTHORIZED / TOKEN REMOVED
        if (err.status === 401 || err.status === 403) {
          this.toast('❌ Session expired. Please login again.');
        } 
        // 🔴 ANY OTHER FAILURE
        else {
          this.toast('❌ Failed to create event. Please try again.');
        }
      }
    });
}


  editEvent(event: Event): void {
    // 1️⃣ Switch form to Edit mode
    this.selectedEvent = { ...event };

    // 2️⃣ Wait for Angular to update the DOM
    setTimeout(() => {

      // ✅ Smooth scroll to the form
      const anchor = document.getElementById('eventFormAnchor');
      if (anchor) {
        const yOffset = -20;
        const y =
          anchor.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }

      // ✅ Add glow + slide animation
      const formCard = document.querySelector('.event-form-card');
      if (formCard) {
        formCard.classList.add('edit-focus');

        // Remove class after animation
        setTimeout(() => {
          formCard.classList.remove('edit-focus');
        }, 700);
      }

    }, 0);
  }


  cancelEdit(): void {
    this.selectedEvent = { title: '', date: '', location: '', description: '', status: '' };
  }

  updateEvent(): void {
    this.plannerService
      .updateEvent(this.selectedEvent, this.selectedEvent.id!)
      .subscribe(updated => {
        const i = this.events.findIndex(e => e.id === updated.id);
        if (i !== -1) this.events[i] = updated;
        this.selectedEvent = { title: '', date: '', location: '', description: '', status: '' };
        this.getEvents();
        this.toast('✅ Event updated successfully!');
      });
  }

  createTask(): void {
    const staffId = this.newTask.status === 'Completed' ? null : this.newTask.assignedStaff;
    const taskToSend: Task = { description: this.newTask.description, status: this.newTask.status };
    const eventId = this.newTaskEventId ?? undefined;

    this.plannerService.createTask(taskToSend, eventId).subscribe(task => {
      if (staffId) {
        this.plannerService.assignTask(task.id!, staffId).subscribe(() => this.getTasks());
      } else {
        this.getTasks();
      }
      this.newTask = { description: '', status: '', assignedStaff: null };
      this.newTaskEventId = null;
      this.toast('📋 Task created successfully!');
    });
  }

  reassignStaff(taskId: any): void {
    const staffId = this.reassignMap[taskId];
    if (!staffId) return;

    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'Completed') {
      alert('Cannot assign staff to a completed task.');
      return;
    }

    this.plannerService.assignTask(taskId, staffId).subscribe(() => {
      this.reassignMap[taskId] = null;
      this.getTasks();
      this.toast('👷 Staff assigned!');
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteEvent(event: Event): void {
    if (!event.id) return;

    const ok = confirm(`Delete event "${event.title}" ?`);
    if (!ok) return;

    this.plannerService
      .deleteEvent(this.plannerId, event.id)
      .subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== event.id);
          this.toast(`🗑️ Event "${event.title}" deleted`);
        },
        error: () => {
          this.toast('❌ Failed to delete event');
          this.getEvents(); // ✅ resync
        }
      });
  }

  deleteTask(task: Task): void {
    if (!task.id) return;

    const ok = confirm('Delete this task?');
    if (!ok) return;

    this.plannerService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.toast('🗑️ Task deleted');
      },
      error: () => {
        this.toast('❌ Failed to delete task');
        this.getTasks();
      }
    });
  }
}