'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { useAssignPermissions } from '@/hooks/useRoles';
import { toast } from 'sonner';
import type { Role } from '@/types/api';
import type { Permission } from '@/hooks/usePermissions';

interface ManagePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

export function ManagePermissionsDialog({
  open,
  onOpenChange,
  role
}: ManagePermissionsDialogProps) {
  const { data: allPermissions, isLoading } = usePermissions();
  const { mutateAsync: assignPermissions, isPending } = useAssignPermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role.permissions || []
  );

  // Update selected permissions when role changes
  useEffect(() => {
    setSelectedPermissions(role.permissions || []);
  }, [role]);

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleSelectAll = (category: string) => {
    const categoryPermissions =
      allPermissions
        ?.filter((p) => p.category === category)
        .map((p) => p.name) || [];

    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      // Deselect all from category
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPermissions.includes(p))
      );
    } else {
      // Select all from category
      setSelectedPermissions((prev) => [
        ...prev.filter((p) => !categoryPermissions.includes(p)),
        ...categoryPermissions
      ]);
    }
  };

  const handleSave = async () => {
    try {
      await assignPermissions({
        roleId: role.id,
        permissions: selectedPermissions
      });
      toast.success('Permissions updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions');
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
          </DialogHeader>
          <div className='flex items-center justify-center p-8'>
            <div className='text-muted-foreground'>Loading permissions...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Group permissions by category
  const permissionsByCategory = allPermissions?.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Manage Permissions - {role.name}</DialogTitle>
          <DialogDescription>
            Select permissions to assign to this role
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              {selectedPermissions.length} permissions selected
            </p>
            <Badge variant='outline'>Level {role.level}</Badge>
          </div>

          <ScrollArea className='h-[400px] rounded-md border p-4'>
            <div className='space-y-6'>
              {Object.entries(permissionsByCategory || {}).map(
                ([category, permissions]) => {
                  const categoryPermissionNames = permissions.map(
                    (p) => p.name
                  );
                  const allSelected = categoryPermissionNames.every((p) =>
                    selectedPermissions.includes(p)
                  );

                  return (
                    <div key={category} className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-semibold capitalize'>
                            {category.replace(/_/g, ' ')}
                          </h4>
                          <Badge variant='secondary' className='text-xs'>
                            {permissions.length}
                          </Badge>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleSelectAll(category)}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className='grid gap-2 pl-6'>
                        {permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className='flex items-start space-x-3'
                          >
                            <Checkbox
                              id={permission.name}
                              checked={selectedPermissions.includes(
                                permission.name
                              )}
                              onCheckedChange={() =>
                                handleTogglePermission(permission.name)
                              }
                            />
                            <div className='grid gap-1.5 leading-none'>
                              <label
                                htmlFor={permission.name}
                                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                              >
                                {permission.name}
                              </label>
                              {permission.description && (
                                <p className='text-muted-foreground text-sm'>
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
