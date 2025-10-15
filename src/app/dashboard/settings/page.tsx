'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, signOutAsync } = useAuth();
  const { profile, updateProfileAsync } = useProfile();
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    locale: profile?.locale || 'en',
    timezone: profile?.timezone || 'UTC',
    email_notifications: profile?.notification_preferences?.email ?? true,
    sms_notifications: profile?.notification_preferences?.sms ?? false,
    push_notifications: profile?.notification_preferences?.push ?? true
  });

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfileAsync({
        full_name: formData.full_name,
        phone: formData.phone
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAsync();
      toast.success('Signed out successfully');
      router.push('/auth/sign-in');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  if (!profile || !user) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 pt-6 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <div className='grid gap-6'>
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={user.email}
                disabled
                className='bg-muted'
              />
              <p className='text-muted-foreground text-xs'>
                Email cannot be changed
              </p>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='full_name'>Full Name</Label>
              <Input
                id='full_name'
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder='John Doe'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                type='tel'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder='+90 555 123 4567'
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className='w-full sm:w-auto'
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='locale'>Language</Label>
              <Select value={formData.locale} disabled>
                <SelectTrigger id='locale'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='tr'>Türkçe</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-xs'>
                Language preferences (coming soon)
              </p>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='timezone'>Timezone</Label>
              <Select value={formData.timezone} disabled>
                <SelectTrigger id='timezone'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='UTC'>UTC</SelectItem>
                  <SelectItem value='Europe/Istanbul'>
                    Europe/Istanbul
                  </SelectItem>
                  <SelectItem value='America/New_York'>
                    America/New York
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-xs'>
                Timezone preferences (coming soon)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-notifications'>Email Notifications</Label>
                <p className='text-muted-foreground text-sm'>
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id='email-notifications'
                checked={formData.email_notifications}
                disabled
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='sms-notifications'>SMS Notifications</Label>
                <p className='text-muted-foreground text-sm'>
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                id='sms-notifications'
                checked={formData.sms_notifications}
                disabled
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-notifications'>Push Notifications</Label>
                <p className='text-muted-foreground text-sm'>
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                id='push-notifications'
                checked={formData.push_notifications}
                disabled
              />
            </div>

            <p className='text-muted-foreground text-xs'>
              Notification preferences (coming soon)
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label>Password</Label>
              <p className='text-muted-foreground text-sm'>
                Password management via Supabase Auth
              </p>
              <Button variant='outline' disabled>
                Change Password (Coming Soon)
              </Button>
            </div>

            <Separator />

            <div className='space-y-2'>
              <Label>Two-Factor Authentication</Label>
              <p className='text-muted-foreground text-sm'>
                Add an extra layer of security to your account
              </p>
              <Button variant='outline' disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className='border-destructive'>
          <CardHeader>
            <CardTitle className='text-destructive'>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Sign Out</Label>
                <p className='text-muted-foreground text-sm'>
                  Sign out from your current session
                </p>
              </div>
              <Button variant='destructive' onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Delete Account</Label>
                <p className='text-muted-foreground text-sm'>
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant='destructive' disabled>
                Delete Account (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
