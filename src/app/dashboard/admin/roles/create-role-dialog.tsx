'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCreateRole } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import type { Permission } from '@/hooks/usePermissions';

const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(
      /^[a-z0-9_-]+$/,
      'Slug must be lowercase with only letters, numbers, dashes, and underscores'
    ),
  description: z.string().optional(),
  level: z.number().min(0).max(10)
});

type RoleFormData = z.infer<typeof roleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoleDialog({
  open,
  onOpenChange
}: CreateRoleDialogProps) {
  const { mutateAsync: createRole, isPending } = useCreateRole();
  const { data: allPermissions, isLoading: loadingPermissions } =
    usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      level: 3
    }
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      await createRole({
        name: data.name,
        slug: data.slug,
        description: data.description,
        level: data.level,
        permissions: selectedPermissions
      });
      toast.success('Role created successfully');
      form.reset();
      setSelectedPermissions([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role');
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_');
    form.setValue('slug', slug);
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = (category: string) => {
    const categoryPermissions =
      allPermissions?.filter((p) => p.category === category).map((p) => p.id) ||
      [];

    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPermissions.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev.filter((p) => !categoryPermissions.includes(p)),
        ...categoryPermissions
      ]);
    }
  };

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
      <DialogContent className='max-h-[90vh] max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions
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
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='HSE Manager'
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
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
                    <FormLabel>Slug (Auto-generated)</FormLabel>
                    <FormControl>
                      <Input placeholder='hse_manager' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Role description...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='level'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission Level (0-10)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <p className='text-muted-foreground text-xs'>
                    Lower numbers = Higher privileges (0 = Admin)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <FormLabel>Permissions</FormLabel>
                <Badge variant='outline'>
                  {selectedPermissions.length} selected
                </Badge>
              </div>

              {loadingPermissions ? (
                <div className='flex items-center justify-center p-8'>
                  <div className='text-muted-foreground text-sm'>
                    Loading permissions...
                  </div>
                </div>
              ) : (
                <ScrollArea className='h-[300px] rounded-md border p-4'>
                  <div className='space-y-6'>
                    {Object.entries(permissionsByCategory || {}).map(
                      ([category, permissions]) => {
                        const categoryPermissionIds = permissions.map(
                          (p) => p.id
                        );
                        const allSelected = categoryPermissionIds.every((p) =>
                          selectedPermissions.includes(p)
                        );

                        return (
                          <div key={category} className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <h4 className='text-sm font-semibold capitalize'>
                                  {category.replace(/_/g, ' ')}
                                </h4>
                                <Badge variant='secondary' className='text-xs'>
                                  {permissions.length}
                                </Badge>
                              </div>
                              <Button
                                type='button'
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
                                    id={`create-perm-${permission.id}`}
                                    checked={selectedPermissions.includes(
                                      permission.id
                                    )}
                                    onCheckedChange={() =>
                                      handleTogglePermission(permission.id)
                                    }
                                  />
                                  <div className='grid gap-1.5 leading-none'>
                                    <label
                                      htmlFor={`create-perm-${permission.id}`}
                                      className='cursor-pointer text-sm leading-none font-medium'
                                    >
                                      {permission.name}
                                    </label>
                                    {permission.description && (
                                      <p className='text-muted-foreground text-xs'>
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
              )}
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
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
