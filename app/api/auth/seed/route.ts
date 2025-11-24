import { NextRequest, NextResponse } from 'next/server';
import { seedUser } from '../../../lib/auth';

export async function POST(request: NextRequest) {
    
  try {
    // Check if seeding is enabled
    if (process.env.NEXT_PUBLIC_SEED !== 'TRUE') {
      return NextResponse.json(
        { success: false, message: 'SEED is not TRUE in .env' },
        { status: 403 }
      );
    }

    const result = await seedUser();
    
    // Log credentials if new user was created
    if (result.credentials) {
      console.log('-----------------------------------');
      console.log('NEW USER CREDENTIALS:');
      console.log('user_name:', result.credentials.user_name);
      console.log('user_password:', result.credentials.user_password);
      console.log('-----------------------------------');
    }
    
    return NextResponse.json({message : result.message});
  } catch (error: any) {
    console.error(' Seed API error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
