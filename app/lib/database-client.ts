import { getSupabaseClient } from '../lib/supabase'

export async function createDatabaseClient(databaseId?: string) {
  try {
    if (!databaseId || databaseId === 'default') {

      return getSupabaseClient({ databaseUrl: process.env.DATABASE_URL 
      })
    }

    const defaultSupabase = await getSupabaseClient()

    const { data, error } = await defaultSupabase
      .from('database_connections')
      .select(
        'supabase_url, supabase_service_role_key, database_url' 
      )
      .eq('id', databaseId)
      .single()

    if (error || !data) return null

    return getSupabaseClient({
      url: data.supabase_url,
      key: data.supabase_service_role_key,
      databaseUrl: data.database_url
    })
  } catch (error) {
    console.error('Database client error:', error)
    return null
  }
}