import { NextResponse } from 'next/server'
import { getSupabaseClient } from '../../lib/supabase'

export async function GET() {
  try {

    const supabase = await getSupabaseClient({
      mode: 'service',
    })

    // Get custom databases
    const { data: customDatabases, error } = await supabase
      .from('database_connections')
      .select('*') 
      .order('created_at', { ascending: false }) 

    if (error) {
      console.error('Error fetching databases:', error)
      throw error
    }

    // Transform to match expected format
    const transformedDatabases = (customDatabases || [])?.map(db => ({
      id: db.id,
      name: db.connection_name,
      supabase_url: db.supabase_url,
      supabase_anon_key: db.supabase_anon_key,
      database_url: db.database_url,
      service_role_key: db.supabase_service_role_key || null,
      is_default: db.is_default || false,
      is_active: db.is_active !== false,
      created_at: db.created_at,
      updated_at: db.updated_at,
    }))

    const defaultDatabase = {
      id: 'default',
      name: 'Default Database',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      database_url: process.env.DATABASE_URL || '',
      service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      is_default: true,
      is_active: true,
    }

    // Combine all databases
    const allDatabases = [defaultDatabase, ...transformedDatabases]
    return NextResponse.json({
      success: true,
      databases: allDatabases,
    })
  } catch (err: any) {
    console.error('Database fetch error:', err)

    return NextResponse.json(
      { error: 'Failed to fetch databases', message: err.message },
      { status: 500 }
    )
  }
}