import { Metadata } from 'next';
import UserAuthForm from './user-auth-form';
import { SnSDLogo } from '@/components/branding/snsd-logo';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col justify-between p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-slate-950 opacity-95' />
        <div className='relative z-20 flex items-center'>
          <SnSDLogo href='/' priority />
        </div>

        <div className='relative z-20 mt-auto space-y-6'>
          <blockquote className='space-y-4'>
            <p className='text-2xl leading-snug font-semibold'>
              SnSD Consultants ile tedarikçi yönetimi, risk değerlendirme ve
              uyumluluk kontrollerini tek panelden yönetin.
            </p>
            <footer className='text-sm text-slate-200'>
              Endüstri standartlarına uygun raporlama, yapay zeka destekli
              değerlendirme ve ekip iş birliği için tasarlandı.
            </footer>
          </blockquote>
          <div className='text-sm text-slate-300'>
            <span className='font-semibold text-white'>Destek:</span>{' '}
            <Link
              href='mailto:support@snsdconsultant.com'
              className='underline underline-offset-4 hover:text-sky-300'
            >
              support@snsdconsultant.com
            </Link>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center p-6 lg:p-12'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-8'>
          <SnSDLogo href='/' className='block lg:hidden' />

          <div className='mx-auto flex w-full flex-col justify-center space-y-6'>
            <div className='flex flex-col space-y-2 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Hesabınıza giriş yapın
              </h1>
              <p className='text-muted-foreground text-sm'>
                Kurumsal hesabınızla SnSD Consultants platformuna bağlanın.
              </p>
            </div>
            <UserAuthForm />
          </div>

          <p className='text-muted-foreground px-8 text-center text-sm'>
            Devam ederek{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Kullanım Koşulları
            </Link>{' '}
            ve{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Gizlilik Politikası
            </Link>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}
