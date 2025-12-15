import fs from 'fs'
import path from 'path'
import { Pool } from 'pg';

let deploymentStatus: 'pending' | 'deployed' | 'failed' = 'pending'
let lastError: string | null = null

export async function autoDeployRPCFunctions(databaseUrl?: string): Promise<{
  success: boolean
  message: string
  alreadyDeployed: boolean
}> {
  if (deploymentStatus === 'deployed') {
    return {
      success: true,
      message: 'RPC functions already deployed',
      alreadyDeployed: true
    }
  }

  const dbUrl = databaseUrl || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not found');
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
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
    const sql = fs.readFileSync(sqlPath, 'utf-8');
     await pool.query(sql);
    
    deploymentStatus = 'deployed'
    lastError = null
    console.log('SUCCESS: All RPC functions deployed in Database')

    return {
      success: true,
      message: 'RPC functions deployed successfully',
      alreadyDeployed: false
    }

  } catch (error: any) {
    deploymentStatus = 'failed'
    lastError = error.message
    console.error('FAILED:', error.message)
    return {
      success: false,
      message: `Deployment failed: ${error.message}`,
      alreadyDeployed: false
    }
  }finally{
   await pool.end()
  }
}

export function getDeploymentStatus() {
  return { status: deploymentStatus, error: lastError }
}
