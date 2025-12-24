import { NextResponse } from 'next/server';
import { createDatabaseClient } from '../../lib/database-client';

interface SQLAPIRequest {
  tableName: string;
  columnName: string;
  searchTerm?: string;
  databaseId?: string;
}

export async function POST(request: Request) {
  try {
    const body: SQLAPIRequest = await request.json();
    const { tableName, columnName, searchTerm = '', databaseId } = body;

    //     Validation
    if (!tableName || !columnName) {
      return NextResponse.json(
        { error: 'tableName and columnName are required' },
        { status: 400 }
      );
    }

    // Get database client
    const supabase = await createDatabaseClient(databaseId);
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase.rpc('get_filtered_search_values_text_num', {
        p_table_name: tableName,
        p_column_name: columnName,
        p_search: searchTerm 
    })

    if (error) {
      console.error('[SQL-API] RPC error:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    //     Extract values
    const values = (data || [])?.map((row: any) => row.val);

    return NextResponse.json({
      success: true,
      values,
      count: values.length,
    })

  } catch (err: any) {
    console.error('[SQL-API] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}