export interface User {
  id: string;
  user_name: string;
  user_password: string;
  created_at?: string;
  is_enabled?: boolean;
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
    roles_and_rights?: string;
    is_enabled?: boolean;
  };
  credentials?: {
    user_name: string;
    user_password: string;
  };
}