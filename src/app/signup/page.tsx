'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface SignupVerifyResponse {
  contractor_email: string;
  contractor_name: string;
  session_id: string;
  contractor_id: string;
  valid: boolean;
}

export default function ContractorSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });

  const [verifyData, setVerifyData] = useState<SignupVerifyResponse | null>(
    null
  );

  const sessionId = searchParams.get('session');
  const contractorId = searchParams.get('contractor');

  // Verify session and contractor on mount
  useEffect(() => {
    const verifySignup = async () => {
      if (!sessionId || !contractorId) {
        setError(
          'Invalid signup link. Missing session or contractor information.'
        );
        setLoading(false);
        return;
      }

      // Use production API URL - no localhost fallback
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'https://api.snsdconsultant.com';

      try {
        const response = await fetch(
          `${apiUrl}/contractor/signup/verify?session_id=${sessionId}&contractor_id=${contractorId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.detail || `API returned ${response.status}`;
          setError(errorMessage);
          setLoading(false);
          return;
        }

        const data: SignupVerifyResponse = await response.json();

        // Check if contractor is already registered (already has an account)
        if (data.valid === false || !data.valid) {
          console.log(
            '[Signup] Contractor already registered, redirecting to signin'
          );
          setError('This contractor account is already registered.');
          // Redirect to signin after 2 seconds
          setTimeout(() => {
            router.push('/auth/sign-in');
          }, 2000);
          setLoading(false);
          return;
        }

        setVerifyData(data);
        setLoading(false);
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify signup link. Please try again later.');
        setLoading(false);
      }
    };

    verifySignup();
  }, [sessionId, contractorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validation
    if (!formData.password) {
      setError('Password is required');
      setSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setSubmitting(false);
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://api.snsdconsultant.com';

    try {
      const response = await fetch(`${apiUrl}/contractor/signup/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: verifyData?.contractor_email,
          password: formData.password,
          password_confirm: formData.passwordConfirm,
          session_id: sessionId,
          contractor_id: contractorId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail || `Registration failed: ${response.status}`;

        // If email already registered, redirect to sign-in
        if (
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists')
        ) {
          setError(
            'This email is already registered. Redirecting to sign-in...'
          );
          setTimeout(() => {
            router.push('/auth/sign-in');
          }, 1500);
          setSubmitting(false);
          return;
        }

        setError(errorMessage);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);

      // Store contractor ID in session for redirect
      sessionStorage.setItem('newContractorId', contractorId || '');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        'Failed to reach the API. Please check your connection and try again.'
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <Loader2 className='mx-auto mb-2 h-8 w-8 animate-spin text-blue-600' />
            <CardTitle>Verifying...</CardTitle>
            <CardDescription>
              Please wait while we verify your signup link
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!verifyData && error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <AlertCircle className='mx-auto mb-2 h-8 w-8 text-red-600' />
            <CardTitle>Invalid Signup Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className='mt-4 w-full' onClick={() => router.push('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CheckCircle2 className='mx-auto mb-2 h-8 w-8 text-green-600' />
            <CardTitle>Registration Successful!</CardTitle>
            <CardDescription>
              Your account has been created successfully.
              <br />
              Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Complete your registration for EvrenGPT evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Email - Read Only */}
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={verifyData?.contractor_email || ''}
                disabled
                className='cursor-not-allowed bg-gray-50'
              />
              <p className='text-sm text-gray-500'>
                This email was sent your invitation
              </p>
            </div>

            {/* Contractor Name - Display Only */}
            <div className='space-y-2'>
              <Label htmlFor='name'>Company Name</Label>
              <Input
                id='name'
                type='text'
                value={verifyData?.contractor_name || ''}
                disabled
                className='cursor-not-allowed bg-gray-50'
              />
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='Enter a strong password'
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={submitting}
              />
              <p className='text-sm text-gray-500'>At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='passwordConfirm'>Confirm Password</Label>
              <Input
                id='passwordConfirm'
                name='passwordConfirm'
                type='password'
                placeholder='Confirm your password'
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                minLength={8}
                disabled={submitting}
              />
            </div>

            {/* Submit Button */}
            <Button type='submit' className='w-full' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Login Link */}
            <div className='text-center text-sm'>
              Already have an account?{' '}
              <Link
                href='/auth/sign-in'
                className='text-blue-600 hover:underline'
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
