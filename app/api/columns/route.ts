import { NextResponse } from 'next/server'
import { createServerClient } from '../../lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableName } = body
    
    // Validation
    if (!tableName || typeof tableName !== 'string') {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Supabase RPC call for columns
    const { data, error } = await supabase.rpc('get_table_columns', { 
      tbl_name: tableName 
    })
    
    if (error) {
      console.error('Error fetching columns:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Column details return
    const columns = data?.map((col: any) => ({
      name: col.column_name,
    })) || []
    
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