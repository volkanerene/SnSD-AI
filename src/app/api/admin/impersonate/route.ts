import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Get current user (admin)
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Verify admin has permission to impersonate
  // Get admin's profile and check if they have admin role
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', currentUser.id)
    .single();

  // Only allow SNSD Admin (role_id <= 1) to impersonate
  if (!adminProfile || adminProfile.role_id > 1) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  // Use admin client to check target user
  const adminClient = createAdminClient();

  // Get target user's details
  const { data: targetUser, error: userError } = await adminClient
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .single();

  if (userError || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

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
