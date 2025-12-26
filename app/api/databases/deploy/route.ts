import { NextResponse } from 'next/server'
import { getSupabaseClient } from '../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const { databaseId } = await request.json()

    if (!databaseId) {
      return NextResponse.json(
        { error: 'Database ID is required' },
        { status: 400 }
      )
    }

    // Get database info
    const databaseInfo = await getDatabaseInfo(databaseId)
    
    if (!databaseInfo) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database retrieved successfully',
      databaseInfo,
    })
  } catch (err: any) {
    console.error('Error:', err)

    return NextResponse.json(
      { error: 'Request failed', message: err.message },
      { status: 500 }
    )
  }
}

async function getDatabaseInfo(databaseId: string): Promise<any | null> {
  // Default database
  if (databaseId === 'default') {
    return { id: 'default', connection_name: 'Default Database' }
  }

  // Fetch from database
  const supabase = await  getSupabaseClient({
    mode: 'service',
  })

  const { data, error } = await supabase
    .from('database_connections')
    .select('*')
    .eq('id', databaseId)
    .single()

  if (error || !data) {
    console.error('Database not found:', databaseId, error)
    return null
  }
  return data
}