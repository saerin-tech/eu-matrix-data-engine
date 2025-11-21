export interface User {
  id: string;
  user_name: string;
  user_password: string;
  created_at?: string;
}

export interface LoginCredentials {
  user_name: string;
  user_password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    user_name: string;
  };
  credentials?: {
    user_name: string;
    user_password: string;
  };
}