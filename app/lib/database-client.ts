import { getSupabaseClient } from '../lib/supabase'

export async function createDatabaseClient(databaseId?: string) {
  try {
    if (!databaseId || databaseId === 'default') {
      // ✏️ REAL CAUSE: Default database ke liye PostgreSQL URL nahi bhej rahe the
      // ✏️ FIX: databaseUrl parameter add kiya
      return getSupabaseClient({ 
        mode: 'service',
        databaseUrl: process.env.DATABASE_URL // ✏️ NEW: PostgreSQL URL
      })
    }

    const defaultSupabase = await getSupabaseClient({ mode: 'service' })

    const { data, error } = await defaultSupabase
      .from('add_new_databases')
      .select(
        'supabase_url, supabase_service_role_key, supabase_anon_key, database_url' // ✏️ ADDED: database_url field
      )
      .eq('id', databaseId)
      .single()

    if (error || !data) return null

    // ✏️ REAL CAUSE: Custom database ke liye bhi PostgreSQL URL nahi bhej rahe the
    // ✏️ FIX: database_url parameter add kiya
    return getSupabaseClient({
      url: data.supabase_url,
      key: data.supabase_service_role_key || data.supabase_anon_key,
      mode: data.supabase_service_role_key ? 'service' : 'public',
      databaseUrl: data.database_url // ✏️ NEW: PostgreSQL URL from database record
    })
  } catch (error) {
    console.error('❌ Database client error:', error)
    return null
  }
}