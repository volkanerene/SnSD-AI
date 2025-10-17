'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAddUserToTenant,
  useRemoveUserFromTenant,
  AdminUser
} from '@/hooks/useUsersAdmin';
import { useTenants } from '@/hooks/useTenants';
import { toast } from 'sonner';

interface ManageTenantsDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTenantsDialog({
  user,
  open,
  onOpenChange
}: ManageTenantsDialogProps) {
  const { tenants, isLoading } = useTenants();
  const { mutate: addToTenant } = useAddUserToTenant();
  const { mutate: removeFromTenant } = useRemoveUserFromTenant();

  // Get user's current tenant IDs
  const userTenantId = user.tenant?.id;

  const handleToggleTenant = (
    tenantId: string,
    isCurrentlyAssigned: boolean
  ) => {
    if (isCurrentlyAssigned) {
      // Remove from tenant
      removeFromTenant(
        { userId: user.id, tenantId },
        {
          onSuccess: () => toast.success('User removed from tenant'),
          onError: (error: any) =>
            toast.error(error.message || 'Failed to remove user from tenant')
        }
      );
    } else {
      // Add to tenant
      addToTenant(
        { userId: user.id, tenantId },
        {
          onSuccess: () => toast.success('User added to tenant'),
          onError: (error: any) =>
            toast.error(error.message || 'Failed to add user to tenant')
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Manage Tenant Access - {user.full_name}</DialogTitle>
          <DialogDescription>
            Assign or remove this user from different tenants
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='bg-muted rounded-lg p-3'>
            <div className='text-sm font-medium'>{user.email}</div>
            <div className='text-muted-foreground text-sm'>
              Current Tenant: {user.tenant?.name || 'None'}
            </div>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='text-muted-foreground'>Loading tenants...</div>
            </div>
          ) : (
            <ScrollArea className='h-[300px] rounded-md border p-4'>
              <div className='space-y-4'>
                {tenants?.map((tenant) => {
                  const isAssigned = tenant.id === userTenantId;

                  return (
                    <div
                      key={tenant.id}
                      className='flex items-center justify-between space-x-4'
                    >
                      <div className='flex items-center space-x-3'>
                        <Checkbox
                          id={tenant.id}
                          checked={isAssigned}
                          onCheckedChange={() =>
                            handleToggleTenant(tenant.id, isAssigned)
                          }
                        />
                        <div className='grid gap-1.5'>
                          <label
                            htmlFor={tenant.id}
                            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                          >
                            {tenant.name}
                          </label>
                          <p className='text-muted-foreground text-sm'>
                            {tenant.subdomain}.snsdconsultant.com
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          tenant.status === 'active'
                            ? 'default'
                            : tenant.status === 'suspended'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {tenant.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
