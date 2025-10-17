import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Get current user (admin)
  const {
    data: { user: currentUser },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Get current user's session for API calls
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Verify admin has permission by fetching from backend
  try {
    const profileResponse = await fetch(`${API_URL}/profiles/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify admin status' },
        { status: 403 }
      );
    }

    const adminProfile = await profileResponse.json();

    // Only allow SNSD Admin (role_id <= 1) to impersonate
    if (!adminProfile || adminProfile.role_id > 1) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get target user's details from backend
    const userResponse = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = await userResponse.json();

    if (!targetUser || !targetUser.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }

  // Use admin client to store impersonation session in Supabase
  const adminClient = createAdminClient();

  // Create impersonation token (store in database for security)
  const impersonationToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Store impersonation session in database using admin client
  const { error: insertError } = await adminClient
    .from('impersonation_sessions')
    .insert({
      token: impersonationToken,
      admin_user_id: currentUser.id,
      target_user_id: userId,
      expires_at: expiresAt.toISOString()
    });

  if (insertError) {
    console.error('Error creating impersonation session:', insertError);
    return NextResponse.json(
      { error: 'Failed to create impersonation session' },
      { status: 500 }
    );
  }

  // Redirect to impersonation handler with token
  const impersonateRedirectUrl = new URL(
    '/api/admin/impersonate/activate',
    request.url
  );
  impersonateRedirectUrl.searchParams.set('token', impersonationToken);

  return NextResponse.redirect(impersonateRedirectUrl);
}
