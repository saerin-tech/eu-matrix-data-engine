import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';
import { getCurrentUser } from '../../../lib/auth';

interface DeleteResponse {
  success: boolean;
  message?: string;
  data?: {
    databaseId: string;
    deletedAt: Date;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get logged-in user from cookie
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
    const { databaseId } = body;

    // Validation
    if (!databaseId) {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          message: 'Database ID is required'
        },
        { status: 400 }
      );
    }

    // Prevent deletion of default database
    if (databaseId === 'default') {
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          message: 'Cannot delete default database'
        },
        { status: 403 }
      );
    }

    const supabase = await getSupabaseClient();

    const deletedAt = new Date();
    const { data, error } = await supabase
      .from('database_connections')
      .update({
        is_deleted: true,
        deleted_by: currentUser.user_name,
        deleted_at: deletedAt
      })
      .eq('id', databaseId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json<DeleteResponse>(
        {
          success: false,
          message: 'Failed to delete database: ' + error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json<DeleteResponse>({
      success: true,
      message: 'Database deleted successfully',
      data: {
        databaseId,
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