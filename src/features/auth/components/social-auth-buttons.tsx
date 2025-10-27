'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Provider = 'google' | 'linkedin_oidc';

interface ProviderConfig {
  id: Provider;
  label: string;
  icon: keyof typeof Icons;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: 'google'
  },
  {
    id: 'linkedin_oidc',
    label: 'Continue with LinkedIn',
    icon: 'linkedin'
  }
];

function resolveRedirectUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://snsdconsultant.com';
  return `${baseUrl.replace(/\/$/, '')}/auth/callback`;
}

export interface SocialAuthButtonsProps {
  className?: string;
}

export function SocialAuthButtons({ className }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleProviderSignIn = async (provider: Provider) => {
    try {
      setLoadingProvider(provider);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: resolveRedirectUrl(),
          skipBrowserRedirect: false
        }
      });

      if (error) throw error;

      if (!data?.url) {
        toast.error('Could not start the authentication flow.');
        setLoadingProvider(null);
        return;
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('❌ [SocialAuthButtons] OAuth sign in failed', error);
      toast.error(
        error?.message || 'We could not connect to the selected provider.'
      );
      setLoadingProvider(null);
    }
  };

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {PROVIDERS.map((provider) => {
        const Icon = Icons[provider.icon];
        return (
          <Button
            key={provider.id}
            type='button'
            variant='outline'
            className='w-full'
            disabled={loadingProvider === provider.id}
            onClick={() => handleProviderSignIn(provider.id)}
          >
            <Icon className='mr-2 h-4 w-4' />
            {loadingProvider === provider.id ? 'Connecting...' : provider.label}
          </Button>
        );
      })}
    </div>
  );
}
