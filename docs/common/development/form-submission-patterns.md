# 폼 제출 패턴

<!-- 이 파일은 form-patterns.md에서 분할됨. 2026-06-14.
     폼 시스템의 제출(onSubmit 핸들러, mutation 연동, 토스트/리다이렉트, 에러 표시/스크롤) 관련 패턴을 다룹니다.
     인덱스: [form-patterns.md](form-patterns.md) -->

[TanStack Form](https://tanstack.com/form) + Server Actions/React Query 기반의 폼 제출 패턴입니다. `onSubmit` 핸들러, 프로덕션 유틸리티(`FormErrors`, `scrollToFirstError`), 간단한 CRUD 제출, 그리고 실제 입사 지원 폼 예제를 다룹니다.

> 폼 **규칙**(필수, 위반 시 리뷰 거절)은 [forms.md](forms.md) 참조.
> 이 문서는 권장 패턴 + 복사용 예제입니다.

---

## 프로덕션 유틸리티

### FormErrors — 폼 레벨 에러 표시

폼 레벨 검증기(교차 필드 유효성 검사)의 에러를 렌더링합니다. 폼 상단에 배치하세요.

```tsx
import { FormErrors } from '@/components/ui/tanstack-form';

<form.AppForm>
  <form.Form>
    <FormErrors />
    {/* fields */}
  </form.Form>
</form.AppForm>;
```

### scrollToFirstError — 제출 실패 시 자동 스크롤

유효성 검사 에러가 있는 첫 번째 필드로 스크롤하고 포커스합니다. `onSubmitInvalid`에 연결하세요:

```tsx
import { scrollToFirstError } from '@/components/ui/tanstack-form';

const form = useAppForm({
  ...
  onSubmitInvalid: () => scrollToFirstError(),
});
```

---

## 폼 레시피 (제출)

### 간단한 CRUD 폼

```tsx
const form = useAppForm({
  defaultValues: { name: '', email: '' } as FormValues,
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    await saveToApi(value);
    toast.success('Saved!');
  }
});

const { FormTextField } = useFormFields<FormValues>();

<form.AppForm>
  <form.Form>
    <FormTextField name='name' label='Name' required validators={{ onBlur: z.string().min(2) }} />
    <FormTextField
      name='email'
      label='Email'
      required
      type='email'
      validators={{ onBlur: z.string().email() }}
    />
    <form.SubmitButton label='Save' />
  </form.Form>
</form.AppForm>;
```

### 실제 예제: 입사 지원 폼

플랫 필드, 체크박스 그룹, 날짜 선택기, 셀렉트, 파일 업로드, 프로덕션 유틸리티를 결합한 완전한 폼입니다. 파일 분할 패턴을 따릅니다:

```
src/modules/applications/
├── schemas/application.ts         ← Zod 스키마 + z.infer 타입
├── constants/application-options.ts ← Position 및 experience 옵션
├── components/application-form.tsx  ← 폼 UI
```

**스키마** (`schemas/application.ts`):

```ts
export const applicationSchema = z.object({
  firstName: z.string({ error: 'This field is required' }),
  lastName: z.string({ error: 'This field is required' }),
  email: z.email({ error: 'Please enter a valid email' }),
  'github-url': z.url({ error: 'Please enter a valid url' }).optional(),
  'linkedin-url': z.url({ error: 'Please enter a valid url' }).optional(),
  position: z.array(z.string()).min(1, 'Please select at least one item'),
  experience: z.string().min(1, 'Please select an item'),
  'available-date': z.string().min(1, 'Please select a date'),
  'cover-letter': z.string().optional(),
  'file-upload': z.union([z.file(), z.array(z.file()).nonempty(), ...]).optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
```

**폼** (`components/application-form.tsx`):

```tsx
import { applicationSchema, type ApplicationFormValues } from '../schemas/application';
import { positionOptions, experienceOptions } from '../constants/application-options';

const form = useAppForm({
  defaultValues: { ... } as ApplicationFormValues,
  validators: { onSubmit: applicationSchema },
  onSubmitInvalid: () => scrollToFirstError(),
  onSubmit: ({ value }) => { ... },
});

const { FormTextField, FormSelectField, FormTextareaField, FormFileUploadField } =
  useFormFields<ApplicationFormValues>();

// text/email/url/select/textarea/file을 위한 플랫 필드
<FormTextField name="firstName" label="First Name" required ... />

// 체크박스 그룹(position)과 날짜 선택기(available-date)를 위한 AppField
<form.AppField name="position" mode="array">...</form.AppField>
<form.AppField name="available-date">...</form.AppField>
```

전체 작동 예제는 `/dashboard/forms/application`을 참조하세요.
