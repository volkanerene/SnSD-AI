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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useRoles } from '@/hooks/useRoles';
import { AdminUser } from '@/hooks/useUsersAdmin';

interface EditUserDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, data: any) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSave
}: EditUserDialogProps) {
  const { data: roles } = useRoles();
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    phone: user.phone || '',
    department: user.department || '',
    job_title: user.job_title || '',
    role_id: user.role_id || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='full_name'>Full Name</Label>
              <Input
                id='full_name'
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder='John Doe'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='role_id'>Role</Label>
              <Select
                value={formData.role_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='department'>Department</Label>
              <Input
                id='department'
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder='Safety & Compliance'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='job_title'>Job Title</Label>
              <Input
                id='job_title'
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                placeholder='HSE Manager'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder='+90 555 123 4567'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
