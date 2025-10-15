'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { signInAsync, isSigningIn } = useAuth();

  const defaultValues = {
    email: '',
    password: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    try {
      console.log('🔐 [AUTH FORM] Starting sign in...');

      const result = await signInAsync({
        email: data.email,
        password: data.password
      });

      console.log('✅ [AUTH FORM] Sign in successful!', result);
      console.log('🍪 [AUTH FORM] Checking cookies...', document.cookie);

      toast.success('Signed in successfully!');

      // Wait for cookies to be set before redirecting
      console.log('⏳ [AUTH FORM] Waiting 500ms for cookies to sync...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('🍪 [AUTH FORM] Cookies after wait:', document.cookie);

      // Force a full page reload to ensure cookies are set and middleware picks up the session
      const redirectUrl = callbackUrl || '/dashboard';
      console.log('🔄 [AUTH FORM] Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error('❌ [AUTH FORM] Sign in failed:', error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  return (
    <>
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-4'
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='Enter your email...'
                  disabled={isSigningIn}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Enter your password...'
                  disabled={isSigningIn}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isSigningIn} className='w-full' type='submit'>
          {isSigningIn ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>Or</span>
        </div>
      </div>

      <div className='text-center text-sm'>
        <span className='text-muted-foreground'>Don't have an account? </span>
        <Link
          href='/auth/sign-up'
          className='hover:text-primary underline underline-offset-4'
        >
          Sign up
        </Link>
      </div>

      <div className='text-center text-sm'>
        <Link
          href='/auth/forgot-password'
          className='text-muted-foreground hover:text-primary underline underline-offset-4'
        >
          Forgot your password?
        </Link>
      </div>
    </>
  );
}
