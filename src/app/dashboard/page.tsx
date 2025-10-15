import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/sign-in');
  }

  // Get user profile to determine role-based redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single();

  if (profile?.role_id !== undefined) {
    // Role-based redirects
    const dashboardRoutes: Record<number, string> = {
      0: '/dashboard/overview', // SNSD Admin
      1: '/dashboard/overview', // Company Admin
      2: '/dashboard/evaluations', // HSE Manager
      3: '/dashboard/evaluations', // HSE Specialist
      4: '/dashboard/my-evaluations' // Contractor
    };
    const redirectUrl =
      dashboardRoutes[profile.role_id] || '/dashboard/overview';
    redirect(redirectUrl);
  } else {
    redirect('/dashboard/overview');
  }
}
