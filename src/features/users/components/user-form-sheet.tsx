'use client';

import { useState } from 'react';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import type { User } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';
import { userSchema, type UserFormValues } from '../schemas/user';
import { ROLE_OPTIONS } from './users-table/options';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

interface UserFormSheetProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ user, open, onOpenChange }: UserFormSheetProps) {
  const isEdit = !!user;

  const createMutation = useMutation({
    ...createUserMutation,
    onSuccess: () => {
      toast.success('User created successfully');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('Failed to create user')
  });

  const updateMutation = useMutation({
    ...updateUserMutation,
    onSuccess: () => {
      toast.success('User updated successfully');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to update user')
  });

  const form = useAppForm({
    defaultValues: {
      id: user?.id ?? '',
      primary_team: user?.primary_team ?? '',
      secondary_team: user?.secondary_team ?? '',
      role: user?.role ?? '',
      status: user?.status ?? 'Active'
    } as UserFormValues,
    validators: {
      onSubmit: userSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: user.id, values: value });
      } else {
        await createMutation.mutateAsync(value);
      }
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<UserFormValues>();

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit User' : 'New User'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the user details below.'
              : 'Fill in the details to create a new user.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form.AppForm>
            <form.Form id='user-form-sheet' className='space-y-4'>
              <FormTextField
                name='id'
                label='User ID'
                required
                placeholder='daniel.yun'
                validators={{
                  onBlur: z.string().regex(/^[a-z0-9]+\.[a-z0-9]+$/, 'User ID must be in format <id>.<id>')
                }}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormTextField
                  name='primary_team'
                  label='1차팀'
                  required
                  placeholder='인프라팀'
                  validators={{
                    onBlur: z.string().min(1, '1차팀을 입력해주세요')
                  }}
                />
                <FormTextField
                  name='secondary_team'
                  label='2차팀'
                  required
                  placeholder='데이터센터팀'
                  validators={{
                    onBlur: z.string().min(1, '2차팀을 입력해주세요')
                  }}
                />
              </div>

              <FormSelectField
                name='role'
                label='Role'
                required
                options={ROLE_OPTIONS}
                placeholder='Select role'
                validators={{
                  onBlur: z.string().min(1, 'Please select a role')
                }}
              />

              <FormSelectField
                name='status'
                label='Status'
                required
                options={STATUS_OPTIONS}
                placeholder='Select status'
                validators={{
                  onBlur: z.string().min(1, 'Please select a status')
                }}
              />
            </form.Form>
          </form.AppForm>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='user-form-sheet' isLoading={isPending}>
            <Icons.check /> {isEdit ? 'Update User' : 'Create User'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' /> Add User
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
