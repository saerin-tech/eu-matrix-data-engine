import { createClient } from '@supabase/supabase-js';
import { AuthResponse } from '../types/auth';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function seedUser(): Promise<AuthResponse> {
  try {
    // Check if users table has any data
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, user_name')
      .limit(1);

    if (checkError) {
      console.error(' Database error:', checkError.message);
      throw new Error(`Database error: ${checkError.message}`);
    }

    // If data exists in users table, skip creation
    if (existingUsers && existingUsers.length > 0) {
      console.log('Users table already has data, skipping seed');
      return {
        success: true,
        message: 'Users table already has data',
        user: {
          id: existingUsers[0].id,
          user_name: existingUsers[0].user_name
        }
      };
    }

    // Users table is empty - CREATE NEW USER
    console.log('Users table is empty! Creating seed user...');
    
    const defaultUserName = 'admin';
    const defaultPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          user_name: defaultUserName,
          user_password: hashedPassword,
          created_at: new Date().toISOString()
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
      message: 'Seed user created successfully',
      user: {
        id: newUser.id,
        user_name: newUser.user_name
      },
      credentials: {
        user_name: newUser.user_name,
        user_password: defaultPassword // Return plain password for display
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

function generateSecurePassword(): string {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function validateLogin(user_name: string, user_password: string): Promise<AuthResponse> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, user_name, user_password')
      .eq('user_name', user_name)
      .single();

    if (error || !user) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    // Use bcrypt to compare passwords
    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        user_name: user.user_name
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Login failed. Please try again.'
    };
  }
}