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
import { createSubnetMutation, updateSubnetMutation } from '../api/mutations';
import { toast } from 'sonner';
import { z } from 'zod';
import { Subnet } from '../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SUBNET_PURPOSE_OPTIONS = [
  { value: '서비스-PM', label: '서비스-PM' },
  { value: '서비스-VM', label: '서비스-VM' },
  { value: 'OOB', label: 'OOB' },
  { value: '백업', label: '백업' },
  { value: 'H-B', label: 'H-B' },
  { value: 'NAS', label: 'NAS' }
];

const CENTER_OPTIONS = ['상암', '야탑', '죽전', 'AI센터'] as const;

const subnetFormSchema = z.object({
  network: z.string().min(1, '네트워크 주소는 필수입니다'),
  description: z.string().optional(),
  vlanId: z.string().optional(),
  purpose: z.string().optional(),
  centers: z.array(z.string())
});

type SubnetFormValues = z.infer<typeof subnetFormSchema>;

interface SubnetFormSheetProps {
  subnet?: Subnet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubnetFormSheet({ subnet, open, onOpenChange }: SubnetFormSheetProps) {
  const isEdit = !!subnet;

  const createMutation = useMutation({
    ...createSubnetMutation,
    onSuccess: () => {
      toast.success('서브넷이 생성되었습니다');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('서브넷 생성 실패')
  });

  const updateMutation = useMutation({
    ...updateSubnetMutation,
    onSuccess: () => {
      toast.success('서브넷이 수정되었습니다');
      onOpenChange(false);
    },
    onError: () => toast.error('서브넷 수정 실패')
  });

  const form = useAppForm({
    defaultValues: {
      network: subnet?.network ?? '',
      description: subnet?.description ?? '',
      vlanId: subnet?.vlanId ?? '',
      purpose: subnet?.purpose ?? '',
      centers: subnet?.centers ?? []
    } as SubnetFormValues,
    validators: {
      onSubmit: subnetFormSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: subnet.id, ...value });
      } else {
        await createMutation.mutateAsync(value);
      }
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<SubnetFormValues>();

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? '서브넷 수정' : '서브넷 추가'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '서브넷 정보를 수정합니다.' : '새로운 서브넷을 등록합니다.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form.AppForm>
            <form.Form id='subnet-form-sheet' className='space-y-4'>
              <FormTextField
                name='network'
                label='CIDR'
                required
                placeholder='192.168.1.0/24'
              />
              <FormTextField
                name='description'
                label='설명'
                placeholder='서브넷 용도 설명'
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormTextField
                  name='vlanId'
                  label='VLAN ID'
                  placeholder='100'
                />
                <FormSelectField
                  name='purpose'
                  label='용도'
                  options={SUBNET_PURPOSE_OPTIONS}
                  placeholder='선택하세요'
                />
              </div>

              <form.AppField name='centers'>
                {(field) => (
                  <div className='space-y-2'>
                    <Label>센터 (중복 선택 가능)</Label>
                    <div className='flex flex-wrap gap-3'>
                      {CENTER_OPTIONS.map((center) => (
                        <label key={center} className='flex items-center gap-2'>
                          <Checkbox
                            checked={field.state.value.includes(center)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.setValue([...field.state.value, center]);
                              } else {
                                field.setValue(field.state.value.filter((v: string) => v !== center));
                              }
                            }}
                          />
                          <span className='text-sm'>{center}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </form.AppField>
            </form.Form>
          </form.AppForm>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type='submit' form='subnet-form-sheet' isLoading={isPending}>
            <Icons.check /> {isEdit ? '수정' : '생성'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function SubnetFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' /> 서브넷 추가
      </Button>
      <SubnetFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
