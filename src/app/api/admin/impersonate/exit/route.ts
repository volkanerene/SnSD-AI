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

  // Get Supabase project ref for cookie name
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

  // Clear all session-related cookies
  if (projectRef) {
    response.cookies.delete(`sb-${projectRef}-auth-token`);
  }
  response.cookies.delete('impersonation');
  response.cookies.delete('impersonated_user_name');

  return response;
}
