'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfile } from '@/hooks/useProfile';
import {
  useCurrentSubscription,
  useUsageTracking,
  useSubscriptionTiers
} from '@/hooks/useSubscriptionTiers';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Users,
  FileText,
  Building
} from 'lucide-react';

export default function SubscriptionPage() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id;

  const { data: subscription, isLoading: subLoading } =
    useCurrentSubscription(tenantId);
  const { data: usage, isLoading: usageLoading } = useUsageTracking(tenantId);
  const { data: tiers } = useSubscriptionTiers(true);

  if (subLoading || usageLoading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='flex items-center justify-center p-8'>
          <div className='text-muted-foreground'>
            Loading subscription details...
          </div>
        </div>
      </div>
    );
  }

  if (!subscription || !usage) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground'>
              No active subscription found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tier = subscription.tier;
  const usagePercent = {
    users: tier?.max_users ? (usage.users_count / tier.max_users) * 100 : 0,
    evaluations: tier?.max_evaluations_per_month
      ? (usage.evaluations_count / tier.max_evaluations_per_month) * 100
      : 0,
    contractors: tier?.max_contractors
      ? (usage.contractors_count / tier.max_contractors) * 100
      : 0
  };

  return (
    <div className='space-y-8 p-8 pt-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Subscription & Usage
        </h1>
        <p className='text-muted-foreground mt-2'>
          View your current plan and resource usage
        </p>
      </div>

      {/* Current Plan */}
      <Card className='border-l-4 border-l-blue-500'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <CreditCard className='h-8 w-8 text-blue-600' />
              <div>
                <CardTitle>{tier?.display_name}</CardTitle>
                <CardDescription>{tier?.description}</CardDescription>
              </div>
            </div>
            <Badge
              className={
                subscription.status === 'active'
                  ? 'bg-green-100 px-4 py-1 text-lg text-green-800 hover:bg-green-100'
                  : 'bg-gray-100 px-4 py-1 text-lg text-gray-800 hover:bg-gray-100'
              }
            >
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-muted-foreground text-sm'>Billing Cycle</p>
              <p className='text-2xl font-bold capitalize'>
                {subscription.billing_cycle || 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Price</p>
              <p className='text-2xl font-bold'>
                $
                {subscription.billing_cycle === 'yearly'
                  ? tier?.price_yearly?.toFixed(2)
                  : tier?.price_monthly?.toFixed(2)}
                /{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
              </p>
            </div>
            {subscription.ends_at && (
              <div>
                <p className='text-muted-foreground text-sm'>Renewal Date</p>
                <p className='text-lg font-semibold'>
                  {new Date(subscription.ends_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Users */}
        <Card className='border-l-4 border-l-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base'>Users</CardTitle>
            <Users className='h-5 w-5 text-purple-600' />
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-2xl font-bold'>{usage.users_count}</span>
              <span className='text-muted-foreground'>
                / {tier?.max_users === null ? '∞' : tier?.max_users}
              </span>
            </div>
            {tier?.max_users && (
              <Progress value={usagePercent.users} className='h-2' />
            )}
            <p className='text-muted-foreground text-xs'>
              {tier?.max_users
                ? Math.round(100 - usagePercent.users)
                : 'Unlimited'}{' '}
              {tier?.max_users && '%'} available
            </p>
          </CardContent>
        </Card>

        {/* Evaluations */}
        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base'>
              Evaluations (This Month)
            </CardTitle>
            <FileText className='h-5 w-5 text-green-600' />
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-2xl font-bold'>
                {usage.evaluations_count}
              </span>
              <span className='text-muted-foreground'>
                /{' '}
                {tier?.max_evaluations_per_month === null
                  ? '∞'
                  : tier?.max_evaluations_per_month}
              </span>
            </div>
            {tier?.max_evaluations_per_month && (
              <Progress value={usagePercent.evaluations} className='h-2' />
            )}
            <p className='text-muted-foreground text-xs'>
              {tier?.max_evaluations_per_month
                ? Math.round(100 - usagePercent.evaluations)
                : 'Unlimited'}{' '}
              {tier?.max_evaluations_per_month && '%'} remaining
            </p>
          </CardContent>
        </Card>

        {/* Contractors */}
        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base'>Contractors</CardTitle>
            <Building className='h-5 w-5 text-orange-600' />
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-2xl font-bold'>
                {usage.contractors_count}
              </span>
              <span className='text-muted-foreground'>
                / {tier?.max_contractors === null ? '∞' : tier?.max_contractors}
              </span>
            </div>
            {tier?.max_contractors && (
              <Progress value={usagePercent.contractors} className='h-2' />
            )}
            <p className='text-muted-foreground text-xs'>
              {tier?.max_contractors
                ? Math.round(100 - usagePercent.contractors)
                : 'Unlimited'}{' '}
              {tier?.max_contractors && '%'} available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 md:grid-cols-2'>
            {Object.entries(tier?.features || {}).map(([key, value]) => (
              <div key={key} className='flex items-center gap-2'>
                {value ? (
                  <CheckCircle2 className='h-5 w-5 text-green-600' />
                ) : (
                  <XCircle className='h-5 w-5 text-gray-400' />
                )}
                <span className='capitalize'>{key.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className='mb-4 text-2xl font-bold'>Available Plans</h2>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {tiers?.map((t) => (
            <Card
              key={t.id}
              className={tier?.id === t.id ? 'border-primary border-2' : ''}
            >
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  {t.display_name}
                  {tier?.id === t.id && (
                    <Badge variant='secondary'>Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='text-3xl font-bold'>
                    ${t.price_monthly?.toFixed(0)}
                    <span className='text-muted-foreground text-sm'>/mo</span>
                  </div>
                  <ul className='space-y-1 text-sm'>
                    <li>
                      {t.max_users === null ? 'Unlimited' : t.max_users} users
                    </li>
                    <li>
                      {t.max_evaluations_per_month === null
                        ? 'Unlimited'
                        : t.max_evaluations_per_month}{' '}
                      evaluations/mo
                    </li>
                    <li>
                      {t.max_contractors === null
                        ? 'Unlimited'
                        : t.max_contractors}{' '}
                      contractors
                    </li>
                    <li>{t.max_storage_gb} GB storage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
