import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';
import { getCurrentUser } from '../../../lib/auth';


interface DeleteResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    deletedAt: Date;
  };
}

export async function POST(request: NextRequest) {
  try {
      const currentUser = await getCurrentUser();
    
        if (!currentUser) {
        return NextResponse.json<DeleteResponse>(
            {
            success: false,
            message: 'Unauthorized - Please login first'
            },
            { status: 401 }
        );
        }
        
    const body = await request.json();
    const { userId } = body;

    // Validation
    if (!userId) {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    // Current timestamp
    const deletedAt = new Date()

    // Update user record - set is_deleted to true
    const { data, error } = await supabase
      .from('users')
      .update({
        is_deleted: true,
        deleted_by: currentUser.user_name,
        deleted_at: deletedAt
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          message: 'Failed to delete user: ' + error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json<DeleteResponse>({
      success: true,
      message: 'User deleted successfully',
      data: {
        userId,
        deletedAt
      }
    });

  } catch (err) {
    console.error('API Error:', err);
    
    return NextResponse.json<DeleteResponse>(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}