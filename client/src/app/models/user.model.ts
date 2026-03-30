export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
}

export interface Credentials {
  username: string;
  password: string;
}
