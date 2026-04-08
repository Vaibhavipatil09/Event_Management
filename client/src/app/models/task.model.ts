export interface Task {
  id?: any;
  description?: string;
  status?: string;
  assignedStaff?: any;
  success?: any;
  feedback?: string;
  event?: { id?: any; title?: string };
}
