
import { NextResponse } from 'next/server'
import { createServerClient } from '../../lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Supabase RPC function call
    const { data, error } = await supabase.rpc('get_tables_list')
    
    if (error) {
      console.error('Error fetching tables:', error)
      return NextResponse.json(
        { error: error.message, details: 'RPC function not found. Please create it in Supabase SQL Editor.' },
        { status: 500 }
      )
    }

    // Table names extract
    const tableNames = data?.map((t: any) => t.table_name || t) || []
    
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