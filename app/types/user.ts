export type UserRole = 'Admin' | 'User';

// Database se aane wali user object
export interface User {
  id: string;
  user_name: string;
  user_password: string;
  roles_and_rights: UserRole;
  first_name: string;
  last_name: string;
  contact: string | null;
  is_enabled: boolean;
  created_at: string;
  created_by: string;
}

// User update karte waqt bhejne wala data
export interface UpdateUserData {
  first_name: string;
  last_name: string;
  contact: string | null;
  roles_and_rights: UserRole;
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// API response for user list
export interface UsersResponse {
  success: boolean;
  users: User[];
  meta: PaginationMeta;
  message?: string;
}

// API response for single operations
export interface ApiResponse {
  success: boolean;
  message: string;
  user?: User;
  data?: any
}