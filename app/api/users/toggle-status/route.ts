import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';
import { ApiResponse } from '../../../types/user';

export async function POST(request: Request) {
  try {
    const { userId, isEnabled } = await request.json();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(numericUserId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    //  Simple boolean toggle - no string conversion!
    const newStatus = !isEnabled;

    const { data, error } = await supabase
      .from('users')
      .update({ is_enabled: newStatus })
      .eq('id', numericUserId)
      .select();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Failed to update user status' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `User ${newStatus ? 'enabled' : 'disabled'} successfully`,
      data: { isEnabled: newStatus }
    });

  } catch (err) {
    console.error('Toggle API error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}