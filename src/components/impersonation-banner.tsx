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
          // Get everything after the first '=' to handle values with '=' in them
          const name = nameCookie.substring(nameCookie.indexOf('=') + 1).trim();
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
    <div className='w-full border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-2 dark:border-orange-900 dark:from-orange-950/30 dark:to-amber-950/30'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-900/50'>
            <AlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
            <span className='text-xs font-semibold tracking-wide text-orange-700 uppercase dark:text-orange-300'>
              Impersonation Mode
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>Viewing as:</span>
            <span className='text-foreground font-semibold'>
              {impersonatedUserName || 'Unknown User'}
            </span>
          </div>
        </div>
        <Button
          onClick={handleExitImpersonation}
          variant='outline'
          size='sm'
          className='border-orange-300 bg-white text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900'
        >
          <LogOut className='mr-2 h-3.5 w-3.5' />
          Exit
        </Button>
      </div>
    </div>
  );
}
