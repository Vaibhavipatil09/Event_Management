export interface Task {
  id?: any;
  description?: string;
  status?: string;
  assignedStaff?: any;
  success?: any;
  /** NEW — the event this task belongs to */
  event?: { id?: any; title?: string };
}
