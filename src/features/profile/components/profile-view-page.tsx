'use client';

import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getRoleName } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

export default function ProfileViewPage() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading profile...</div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-destructive'>Profile not found</div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 pt-6 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Profile</h2>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-20 w-20'>
                <AvatarFallback className='text-2xl'>
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className='text-xl font-semibold'>{profile.full_name}</h3>
                <p className='text-muted-foreground text-sm'>{user.email}</p>
              </div>
            </div>

            <div className='space-y-2'>
              <div>
                <p className='text-muted-foreground text-sm'>Username</p>
                <p className='font-medium'>{profile.username || 'Not set'}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Phone</p>
                <p className='font-medium'>{profile.phone || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role & Access</CardTitle>
            <CardDescription>Your permissions and role</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Role</p>
              <p className='text-lg font-semibold'>
                {getRoleName(profile.role_id)}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Department</p>
              <p className='font-medium'>{profile.department || 'Not set'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Job Title</p>
              <p className='font-medium'>{profile.job_title || 'Not set'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Status</p>
              <p className='font-medium'>
                {profile.is_active ? (
                  <span className='text-green-600'>Active</span>
                ) : (
                  <span className='text-red-600'>Inactive</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Your account preferences</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div>
              <p className='text-muted-foreground text-sm'>Language</p>
              <p className='font-medium'>{profile.locale?.toUpperCase()}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Timezone</p>
              <p className='font-medium'>{profile.timezone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button variant='outline' className='w-full' disabled>
              Edit Profile (Coming Soon)
            </Button>
            <Button variant='outline' className='w-full' disabled>
              Change Password (Coming Soon)
            </Button>
            <Button
              variant='destructive'
              className='w-full'
              onClick={() => router.push('/auth/sign-in')}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
