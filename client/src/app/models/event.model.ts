export interface Event {
  id?: any;
  title?: string;
  date?: string;
  location?: string;
  description?: string;
  status?: string;
  feedback?: string;
  client?: { id?: any; username?: string };
}
