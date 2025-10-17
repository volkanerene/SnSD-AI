import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const userClient = await createClient();

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

  // Get admin's session to fetch user data from backend
  const { data: adminAuthData } = await userClient.auth.getUser();
  const { data: adminSessionData } = await userClient.auth.getSession();

  if (!adminAuthData.user || !adminSessionData.session) {
    return NextResponse.redirect(
      new URL('/dashboard?error=admin_session_invalid', request.url)
    );
  }

  // Fetch target user's data from backend (for name) and Supabase (for email)
  let targetUser;
  let targetUserEmail;

  try {
    // Get user data from backend for display name
    const userResponse = await fetch(
      `${API_URL}/users/${session.target_user_id}`,
      {
        headers: {
          Authorization: `Bearer ${adminSessionData.session.access_token}`
        }
      }
    );

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL('/dashboard?error=target_user_not_found', request.url)
      );
    }

    targetUser = await userResponse.json();

    // Get email from Supabase auth.users table
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.getUserById(session.target_user_id);

    if (authError || !authUser || !authUser.user || !authUser.user.email) {
      console.error('Error fetching target user email:', authError);
      return NextResponse.redirect(
        new URL('/dashboard?error=target_user_email_not_found', request.url)
      );
    }

    targetUserEmail = authUser.user.email;
    console.log('Target user email:', targetUserEmail);
  } catch (error) {
    console.error('Error fetching target user:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_fetch_user', request.url)
    );
  }

  // Generate a magic link for the target user using admin API
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUserEmail
    });

  if (linkError || !linkData || !linkData.properties) {
    console.error('Error generating magic link:', linkError);
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_impersonate', request.url)
    );
  }

  // Extract the hashed_token from the action_link
  const actionLink = linkData.properties.action_link;
  const url = new URL(actionLink);
  const hashedToken = url.searchParams.get('token') || url.hash.split('=')[1];

  if (!hashedToken) {
    console.error('No token in generated link');
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_impersonate', request.url)
    );
  }

  // Verify the OTP token to get a session
  const { data: verifyData, error: verifyError } =
    await adminClient.auth.verifyOtp({
      type: 'magiclink',
      token_hash: hashedToken
    });

  if (verifyError || !verifyData || !verifyData.session) {
    console.error('Error verifying OTP:', verifyError);
    return NextResponse.redirect(
      new URL('/dashboard?error=failed_to_impersonate', request.url)
    );
  }

  const newSession = verifyData.session;

  // Mark session as used
  await adminClient
    .from('impersonation_sessions')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('token', token);

  // Create response with impersonation indicator
  const response = NextResponse.redirect(
    new URL('/dashboard?impersonated=true', request.url)
  );

  // Get Supabase project ref from URL for cookie name
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

  if (!projectRef) {
    console.error('Could not extract project ref from Supabase URL');
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_supabase_config', request.url)
    );
  }

  // Set session cookie with correct Supabase SSR format
  const authToken = Buffer.from(
    JSON.stringify({
      access_token: newSession.access_token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: newSession.refresh_token,
      user: newSession.user
    })
  ).toString('base64');

  response.cookies.set(`sb-${projectRef}-auth-token`, `base64-${authToken}`, {
    path: '/',
    httpOnly: false, // Supabase SSR cookies are not httpOnly
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30 // 30 minutes
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
