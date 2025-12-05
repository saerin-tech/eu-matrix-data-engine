import { NextResponse } from 'next/server'
import { createServerClient } from '../../lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableName, columnName, searchTerm = '' } = body

    if (!tableName) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
    }
    if (!columnName) {
      return NextResponse.json({ error: 'Column name is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase.rpc('get_distinct_values', {
      table_name: tableName,
      column_name: columnName,
      search: searchTerm.trim()
    })

    if (error) {
      console.error('RPC Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    const values = data?.map((row: { val: string | number }) => row.val) || []

    return NextResponse.json({
      success: true,
      tableName,
      columnName,
      searchTerm,
      values,
      count: values.length
    })

  } catch (err) {
    console.error('Server Error:', err)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}