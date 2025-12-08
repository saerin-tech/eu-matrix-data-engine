import { NextRequest, NextResponse } from 'next/server';
import { createUser, UserRole } from '../../../lib/auth';

interface CreateUserRequest {
  first_name: string;       
  last_name: string;        
  user_name: string;        
  contact: string | null;   
  roles_and_rights: UserRole; 
  user_password: string;    
  created_by: string;      
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    const { 
      first_name, 
      last_name, 
      user_name, 
      contact, 
      roles_and_rights, 
      user_password, 
      created_by 
    } = body;

    // Validate mandatory fields
    if (!first_name || !last_name || !user_name || !user_password || !roles_and_rights || !created_by) {
      return NextResponse.json(
        { success: false, message: 'All mandatory fields are required' },
        { status: 400 }
      );
    }

    // createUser with all fields
    const result = await createUser(
      first_name,
      last_name,
      user_name,
      contact || null ,
      user_password,
      roles_and_rights,
      created_by
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}