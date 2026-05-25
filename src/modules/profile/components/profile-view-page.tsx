'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { profileSchema, type ProfileFormValues } from '../utils/form-schema';

const countryOptions = [
  { value: 'kr', label: '대한민국' },
  { value: 'us', label: '미국' },
  { value: 'jp', label: '일본' },
  { value: 'cn', label: '중국' }
];

const cityOptions: Record<string, { value: string; label: string }[]> = {
  kr: [
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' }
  ],
  us: [
    { value: 'nyc', label: '뉴욕' },
    { value: 'la', label: '로스앤젤레스' }
  ],
  jp: [
    { value: 'tokyo', label: '도쿄' },
    { value: 'osaka', label: '오사카' }
  ],
  cn: [
    { value: 'beijing', label: '베이징' },
    { value: 'shanghai', label: '상하이' }
  ]
};

export default function ProfileViewPage() {
  const form = useAppForm({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      contactno: 0,
      country: '',
      city: '',
      jobs: []
    } as ProfileFormValues,
    validators: {
      onSubmit: profileSchema
    },
    onSubmit: ({ value }) => {
      toast.success(`${value.firstname} ${value.lastname}님의 프로필이 저장되었습니다!`);
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<ProfileFormValues>();

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>프로필</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='space-y-1'>
              <h3 className='text-lg font-semibold'>개인 정보</h3>
              <p className='text-muted-foreground text-sm'>개인 정보를 수정하세요</p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormTextField
                name='firstname'
                label='이름'
                required
                placeholder='이름을 입력하세요'
              />
              <FormTextField name='lastname' label='성' required placeholder='성을 입력하세요' />
              <FormTextField
                name='email'
                label='이메일'
                required
                type='email'
                placeholder='이메일 주소를 입력하세요'
              />
              <FormTextField
                name='contactno'
                label='연락처'
                required
                type='number'
                placeholder='연락처를 입력하세요'
              />
              <FormSelectField
                name='country'
                label='국가'
                required
                options={countryOptions}
                placeholder='국가 선택'
              />
              <form.Subscribe
                selector={(state) => state.values.country}
                children={(country) => (
                  <FormSelectField
                    name='city'
                    label='도시'
                    required
                    options={country ? (cityOptions[country] ?? []) : []}
                    placeholder={country ? '도시 선택' : '먼저 국가를 선택하세요'}
                  />
                )}
              />
            </div>

            <div className='space-y-1'>
              <h3 className='text-lg font-semibold'>경력 사항</h3>
              <p className='text-muted-foreground text-sm'>경력 정보를 추가하세요</p>
            </div>

            <form.AppField name='jobs' mode='array'>
              {(field) => (
                <div className='space-y-4'>
                  {field.state.value.map((_, i) => (
                    <div key={i} className='rounded-lg border p-4 space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>경력 #{i + 1}</span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => field.removeValue(i)}
                        >
                          <Icons.close className='h-4 w-4' />
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {(
                          [
                            ['jobtitle', '직무', 'text', '직무를 입력하세요'],
                            ['employer', '회사명', 'text', '회사명을 입력하세요'],
                            ['jobcountry', '국가', 'select', '국가 선택'],
                            ['jobcity', '도시', 'select', '도시 선택'],
                            ['startdate', '입사일', 'text', 'YYYY-MM-DD'],
                            ['enddate', '퇴사일', 'text', 'YYYY-MM-DD']
                          ] as const
                        ).map(([name, label, type, placeholder]) =>
                          type === 'select' ? (
                            <form.AppField key={name} name={`jobs[${i}].${name}`}>
                              {(subField) => (
                                <subField.FieldSet>
                                  <subField.Field>
                                    <subField.FieldLabel htmlFor={subField.name}>
                                      {label} *
                                    </subField.FieldLabel>
                                    <Select
                                      value={subField.state.value}
                                      onValueChange={subField.handleChange}
                                      onOpenChange={(open) => {
                                        if (!open) subField.handleBlur();
                                      }}
                                    >
                                      <SelectTrigger id={subField.name}>
                                        <SelectValue placeholder={placeholder} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {countryOptions.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </subField.Field>
                                  <subField.FieldError />
                                </subField.FieldSet>
                              )}
                            </form.AppField>
                          ) : (
                            <form.AppField key={name} name={`jobs[${i}].${name}`}>
                              {(subField) => (
                                <subField.FieldSet>
                                  <subField.Field>
                                    <subField.FieldLabel htmlFor={subField.name}>
                                      {label} *
                                    </subField.FieldLabel>
                                    <Input
                                      id={subField.name}
                                      value={subField.state.value ?? ''}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) => subField.handleChange(e.target.value)}
                                      placeholder={placeholder}
                                    />
                                  </subField.Field>
                                  <subField.FieldError />
                                </subField.FieldSet>
                              )}
                            </form.AppField>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      field.pushValue({
                        jobcountry: '',
                        jobcity: '',
                        jobtitle: '',
                        employer: '',
                        startdate: '',
                        enddate: ''
                      })
                    }
                  >
                    <Icons.add className='mr-2 h-4 w-4' /> 경력 추가
                  </Button>
                </div>
              )}
            </form.AppField>

            <div className='flex justify-end'>
              <form.SubmitButton>프로필 저장</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
