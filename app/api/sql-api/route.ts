import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../lib/supabase'

export async function POST(request: NextRequest) {

  try {
    const body = await request.json()
    const { tableName, columnName, searchTerm = '' } = body

    //     Validation
    if (!tableName || !columnName) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['tableName', 'columnName']
        },
        { status: 400 }
      )
    }
    const supabase = createServerClient()

    //     CORRECT: Pass params as JSONB object
    const { data, error } = await supabase.rpc('get_filtered_search_values_text_num', {
      params: {
        table_name: tableName,
        column_name: columnName,
        search: searchTerm
      }
    })

    if (error) {
      console.error('[SQL-API] RPC error:', error)

      //     Function not found error
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'RPC function not found',
            hint: 'Please deploy functions using POST /api/deploy-rpc',
            details: error.message
          },
          { status: 404 }
        )
      }

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
    const values = data?.map((row: any) => row.val) || []

    return NextResponse.json({
      success: true,
      count: values.length,
      values,
      tableName,
      column: columnName,
      searchTerm
    })

  } catch (err: any) {
    console.error('[SQL-API] Unexpected error:', err)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: err.message
      },
      { status: 500 }
    )
  }
}