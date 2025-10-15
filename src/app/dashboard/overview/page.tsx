import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { HSEDashboard } from '@/components/dashboards/hse-dashboard';
import { ContractorDashboard } from '@/components/dashboards/contractor-dashboard';

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/sign-in');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-[400px]'>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Your profile could not be loaded. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Render role-specific dashboard
  const roleId = profile.role_id;

  return (
    <div className='p-4 pt-6 md:p-8'>
      {/* SNSD Admin (1) or Company Admin (2) */}
      {roleId <= 2 && <AdminDashboard />}

      {/* HSE Specialist (3) or Supervisor (5) */}
      {(roleId === 3 || roleId === 5) && <HSEDashboard />}

      {/* Contractor Admin (4) or Worker (6) */}
      {(roleId === 4 || roleId === 6) && <ContractorDashboard />}

      {/* Fallback for unknown roles */}
      {roleId > 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Unavailable</CardTitle>
            <CardDescription>
              No dashboard configured for your role. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
