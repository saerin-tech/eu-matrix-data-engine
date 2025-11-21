import { NextRequest, NextResponse } from 'next/server';
import { validateLogin } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { user_name, user_password } = await request.json();

    if (!user_name || !user_password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await validateLogin(user_name, user_password);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}