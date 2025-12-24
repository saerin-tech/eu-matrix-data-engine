import { NextResponse } from 'next/server';
import { createDatabaseClient } from '../../lib/database-client';

export async function POST(request: Request) {
  try {
    const { tableName, databaseId } = await request.json();
    // Validation
    if (!tableName || typeof tableName !== 'string') {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      )
    }

    const supabase = await createDatabaseClient(databaseId);
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    // Fetch columns using RPC function
    const { data, error } = await supabase.rpc('get_table_columns', {
      p_table_name: tableName,
    })
    
    if (error) {
      console.error('RPC error fetching columns:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Transform response
    const columns = (data || [])?.map((col: any) => ({
      name: col.column_name,
      isNullable: col.is_nullable,
    }))
    return NextResponse.json({ 
      success: true, 
      table: tableName,
      columns: columns,
      count: columns.length
    })
    
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}