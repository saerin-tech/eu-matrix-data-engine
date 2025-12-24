import { NextResponse } from 'next/server'
import { createDatabaseClient } from '../../lib/database-client'

export async function POST(request: Request) {
  try {
    const { databaseId } = await request.json()

    // Get correct database client
    const supabase = await createDatabaseClient(databaseId)
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not found or connection failed' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase.rpc('get_tables_list')

    if (error) {
      console.error('RPC error fetching tables:', error)
      return NextResponse.json(
        { error: error.message || 'Could not fetch tables' },
        { status: 500 }
      )
    }

    const tableNames = (data || [])?.map((t: any) => t.table_name || t)
    
    return NextResponse.json({ 
      success: true, 
      tables: tableNames,
      count: tableNames.length
    })
    
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}