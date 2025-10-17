import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PermissionProvider } from '@/contexts/PermissionProvider.client';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <PermissionProvider>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen} className='h-screen'>
          <AppSidebar />
          <SidebarInset className='flex flex-col overflow-hidden'>
            <Header />
            <ImpersonationBanner />
            {/* page main content */}
            <div className='flex-1 overflow-y-auto'>{children}</div>
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </PermissionProvider>
  );
}
