'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export default function GithubSignInButton() {
  const handleGithubSignIn = () => {
    // TODO: Implement GitHub OAuth authentication
    toast.info('GitHub authentication coming soon!');
  };

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={handleGithubSignIn}
    >
      <Icons.github className='mr-2 h-4 w-4' />
      Continue with Github
    </Button>
  );
}
