import { getSupabaseClient } from '../lib/supabase'
import { AuthResponse } from '../types/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export type UserRole = 'Admin' | 'User';

export interface AuthUser {
  id: string;
  user_name: string;
  roles_and_rights: any;
  is_enabled: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session');
    
    if (!userSession?.value) {
      return null;
    }
    
    const user: AuthUser = JSON.parse(userSession.value);
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Generate secure random password
function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Seed initial admin user
export async function seedUser(): Promise<AuthResponse> {
  try {
    const supabase = await  getSupabaseClient()
    // Check if admin exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, user_name, roles_and_rights, is_enabled')
      .eq('roles_and_rights', 'Admin')
      .limit(1);

    if (checkError) {
      console.error('Database error:', checkError.message);
      throw new Error(`Database error: ${checkError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('Admin user already exists');
      return {
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingUsers[0].id,
          user_name: existingUsers[0].user_name,
          roles_and_rights: existingUsers[0].roles_and_rights,
          is_enabled: existingUsers[0].is_enabled
        }
      };
    }

    console.log('Creating admin user...');
    const defaultUserName = 'admin';
    const defaultPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          user_name: defaultUserName,
          user_password: hashedPassword,
          roles_and_rights: 'Admin',
          is_enabled: true
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create user:', insertError.message);
      throw new Error(`Failed to create user: ${insertError.message}`);
    }
    return {
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: newUser.id,
        user_name: newUser.user_name,
        roles_and_rights: newUser.roles_and_rights,
        is_enabled: newUser.is_enabled
      },
      credentials: {
        user_name: newUser.user_name,
        user_password: defaultPassword
      }
    };
  } catch (error: any) {
    console.error('Seed error:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to seed user'
    };
  }
}

// Validate user login credentials
export async function validateLogin(user_name: string, user_password: string): Promise<AuthResponse> {
  try {
    const supabase = await getSupabaseClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_name, user_password, roles_and_rights, is_enabled, first_name, last_name')
      .eq('user_name', user_name)
      .single();

    if (error || !user) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
     if (!user.is_enabled) {
      return {
        success: false,
        message: 'Your account has been disabled. Please contact your administrator.'
      };
    }

    // Set session cookie
    const cookieStore = await cookies();
    const userSession = {
      id: user.id,
      user_name: user.user_name,
      roles_and_rights: user.roles_and_rights,
    };
    
    cookieStore.set('user_session', JSON.stringify(userSession), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 
    });    
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        user_name: user.user_name,
        roles_and_rights: user.roles_and_rights,
        is_enabled: user.is_enabled
      }
    };
  } catch (error: any) {
    console.error('Login error:', error.message);
    return {
      success: false,
      message: 'Login failed. Please try again.'
    };
  }
}
export async function createUser(
  first_name: string,      
  last_name: string,       
  user_name: string,       
  contact: string | null,  
  user_password: string,   
  roles_and_rights: UserRole, 
  created_by: string,      
  is_deleted: boolean = false 
): Promise<AuthResponse> {
  try {

    // Check if username already exists
    const supabase = await getSupabaseClient()
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('user_name', user_name)
      .single();

    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Insert new user with all fields
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          first_name,
          last_name,
          user_name,
          contact,
          user_password: hashedPassword,
          roles_and_rights,
          created_by,             
          is_enabled: true,
          is_deleted: is_deleted            
        }
      ])
      .select()
      .single();

    if (error || !newUser) {
      console.error('Failed to create user:', error?.message);
      return { success: false, message: error?.message || 'Failed to create user' };
    }

    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        user_name: newUser.user_name,
        roles_and_rights: newUser.roles_and_rights,
        is_enabled: newUser.is_enabled
      }
    };
  } catch (error: any) {
    console.error('Create user error:', error.message);
    return { success: false, message: error.message || 'Failed to create user' };
  }
}