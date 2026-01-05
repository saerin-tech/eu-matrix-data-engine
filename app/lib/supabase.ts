import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { autoDeployRPCFunctions } from './deploy-rpc'

interface SupabaseFactoryOptions {
  url?: string
  key?: string
  persistSession?: boolean
  autoRefreshToken?: boolean
  databaseUrl?: string
}

const DEFAULT_URL = process.env.SUPABASE_URL!
const ANON_KEY = process.env.SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DATABASE_URL = process.env.DATABASE_URL 

if (!DEFAULT_URL) throw new Error('SUPABASE_URL missing')
if (!ANON_KEY) throw new Error('SUPABASE_ANON_KEY missing')
if (!SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')

const deployedDatabases = new Set<string>()
let currentClient: SupabaseClient | null = null
let currentUrl: string | null = null

export async function getSupabaseClient(
  options: SupabaseFactoryOptions = {}
): Promise<SupabaseClient> {
  const {
    url,
    key,
    persistSession = false,
    autoRefreshToken = false,
    databaseUrl, 
  } = options

  const finalUrl = url || DEFAULT_URL
  const finalKey = key || SERVICE_KEY
  const pgUrl = databaseUrl || DATABASE_URL

  // RPC deployment - one time deploy on each database
  if (pgUrl && !deployedDatabases.has(pgUrl)) {
    try {
      const result = await autoDeployRPCFunctions(pgUrl)
      if (result.success) {
        deployedDatabases.add(pgUrl)
        console.log('RPC functions deployed for:', pgUrl)
      } else {
        console.error('RPC deployment failed:', result.message)
      }
    } catch (error) {
      console.error('RPC deployment error:', error)
    }
  }

 if (currentUrl === finalUrl && currentClient) {
    return currentClient
  }
  return createClient(finalUrl, finalKey, {
    auth: { persistSession, autoRefreshToken },
  })
}