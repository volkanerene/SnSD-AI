import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DashboardWrapper } from '@/components/dashboards/dashboard-wrapper';

export default async function DashboardPage() {
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

  return (
    <div className='p-4 pt-6 md:p-8'>
      <DashboardWrapper roleId={profile.role_id} />
    </div>
  );
}
