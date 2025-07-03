
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'signup':
        const { email, password, name, phone } = data;
        const newUser = await AuthService.signUp(email, password, name, phone);
        return NextResponse.json({ user: newUser }, { status: 201 });

      case 'signin':
        const { email: loginEmail, password: loginPassword } = data;
        const user = await AuthService.signIn(loginEmail, loginPassword);
        return NextResponse.json({ user }, { status: 200 });

      case 'reset-password':
        const { email: resetEmail } = data;
        await AuthService.resetPassword(resetEmail);
        return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 400 }
    );
  }
}
