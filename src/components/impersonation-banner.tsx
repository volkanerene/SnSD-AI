'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUserName, setImpersonatedUserName] = useState('');

  useEffect(() => {
    // Check if impersonation cookie exists
    const checkImpersonation = () => {
      const cookies = document.cookie.split(';');
      const impersonationCookie = cookies.find((c) =>
        c.trim().startsWith('impersonation=')
      );
      const nameCookie = cookies.find((c) =>
        c.trim().startsWith('impersonated_user_name=')
      );

      if (impersonationCookie) {
        setIsImpersonating(true);
        if (nameCookie) {
          const name = nameCookie.split('=')[1];
          setImpersonatedUserName(decodeURIComponent(name));
        }
      } else {
        setIsImpersonating(false);
        setImpersonatedUserName('');
      }
    };

    checkImpersonation();
    // Check periodically in case cookie changes
    const interval = setInterval(checkImpersonation, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExitImpersonation = async () => {
    try {
      const response = await fetch('/api/admin/impersonate/exit', {
        method: 'POST'
      });

      if (response.ok) {
        // Redirect to admin users page
        window.location.href = '/dashboard/admin/users';
      } else {
        console.error('Failed to exit impersonation');
      }
    } catch (error) {
      console.error('Error exiting impersonation:', error);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <Alert className='fixed top-0 right-0 left-0 z-50 rounded-none border-b-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20'>
      <AlertCircle className='h-5 w-5 text-orange-600' />
      <AlertDescription className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold text-orange-900 dark:text-orange-100'>
            Impersonation Mode Active
          </span>
          <span className='text-sm text-orange-700 dark:text-orange-300'>
            {impersonatedUserName
              ? `Viewing as: ${impersonatedUserName}`
              : 'You are currently viewing the application as another user.'}
          </span>
        </div>
        <Button
          onClick={handleExitImpersonation}
          variant='outline'
          size='sm'
          className='ml-4 border-orange-600 text-orange-600 hover:bg-orange-100 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950'
        >
          <LogOut className='mr-2 h-4 w-4' />
          Exit Impersonation
        </Button>
      </AlertDescription>
    </Alert>
  );
}
