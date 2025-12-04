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
    const { data: columnInfo, error: columnError } = await supabase.rpc(
      'get_table_columns',
      { table_name: tableName }
    )

    if (columnError) {
      return NextResponse.json(
        { error: columnError.message },
        { status: 500 }
      )
    }

    const exactColumn = columnInfo?.find((c: any) =>
      c.column_name.toLowerCase().trim() === columnName.toLowerCase().trim())

    if (!exactColumn) {
      return NextResponse.json(
        {
          error: `Column "${columnName}" not found`,
          availableColumns: columnInfo?.map((c: any) => c.column_name)
        },
        { status: 404 }
      )
    }
    const actualColumnName = exactColumn.column_name

    const { data, error } = await supabase.rpc('get_distinct_values', {
      table_name: tableName,
      column_name: actualColumnName,
      search: searchTerm.trim()
    })

    if (error) {
      console.error('RPC Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    const values = data?.map((row: any) => row.val) || []

    return NextResponse.json({
      success: true,
      tableName,
      columnName: actualColumnName,
      searchTerm,
      values,
      count: values.length
    })

  } catch (err: any) {
    console.error('Server Error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: err.message },
      { status: 500 }
    )
  }
}