import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getRoleName } from '@/lib/auth-utils';

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

  const roleName = getRoleName(profile.role_id);

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>
          Dashboard Overview
        </h2>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{profile.full_name}</div>
            <p className='text-muted-foreground text-xs'>{roleName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-sm font-medium'>{user.email}</div>
            <p className='text-muted-foreground text-xs'>
              Your registered email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-sm font-medium'>{roleName}</div>
            <p className='text-muted-foreground text-xs'>Your access level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-sm font-bold text-green-600'>Active</div>
            <p className='text-muted-foreground text-xs'>Account status</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions for {roleName}</CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            <div className='space-y-4'>
              {profile.role_id <= 1 && (
                <div className='flex items-center space-x-4'>
                  <div className='space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      Manage Contractors
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      View and manage contractor information
                    </p>
                  </div>
                  <a
                    href='/dashboard/contractors'
                    className='hover:bg-muted rounded-md px-3 py-2 text-sm font-medium transition-colors'
                  >
                    Go
                  </a>
                </div>
              )}

              {profile.role_id <= 3 && (
                <div className='flex items-center space-x-4'>
                  <div className='space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      FRM-32 Evaluations
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Create and review safety evaluations
                    </p>
                  </div>
                  <a
                    href='/dashboard/evaluations'
                    className='hover:bg-muted rounded-md px-3 py-2 text-sm font-medium transition-colors'
                  >
                    Go
                  </a>
                </div>
              )}

              {profile.role_id === 4 && (
                <div className='flex items-center space-x-4'>
                  <div className='space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      My Evaluations
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      View your safety evaluations
                    </p>
                  </div>
                  <a
                    href='/dashboard/my-evaluations'
                    className='hover:bg-muted rounded-md px-3 py-2 text-sm font-medium transition-colors'
                  >
                    Go
                  </a>
                </div>
              )}

              {profile.role_id <= 1 && (
                <div className='flex items-center space-x-4'>
                  <div className='space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      Payments & Invoices
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Manage payment records and subscriptions
                    </p>
                  </div>
                  <a
                    href='/dashboard/payments'
                    className='hover:bg-muted rounded-md px-3 py-2 text-sm font-medium transition-colors'
                  >
                    Go
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    Welcome to SnSD AI
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Your dashboard is ready to use
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
