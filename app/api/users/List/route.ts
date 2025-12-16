import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';
import { User, PaginationMeta, UsersResponse } from '../../../types/user';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validation
    if (page < 1 || limit < 1) {
      return NextResponse.json<UsersResponse>(
        {
          success: false,
          users: [],
          meta: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
          message: 'Invalid pagination parameters'
        },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Count total users
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json<UsersResponse>(
        {
          success: false,
          users: [],
          meta: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
          message: 'Failed to count users'
        },
        { status: 500 }
      );
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch users with pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json<UsersResponse>(
        {
          success: false,
          users: [],
          meta: { currentPage: page, itemsPerPage: limit, totalItems, totalPages },
          message: 'Failed to fetch users'
        },
        { status: 500 }
      );
    }

    const users: User[] = data || [];

    const meta: PaginationMeta = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages
    };

    return NextResponse.json<UsersResponse>({
      success: true,
      users,
      meta
    });

  } catch (err) {
    console.error('API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    
    return NextResponse.json<UsersResponse>(
      {
        success: false,
        users: [],
        meta: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        message: errorMessage
      },
      { status: 500 }
    );
  }
}