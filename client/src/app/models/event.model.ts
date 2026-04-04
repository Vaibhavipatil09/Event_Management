export interface Event {
  id?: any;
  title?: string;
  date?: string;
  location?: string;
  description?: string;
  status?: string;
  feedback?: string;
  paymentStatus?: string;   // 'SUCCESS' | 'PENDING' | 'FAILED' — set by backend after Razorpay
  client?: { id?: any; username?: string };
}
