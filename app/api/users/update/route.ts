import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';
import { ApiResponse, UpdateUserData } from '../../../types/user';

interface UpdateUserRequest extends UpdateUserData {
  userId: string;
}

export async function POST(request: Request) {
  try {
    const body: UpdateUserRequest = await request.json();
    const { userId, first_name, last_name, contact, roles_and_rights } = body;

    // Validation
    if (!userId || !first_name || !last_name || !roles_and_rights) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Validate role
    if (roles_and_rights !== 'Admin' && roles_and_rights !== 'User') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid role'
        },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        contact,
        roles_and_rights
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Failed to update user'
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User updated successfully',
      user: data
    });

  } catch (err) {
    console.error('API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}