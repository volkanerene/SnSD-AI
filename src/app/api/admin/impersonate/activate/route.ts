import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_impersonation_token', request.url)
    );
  }

  // Use admin client for all operations
  const adminClient = createAdminClient();

  // Get impersonation session
  const { data: session, error: sessionError } = await adminClient
    .from('impersonation_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (sessionError || !session) {
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_impersonation_session', request.url)
    );
  }

  // Check if session has expired
  if (new Date(session.expires_at) < new Date()) {
    // Delete expired session
    await adminClient
      .from('impersonation_sessions')
      .delete()
      .eq('token', token);

    return NextResponse.redirect(
      new URL('/dashboard?error=impersonation_session_expired', request.url)
    );
  }

  // Get target user's email for sign in
  const { data: targetUser } = await adminClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', session.target_user_id)
    .single();

  if (!targetUser) {
    return NextResponse.redirect(
      new URL('/dashboard?error=target_user_not_found', request.url)
    );
  }

  // Sign in as target user using admin API
  const {
    data: { session: newSession },
    error: signInError
  } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email
  });

  if (signInError || !newSession) {
    console.error('Error generating magic link:', signInError);
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_impersonate', request.url)
    );
  }

  // Mark session as used
  await adminClient
    .from('impersonation_sessions')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('token', token);

  // Create response with impersonation indicator
  const response = NextResponse.redirect(
    new URL('/dashboard?impersonated=true', request.url)
  );

  // Set session cookie
  response.cookies.set('sb-access-token', newSession.access_token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30 // 30 minutes
  });

  response.cookies.set('sb-refresh-token', newSession.refresh_token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30
  });

  // Add impersonation indicator cookie
  response.cookies.set('impersonation', 'true', {
    path: '/',
    httpOnly: false, // Allow client-side access to show banner
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30
  });

  // Store impersonated user's name for display in banner
  response.cookies.set(
    'impersonated_user_name',
    encodeURIComponent(targetUser.full_name || targetUser.email),
    {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30
    }
  );

  return response;
}
