export interface User {
  id?: any;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: any;
  username: string;
  email:string;
}

export interface Credentials {
  username: string;
  password: string;
}
