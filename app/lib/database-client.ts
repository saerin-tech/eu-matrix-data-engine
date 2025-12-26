import { getSupabaseClient } from '../lib/supabase'

export async function createDatabaseClient(databaseId?: string) {
  try {
    if (!databaseId || databaseId === 'default') {

      return getSupabaseClient({ 
        mode: 'service',
        databaseUrl: process.env.DATABASE_URL 
      })
    }

    const defaultSupabase = await getSupabaseClient({ mode: 'service' })

    const { data, error } = await defaultSupabase
      .from('database_connections')
      .select(
        'supabase_url, supabase_service_role_key, supabase_anon_key, database_url' 
      )
      .eq('id', databaseId)
      .single()

    if (error || !data) return null

    return getSupabaseClient({
      url: data.supabase_url,
      key: data.supabase_service_role_key || data.supabase_anon_key,
      mode: data.supabase_service_role_key ? 'service' : 'public',
      databaseUrl: data.database_url
    })
  } catch (error) {
    console.error('Database client error:', error)
    return null
  }
}