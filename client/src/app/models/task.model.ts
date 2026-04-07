export interface Task {
  id?: any;
  description?: string;
  status?: string;
  assignedStaff?: any;
  success?: any;
  feedback?: string;
  /** NEW — the event this task belongs to */
  event?: { id?: any; title?: string };
}
