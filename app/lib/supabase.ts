import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { autoDeployRPCFunctions } from './deploy-rpc'

type SupabaseMode = 'public' | 'service'

interface SupabaseFactoryOptions {
  mode?: SupabaseMode
  url?: string
  key?: string
  persistSession?: boolean
  autoRefreshToken?: boolean
  databaseUrl?: string
}

const DEFAULT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL 

if (!DEFAULT_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL missing')
if (!ANON_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY missing')

const deployedDatabases = new Set<string>()

export async function getSupabaseClient(
  options: SupabaseFactoryOptions = {}
): Promise<SupabaseClient> {
  const {
    mode = 'public',
    url,
    key,
    persistSession = false,
    autoRefreshToken = false,
    databaseUrl, 
  } = options

  const finalUrl = url || DEFAULT_URL
  const finalKey = key || (mode === 'service' ? SERVICE_KEY : ANON_KEY)

  if (!finalUrl || !finalKey) {
    throw new Error('Supabase URL / Key missing')
  }

  if (!deployedDatabases.has(finalUrl)) {    
    const pgUrl = databaseUrl || DATABASE_URL
    if (pgUrl) {
      const result = await autoDeployRPCFunctions(pgUrl)
      if (result.success) {
        deployedDatabases.add(finalUrl)
        console.log('RPC functions deployed successfully')
      } else {
        console.error('RPC deployment failed:', result.message)
      }
    } else {
      console.warn('No DATABASE_URL provided, skipping RPC deployment')
    }
  } else {
    console.log("RPC functions Already Deployed")
  }

  return createClient(finalUrl, finalKey, {
    auth: {
      persistSession,
      autoRefreshToken,
    },
  })
}