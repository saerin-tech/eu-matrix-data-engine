export interface Database {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  database_url: string;
  service_role_key?: string; 
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFormData {
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  database_url: string;
  service_role_key?: string; 
}

export type DatabaseConnectionStatus = 'connected' | 'disconnected' | 'testing' | 'error';

export interface DatabaseCredentials {
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_role_key?: string;
}

export interface DatabaseTestResult {
  success: boolean;
  message: string;
}

export interface DatabaseOption {
  value: string; // Database ID
  label: string; // Display name
  isDefault?: boolean;
}

// User types
export type UserRole = 'Admin' | 'User';

// Connection status
export type ConnectionStatus = 'checking' | 'connected' | 'error';

// Query builder types
export interface JoinConfig {
  type: 'INNER' | 'LEFT' | 'RIGHT';
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

export interface SelectedColumn {
  table: string;
  column: string;
  alias: string;
}

export interface TableColumn {
  name: string;
  isNullable?: boolean;
}

// Query rule types
export interface QueryRule {
  field: string;
  operator: string;
  value: any;
}

export interface QueryRuleGroup {
  combinator: 'and' | 'or';
  rules: (QueryRule | QueryRuleGroup)[];
}