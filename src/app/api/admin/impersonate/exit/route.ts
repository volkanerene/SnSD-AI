import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  // Get current user session
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Sign out the impersonated user session
  await supabase.auth.signOut();

  // Create response
  const response = NextResponse.json(
    { success: true, message: 'Impersonation session ended' },
    { status: 200 }
  );

  // Clear all session-related cookies
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  response.cookies.delete('impersonation');
  response.cookies.delete('impersonated_user_name');

  return response;
}
