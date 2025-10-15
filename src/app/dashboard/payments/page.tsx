'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { paymentsColumns } from './columns';
import { CreatePaymentDialog } from './create-payment-dialog';
import type { PaymentStatus } from '@/types/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';

export default function PaymentsPage() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';

  const [status, setStatus] = useState<PaymentStatus | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { payments, isLoading, error } = usePayments(tenantId, {
    status,
    limit: 50
  });

  if (isLoading) {
    return (
      <div className='flex min-h-0 items-center justify-center p-4'>
        <div className='text-muted-foreground'>Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-0 items-center justify-center p-4'>
        <div className='text-destructive'>
          Error loading payments: {error.message}
        </div>
      </div>
    );
  }

  const completedPayments = payments.filter((p) => p.status === 'completed');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const failedPayments = payments.filter((p) => p.status === 'failed');

  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Payment Management
          </h2>
          <p className='text-muted-foreground'>
            Track subscriptions, invoices, and payment history
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {totalRevenue.toLocaleString('en-US', {
                style: 'currency',
                currency: completedPayments[0]?.currency || 'USD'
              })}
            </div>
            <p className='text-muted-foreground text-xs'>
              From {completedPayments.length} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Payments
            </CardTitle>
            <CreditCard className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {pendingAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: pendingPayments[0]?.currency || 'USD'
              })}
            </div>
            <p className='text-muted-foreground text-xs'>
              {pendingPayments.length} pending transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Success Rate</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {payments.length > 0
                ? ((completedPayments.length / payments.length) * 100).toFixed(
                    1
                  )
                : 0}
              %
            </div>
            <p className='text-muted-foreground text-xs'>
              {failedPayments.length} failed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Tabs defaultValue='all' className='w-full'>
        <TabsList>
          <TabsTrigger value='all'>All ({payments.length})</TabsTrigger>
          <TabsTrigger value='completed'>
            Completed ({completedPayments.length})
          </TabsTrigger>
          <TabsTrigger value='pending'>
            Pending ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value='failed'>
            Failed ({failedPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          <DataTable
            columns={paymentsColumns}
            data={payments}
            searchKey='invoice_number'
          />
        </TabsContent>

        <TabsContent value='completed' className='space-y-4'>
          <DataTable
            columns={paymentsColumns}
            data={completedPayments}
            searchKey='invoice_number'
          />
        </TabsContent>

        <TabsContent value='pending' className='space-y-4'>
          <DataTable
            columns={paymentsColumns}
            data={pendingPayments}
            searchKey='invoice_number'
          />
        </TabsContent>

        <TabsContent value='failed' className='space-y-4'>
          <DataTable
            columns={paymentsColumns}
            data={failedPayments}
            searchKey='invoice_number'
          />
        </TabsContent>
      </Tabs>

      <CreatePaymentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tenantId={tenantId}
      />
    </div>
  );
}
