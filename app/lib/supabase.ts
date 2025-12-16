import { createClient } from '@supabase/supabase-js'
import { autoDeployRPCFunctions } from './deploy-rpc'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createServerClient = () => {
  const key = supabaseServiceKey || supabaseAnonKey
  
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

let isRPCDeployed = false

if (!isRPCDeployed) {
  autoDeployRPCFunctions()
    .then(result => {
      if (result.success) {
        isRPCDeployed = true
        if (result.alreadyDeployed) {
          console.log(' RPC functions already deployed')
        } else {
          console.log(' RPC functions deployed successfully')
        }
      } else {
        console.error(' RPC deployment failed:', result.message)
      }
    })
    .catch(error => {
      console.error(' RPC deployment error:', error)
    })
}