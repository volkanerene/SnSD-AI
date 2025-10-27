'use client';

import { useState } from 'react';
import { useTenants } from '@/hooks/useTenants';
import { DataTable } from '@/components/ui/data-table';
import { tenantsColumns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  subdomain: z.string().min(2, 'Subdomain must be at least 2 characters'),
  contact_email: z.string().email('Invalid email'),
  contact_phone: z.string().optional(),
  license_plan: z.enum(['basic', 'professional', 'enterprise']),
  modules_enabled: z.array(z.string()).min(1, 'Select at least one module')
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function TenantsManagementPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    tenants,
    isLoading,
    error,
    createTenantAsync,
    isCreating,
    activateTenant,
    suspendTenant,
    deleteTenant
  } = useTenants();

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      slug: '',
      subdomain: '',
      contact_email: '',
      contact_phone: '',
      license_plan: 'basic',
      modules_enabled: ['evren_gpt']
    }
  });

  const onSubmit = async (data: TenantFormData) => {
    try {
      await createTenantAsync({
        name: data.name,
        slug: data.slug,
        subdomain: data.subdomain,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        license_plan: data.license_plan,
        modules_enabled: JSON.stringify(data.modules_enabled),
        max_users: 9999,
        max_contractors: 9999,
        max_video_requests_monthly: 9999,
        status: 'active'
      });
      toast.success('Tenant created successfully');
      form.reset();
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tenant');
    }
  };

  const handleActivate = (tenantId: string) => {
    activateTenant(tenantId, {
      onSuccess: () => toast.success('Tenant activated'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to activate tenant')
    });
  };

  const handleSuspend = (tenantId: string) => {
    suspendTenant(tenantId, {
      onSuccess: () => toast.success('Tenant suspended'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to suspend tenant')
    });
  };

  const handleDelete = (tenantId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this tenant? This will set its status to inactive.'
      )
    ) {
      return;
    }
    deleteTenant(tenantId, {
      onSuccess: () => toast.success('Tenant deleted successfully'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to delete tenant')
    });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='text-muted-foreground'>Loading tenants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='text-destructive'>
          Error loading tenants: {error.message}
        </div>
      </div>
    );
  }

  const activeTenants = tenants.filter((t) => t.status === 'active');
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended');
  const inactiveTenants = tenants.filter((t) => t.status === 'inactive');

  return (
    <div className='space-y-6 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Tenants Management
          </h2>
          <p className='text-muted-foreground'>
            Manage tenant organizations, subscriptions, and access controls
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size='lg'>
          <Plus className='mr-2 h-5 w-5' />
          Add Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Tenants</CardTitle>
            <Building2 className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{tenants.length}</div>
            <p className='text-muted-foreground text-xs'>
              Registered organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <CheckCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {activeTenants.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Suspended</CardTitle>
            <AlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {suspendedTenants.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              Temporarily disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inactive</CardTitle>
            <XCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {inactiveTenants.length}
            </div>
            <p className='text-muted-foreground text-xs'>Not operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <DataTable
        columns={tenantsColumns}
        data={tenants}
        searchKey='name'
        meta={{
          onActivate: handleActivate,
          onSuspend: handleSuspend,
          onDelete: handleDelete
        }}
      />

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Create a new tenant organization
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder='SOCAR Turkey' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='socar' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4'>
                <FormField
                  control={form.control}
                  name='subdomain'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='socar.snsdconsultant.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='contact_email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='admin@acme.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contact_phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='+1 (555) 123-4567' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='license_plan'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select plan' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='basic'>Basic</SelectItem>
                        <SelectItem value='professional'>
                          Professional
                        </SelectItem>
                        <SelectItem value='enterprise'>Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='modules_enabled'
                render={() => (
                  <FormItem>
                    <div className='mb-2'>
                      <FormLabel>Enabled Modules</FormLabel>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Select modules to enable for this tenant
                      </p>
                    </div>
                    <div className='space-y-2'>
                      {[
                        { id: 'evren_gpt', label: 'EvrenGPT' },
                        { id: 'marcel_gpt', label: 'MarcelGPT' },
                        { id: 'safety_bud', label: 'SafetyBud' }
                      ].map((module) => (
                        <FormField
                          key={module.id}
                          control={form.control}
                          name='modules_enabled'
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={module.id}
                                className='flex flex-row items-start space-y-0 space-x-3'
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(module.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            module.id
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== module.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className='cursor-pointer text-sm font-normal'>
                                  {module.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='bg-muted rounded-md p-3'>
                <h4 className='mb-2 text-sm font-semibold'>
                  Default Limits (Auto-Set):
                </h4>
                <ul className='text-muted-foreground space-y-1 text-xs'>
                  <li>• Max Users: 9999 (unlimited)</li>
                  <li>• Max Contractors: 9999 (unlimited)</li>
                  <li>• Max Video Requests Monthly: 9999 (unlimited)</li>
                  <li>• Status: Active</li>
                </ul>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Tenant'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
