import { NextResponse } from 'next/server'
import { autoDeployRPCFunctions, getDeploymentStatus } from '../../lib/deploy-rpc'

export async function GET() {
  const status = getDeploymentStatus()
  return NextResponse.json({
    deployed: status.status === 'deployed',
    status: status.status,
    error: status.error
  })
}

export async function POST() {
  try {
    const result = await autoDeployRPCFunctions()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      alreadyDeployed: result.alreadyDeployed
    })
  } catch (error: any) {
    console.error('[API] Deployment error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
