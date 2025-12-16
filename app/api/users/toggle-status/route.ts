import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';
import { ApiResponse } from '../../../types/user';

interface ToggleStatusRequest {
  userId: string;
  isEnabled: boolean | string;
}

export async function POST(request: Request) {
  try {
    const body: ToggleStatusRequest = await request.json();
    const { userId, isEnabled } = body;
    
    // Validation - check userId first
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    // Convert to boolean
    let isEnabledBool: boolean;
    if (typeof isEnabled === 'string') {
      isEnabledBool = isEnabled === 'true';
    } else if (typeof isEnabled === 'boolean') {
      isEnabledBool = isEnabled;
    } else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid status value'
        },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const newStatus = !isEnabledBool;

    // Update user status
    const { data, error } = await supabase
      .from('users')
      .update({ is_enabled: newStatus })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Failed to update user status',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `User ${newStatus ? 'enabled' : 'disabled'} successfully`,
      user: {
        ...data,
        is_enabled: typeof data.is_enabled === 'string' 
          ? data.is_enabled === 'true' 
          : data.is_enabled
      }
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