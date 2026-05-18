# 폼 시스템 — Cheat Sheet

> 빠른 참조용. 전체 가이드는 [forms/guide.md](./guide.md) 참조.
## 필수 임포트

```typescript
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import * as z from 'zod';
```

## 표준 패턴 (권장: 패턴 1)

```typescript
const schema = z.object({ name: z.string().min(2) });
type FormValues = z.infer<typeof schema>; // 항상 z.infer 사용

const form = useAppForm({
  defaultValues: { name: '' } as FormValues,
  validators: { onSubmit: schema },
  onSubmit: ({ value }) => { /* ... */ },
});

const { FormTextField, FormSelectField } = useFormFields<FormValues>();
```

## 필드 종류

`FormTextField`(text/email/password/number), `FormTextareaField`, `FormSelectField`, `FormCheckboxField`, `FormSwitchField`, `FormRadioGroupField`, `FormSliderField`, `FormFileUploadField`

## 유효성 검사

`onBlur`(필수/형식, 권장), `onChangeAsync`(서버 고유성, debounce), `onSubmit`(최종)

## 금지사항
- ❌ `AppField` render props 내에서 `useState` 사용
- ❌ `FormValues` 수동 타이핑 → `z.infer<typeof schema>` 사용
- ❌ `SubmitButton` 직접 구현 → `form.SubmitButton` 사용
- ❌ 컴포넌트 내 `useMutation` 인라인 정의
## SubmitButton

```typescript
<form.SubmitButton label='Save' /> // 자동 로딩/비활성화 처리
```

## 외부 제출 버튼 (Sheet/Dialog)

```typescript
<form.Form id="sheet-form">...</form.Form>
<Button type="submit" form="sheet-form">Save</Button>
```
