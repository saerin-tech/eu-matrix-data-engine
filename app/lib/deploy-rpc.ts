import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

export async function autoDeployRPCFunctions(databaseUrl?: string): Promise<{
  success: boolean
  message: string
  alreadyDeployed: boolean
}> {
  const dbUrl = databaseUrl || process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error('DATABASE_URL not found')
  }

  let pool: Pool | null = null

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    })

    await pool.query('SELECT 1')

    const sqlPath = path.join(
      process.cwd(),
      'app',
      'supabase',
      'migrations',
      '001_create_all_rpc_functions.sql'
    )

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at: ${sqlPath}`)
    }

    const sql = fs.readFileSync(sqlPath, 'utf-8')
    
    await pool.query(sql)
    console.log('SQL executed successfully')

    return {
      success: true,
      message: 'RPC functions deployed successfully',
      alreadyDeployed: false,
    }
  } catch (error: any) {
    console.error('DEPLOYMENT FAILED:', error.message)
    console.error('Stack:', error.stack)
    
    return {
      success: false,
      message: `Deployment failed: ${error.message}`,
      alreadyDeployed: false,
    }
  } finally {
    if (pool) {
      await pool.end()

    }
  }
}