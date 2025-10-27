import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SnSDLogoProps {
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export function SnSDLogo({
  href = '/',
  className,
  priority = false
}: SnSDLogoProps) {
  const logo = (
    <Image
      src='/assets/SnSD_Logo_Transparent.png'
      alt='SnSD Consultants'
      width={180}
      height={60}
      priority={priority}
      className='h-12 w-auto dark:hidden'
    />
  );

  const logoDark = (
    <Image
      src='/assets/SnSD_Logo_White_BG.png'
      alt='SnSD Consultants'
      width={180}
      height={60}
      priority={priority}
      className='hidden h-12 w-auto dark:block'
    />
  );

  if (!href) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        {logo}
        {logoDark}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'focus-visible:ring-primary inline-flex items-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      {logo}
      {logoDark}
    </Link>
  );
}
