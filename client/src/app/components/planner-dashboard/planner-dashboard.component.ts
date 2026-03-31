import { Component, OnInit } from '@angular/core';
import { PlannerService } from '../../services/planner.service';
import { Event } from '../../models/event.model';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StaffService } from '../../services/staff.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-planner-dashboard',
  templateUrl: './planner-dashboard.component.html',
  styleUrls: ['./planner-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class PlannerDashboardComponent implements OnInit {


  // events: Event[] = [];
  // tasks: Task[] = [];
  // staffs: any[] = [];
  // plannerId: number = Number(this.authService.getUserId());

  // showEvents: boolean = true;
  // showTasks: boolean = false;

  // newEvent: Event = {
  //   title: '',
  //   date: '',
  //   location: '',
  //   description: '',
  //   status: ''
  // };

  // newTask: Task = {
  //   description: '',
  //   status: '',
  //   assignedStaff: null
  // };

  // constructor(
  //   private plannerService: PlannerService,
  //   private authService: AuthService,
  //   private router: Router
  // ) { }

  // ngOnInit(): void {
  //   this.loadEvents();
  //   this.loadTasks();
  // }

  // navigateTo(section: string): void {
  //   if (section === 'events') {
  //     this.showEvents = true;
  //     this.showTasks = false;
  //   } else if (section === 'tasks') {
  //     this.showEvents = false;
  //     this.showTasks = true;
  //   }
  // }

  // loadEvents(): void {
  //   this.plannerService.getEvents(this.plannerId).subscribe({
  //     next: (data) => this.events = data,
  //     error: (err) => console.error(err)
  //   });
  // }

  // loadTasks(): void {
  //   this.plannerService.getTasks().subscribe({
  //     next: (data) => this.tasks = data,
  //     error: (err) => console.error(err)
  //   });
  // }

  // createEvent(): void {
  //   this.plannerService.createEvent(this.newEvent, this.plannerId).subscribe({
  //     next: (event) => {
  //       this.events.push(event);
  //       this.newEvent = {
  //         title: '',
  //         date: '',
  //         location: '',
  //         description: '',
  //         status: ''
  //       };
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  // editEvent(event: Event): void {
  //   this.plannerService.updateEvent(event.id!, event).subscribe({
  //     next: (updated) => {
  //       const index = this.events.findIndex(e => e.id === updated.id);
  //       if (index !== -1) this.events[index] = updated;
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  // createTask(): void {
  //   this.plannerService.createTask(this.newTask).subscribe({
  //     next: (task) => {
  //       if (this.newTask.assignedStaff) {
  //         this.plannerService.assignTask(task.id!, this.newTask.assignedStaff).subscribe({
  //           next: (assigned) => {
  //             this.tasks.push(assigned);
  //           },
  //           error: (err) => console.error(err)
  //         });
  //       } else {
  //         this.tasks.push(task);
  //       }
  //       this.newTask = { description: '', status: '', assignedStaff: null };
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }


  events: Event[] = [];
  tasks: Task[] = [];
  staffs: any[] = [];

  showEvents: boolean = true;
  showTasks: boolean = false;

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

  newTask: Task = {
    description: '',
    status: '',
    assignedStaff: null
  };

  get plannerId(): number {
    return Number(this.authService.getUserId());
  }

  constructor(
    private plannerService: PlannerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEvents();
    this.getTasks();
    this.getStaffs();
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

  getEvents(): void {
    this.plannerService.getEvents(this.plannerId).subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error(err)
    });
  }

  getTasks(): void {
    this.plannerService.getTasks().subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error(err)
    });
  }

  createEvent(): void {
    this.plannerService.createEvent(this.newEvent, this.plannerId).subscribe({
      next: (event) => {
        this.events.push(event);
        this.newEvent = { title: '', date: '', location: '', description: '', status: '' };
        this.getEvents();
      },
      error: (err) => console.error(err)
    });
  }

  editEvent(event: Event): void {
    this.selectedEvent = { ...event };
  }

  updateEvent(): void {
    this.plannerService.updateEvent(this.selectedEvent, this.selectedEvent.id!).subscribe({
      next: (updated) => {
        const index = this.events.findIndex(e => e.id === updated.id);
        if (index !== -1) this.events[index] = updated;
        this.getEvents();
      },
      error: (err) => console.error(err)
    });
  }

  createTask(): void {
    const staffId = this.newTask.assignedStaff;
    const taskToSend: Task = {
      description: this.newTask.description,
      status: this.newTask.status
    };
    this.plannerService.createTask(taskToSend).subscribe({
      next: (task) => {
        if (staffId) {
          this.plannerService.assignTask(task.id!, staffId).subscribe({
            next: (assigned) => {
              this.tasks.push(assigned);
              this.getTasks();
            },
            error: (err) => console.error(err)
          });
        } else {
          this.tasks.push(task);
          this.getTasks();
        }
        this.newTask = { description: '', status: '', assignedStaff: null };
      },
      error: (err) => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
