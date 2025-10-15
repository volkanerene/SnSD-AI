'use client';

import { AdminDashboard } from './admin-dashboard';
import { HSEDashboard } from './hse-dashboard';
import { ContractorDashboard } from './contractor-dashboard';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface DashboardWrapperProps {
  roleId: number;
}

/**
 * Client-side wrapper that renders the appropriate dashboard based on role
 */
export function DashboardWrapper({ roleId }: DashboardWrapperProps) {
  // SNSD Admin (1) or Company Admin (2)
  if (roleId <= 2) {
    return <AdminDashboard />;
  }

  // HSE Specialist (3) or Supervisor (5)
  if (roleId === 3 || roleId === 5) {
    return <HSEDashboard />;
  }

  // Contractor Admin (4) or Worker (6)
  if (roleId === 4 || roleId === 6) {
    return <ContractorDashboard />;
  }

  // Fallback for unknown roles
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Unavailable</CardTitle>
        <CardDescription>
          No dashboard configured for your role. Please contact support.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
