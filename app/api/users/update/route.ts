import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';
import { ApiResponse } from '../../../types/user';

export async function POST(request: Request) {
  try {
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

      if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User updated successfully',
      user: data
    });

  } catch (err) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}