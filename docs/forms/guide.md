# 폼 시스템

[TanStack Form](https://tanstack.com/form) + shadcn/ui 기반의 타입 세이프, 조합 가능한 폼 처리 시스템입니다. 간단한 CRUD 폼, 다중 단계 위저드, 시트/다이얼로그 폼, 동적 배열, 중첩 객체, 비동기 유효성 검사, 연결된 필드, 교차 필드 유효성 검사를 지원합니다.

---

## 목차

- [아키텍처](#아키텍처)
- [빠른 시작](#빠른-시작)
- [사용 패턴](#사용-패턴)
  - [패턴 1: useFormFields — 타입 세이프 플랫 필드 (권장)](#패턴-1-useformfields----타입-세이프-플랫-필드-권장)
  - [패턴 2: form.AppField 렌더 프롭 — 완전한 제어](#패턴-2-formappfield-렌더-프롭--완전한-제어)
  - [패턴 3: 직접 임포트 — 타입 안전 없음, 보일러플레이트 제로](#패턴-3-직접-임포트--타입-안전-없음-보일러플레이트-제로)
  - [어느 것을 사용할지](#어느-것을-사용할지)
- [사용 가능한 필드 컴포넌트](#사용-가능한-필드-컴포넌트)
- [유효성 검사](#유효성-검사)
  - [권장 전략: 필드 레벨 + 폼 레벨](#권장-전략-필드-레벨--폼-레벨)
  - [검증기 타이밍](#검증기-타이밍)
  - [Zod 스키마 vs 함수](#zod-스키마-vs-함수)
  - [비동기 유효성 검사](#비동기-유효성-검사)
  - [연결된 / 의존적 필드 유효성 검사](#연결된--의존적-필드-유효성-검사)
  - [교차 필드 (폼 레벨) 유효성 검사](#교차-필드-폼-레벨-유효성-검사)
  - [에러 표시](#에러-표시)
- [리스너 (사이드 이펙트)](#리스너-사이드-이펙트)
- [폼 레시피](#폼-레시피)
  - [간단한 CRUD 폼](#간단한-crud-폼)
  - [시트 또는 다이얼로그 내 폼](#시트-또는-다이얼로그-내-폼)
  - [다중 단계 위저드](#다중-단계-위저드)
  - [중첩 객체 필드](#중첩-객체-필드)
  - [동적 배열 행](#동적-배열-행)
  - [의존적 드롭다운 (국가 → 주)](#의존적-드롭다운-국가--주)
  - [비밀번호 확인 (연결된 필드)](#비밀번호-확인-연결된-필드)
- [프로덕션 유틸리티](#프로덕션-유틸리티)
  - [FormErrors — 폼 레벨 에러 표시](#formerrors--폼-레벨-에러-표시)
  - [scrollToFirstError — 제출 실패 시 자동 스크롤](#scrolltofirsterror--제출-실패-시-자동-스크롤)
- [새 필드 타입 추가하기](#새-필드-타입-추가하기)
- [타입 안전성 참조](#타입-안전성-참조)
- [익스포트 참조](#익스포트-참조)
- [대시보드 예제](#대시보드-예제)

---

## 아키텍처

```
form-context.tsx             fields/*.tsx
(contexts, structural        (TextField, FormTextField,
 components, createFormField, SelectField, FormSelectField,
 FieldConfig types,           ... base + composed exports)
 typedField, FormErrors,            │
 scrollToFirstError)                │
      ▲                             │
      │                             │
      └─────── tanstack-form.tsx ───┘
               (useAppForm, useFormFields,
                Form, SubmitButton, StepButton,
                withForm, withFieldGroup)
```

**의존성 규칙:** `fields/*.tsx`는 `form-context.tsx`에서 임포트합니다. `tanstack-form.tsx`는 양쪽에서 임포트합니다. `form-context.tsx`도 `fields/*.tsx`도 `tanstack-form.tsx`에서 임포트하지 않습니다 — 순환 의존성이 없습니다.

**주요 파일:**

| 파일                                    | 제공하는 것                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/form-context.tsx`    | 공유 프리미티브 — 컨텍스트, `useFieldContext`, 구조적 컴포넌트 (`FormFieldSet`, `FormField`, `FormFieldError`), `createFormField`, `FieldConfig` 타입, `typedField`, `FormErrors`, `scrollToFirstError` |
| `src/components/ui/tanstack-form.tsx`   | 메인 진입점 — `useAppForm`, `useFormFields`, `Form`, `SubmitButton`, `StepButton`, `withForm`, `withFieldGroup`                                                                                         |
| `src/components/forms/fields/*.tsx`     | 8개의 필드 컴포넌트, 각각 베이스 (`TextField`)와 조합된 (`FormTextField`) 변형을 export                                                                                                                 |
| `src/components/forms/fields/index.tsx` | 모든 필드에 대한 배럴 re-export                                                                                                                                                                         |

---

## 파일 구조 (기능별)

모든 폼 기능은 **스키마**, **상수**, **컴포넌트**로 분리해야 합니다:

```
src/modules/products/
├── schemas/
│   └── product.ts              ← Zod 스키마 + 추론된 FormValues 타입
├── constants/
│   └── product-options.ts      ← Select 옵션, enum, 정적 데이터
├── components/
│   ├── product-form.tsx         ← 폼 UI (스키마 + 옵션 임포트)
│   └── product-form-fields.tsx  ← 선택 사항: 큰 폼을 위한 섹션
```

**분리하는 이유:**

| 관심사     | 파일                           | 이점                                                                                 |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| **스키마** | `schemas/product.ts`           | API 라우트, 서버 액션, 데이터 테이블, 테스트에서 재사용 가능 — `'use client'` 불필요 |
| **타입**   | `schemas/product.ts`           | `ProductFormValues`를 폼, API, 리스트 컴포넌트에서 사용 — 단일 진실 공급원           |
| **옵션**   | `constants/product-options.ts` | 폼 select, 테이블 필터, 검색 패싯 간 공유                                            |
| **폼 UI**  | `components/product-form.tsx`  | 순수 UI — 깔끔하게 열리며, 유효성 검사 로직이 섞이지 않음                            |

**스키마 파일 예제:**

```ts
// src/modules/products/schemas/product.ts
import * as z from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number({ message: 'Price is required' }),
  description: z.string().min(10, 'Description must be at least 10 characters.')
});

// Always prefer z.infer — guarantees the type matches the schema exactly.
// Manual types drift when the schema has unions, optionals, or refinements.
export type ProductFormValues = z.infer<typeof productSchema>;
```

> **경험 법칙:** `z.infer<typeof schema>`를 폼 값 타입으로 사용하세요. 폼의 런타임 값 형태가 스키마 출력과 진정으로 다를 경우에만 (예: 업로드 후 `string`으로 저장되는 `File[]` 필드) 개별 필드를 `Omit & { ... }`로 재정의하세요.

**폼 컴포넌트가 스키마를 임포트:**

```tsx
// src/modules/products/components/product-form.tsx
import { productSchema, type ProductFormValues } from '@/modules/products/schemas/product';
import { categoryOptions } from '@/modules/products/constants/product-options';

const form = useAppForm({
  defaultValues: { ... } as ProductFormValues,
  validators: { onSubmit: productSchema },
  ...
});

const { FormTextField, FormSelectField } = useFormFields<ProductFormValues>();
```

**동일한 스키마를 API 라우트에서 재사용:**

```ts
// src/app/api/products/route.ts
import { productSchema } from '@/modules/products/schemas/product';

export async function POST(req: Request) {
  const body = await req.json();
  const data = productSchema.parse(body);  // same validation, zero duplication
  ...
}
```

### 폼이 커질 때

필드가 15개 이상인 폼의 경우, UI를 섹션 컴포넌트로 분할하세요:

```
components/
├── product-form.tsx              ← 메인 폼 (useAppForm, 레이아웃, 제출)
├── product-basic-fields.tsx      ← 섹션: name, category, price
├── product-media-fields.tsx      ← 섹션: image upload
└── product-detail-fields.tsx     ← 섹션: description, tags, metadata
```

각 섹션은 `useFormFields`에서 타입이 지정된 필드를 props로 받거나 직접 `useFormFields`를 호출합니다.

---

## 빠른 시작

```tsx
'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email')
});

type FormValues = z.infer<typeof schema>;

export default function MyForm() {
  const form = useAppForm({
    defaultValues: { name: '', email: '' } as FormValues,
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => console.log(value)
  });

  const { FormTextField } = useFormFields<FormValues>();

  return (
    <form.AppForm>
      <form.Form>
        <FormTextField
          name='name'
          label='Name'
          required
          validators={{ onBlur: z.string().min(2, 'Name is required') }}
        />
        <FormTextField
          name='email'
          label='Email'
          required
          type='email'
          validators={{ onBlur: z.string().email('Invalid email') }}
        />
        <form.SubmitButton label='Save' />
      </form.Form>
    </form.AppForm>
  );
}
```

---

## 사용 패턴

### 패턴 1: `useFormFields` — 타입 세이프 플랫 필드 (권장)

자동 완성이 되는 타입 세이프 필드 이름. 간결함. validators, listeners, `mode`, `defaultValue` 지원. **대부분의 폼에 사용하세요.**

```tsx
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';

type FormValues = { name: string; email: string; category: string };

const form = useAppForm({
  defaultValues: { name: '', email: '', category: '' } as FormValues,
  validators: { onSubmit: schema },
  onSubmit: ({ value }) => { ... },
});

const { FormTextField, FormSelectField } = useFormFields<FormValues>();

<FormTextField name="email" label="Email" required />     // ✅ 자동 완성
<FormTextField name="typo" label="Oops" />                // ❌ TypeScript 에러
```

**모든 `FormXxxField`에서 사용 가능한 Props:**

| Prop               | 타입                                               | 설명                                                                     |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `name`             | `DeepKeys<T>` (`useFormFields` 경유) 또는 `string` | 필드 경로                                                                |
| `validators`       | `FieldValidatorConfig`                             | `onBlur`, `onChange`, `onChangeAsync`, `onSubmit`, `onChangeListenTo` 등 |
| `asyncDebounceMs`  | `number`                                           | 모든 비동기 검증기에 대한 기본 debounce                                  |
| `listeners`        | `FieldListenerConfig`                              | `onChange`, `onBlur`, `onMount`, `onSubmit` + debounce 옵션              |
| `mode`             | `'value' \| 'array'`                               | 배열 필드에 `'array'` 설정                                               |
| `defaultValue`     | `unknown`                                          | 동적으로 추가된 필드의 초기값                                            |
| ...component props | 다양함                                             | `label`, `required`, `placeholder`, `options` 등                         |

### 패턴 2: `form.AppField` 렌더 프롭 — 완전한 제어

타입 세이프 이름 (네이티브 TanStack Form). 전체 필드 API 접근. **커스텀 필드, 배열 필드, 사전 빌드된 컴포넌트에 맞지 않는 모든 UI에 사용하세요.**

```tsx
<form.AppField
  name='framework' // ✅ 타입 세이프
  validators={{ onBlur: z.string().min(1, 'Required') }}
>
  {(field) => (
    <field.FieldSet>
      <field.Field>
        <field.FieldLabel>Framework *</field.FieldLabel>
        <MyCombobox
          value={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
        />
      </field.Field>
      <field.FieldError />
    </field.FieldSet>
  )}
</form.AppField>
```

**렌더 프롭 내에서 사용 가능한 컴포넌트 (`field.XxxField`):**

| 컴포넌트                 | 목적                                               |
| ------------------------ | -------------------------------------------------- |
| `field.FieldSet`         | 래퍼 — 고유 접근성 ID 생성                         |
| `field.Field`            | 컨테이너 — `aria-invalid`, `aria-describedby` 연결 |
| `field.FieldLabel`       | 필드에 연결된 `<label>`                            |
| `field.FieldError`       | 유효성 검사 에러 렌더링 (터치 또는 제출 후 표시)   |
| `field.FieldContent`     | 레이블 + 설명을 위한 Flex 컨테이너 (가로 레이아웃) |
| `field.FieldDescription` | 필드 아래의 도움말 텍스트                          |
| `field.TextField`        | 사전 빌드된 텍스트 입력                            |
| `field.TextareaField`    | 사전 빌드된 텍스트 영역                            |
| `field.SelectField`      | 사전 빌드된 셀렉트                                 |
| `field.CheckboxField`    | 사전 빌드된 체크박스                               |
| `field.SwitchField`      | 사전 빌드된 스위치                                 |
| `field.RadioGroupField`  | 사전 빌드된 라디오 그룹                            |
| `field.SliderField`      | 사전 빌드된 슬라이더                               |
| `field.FileUploadField`  | 사전 빌드된 파일 업로더                            |

**필드 API (`field.state`, `field.handleChange` 등):**

| Property/Method                       | 설명                                  |
| ------------------------------------- | ------------------------------------- |
| `field.state.value`                   | 현재 필드 값                          |
| `field.state.meta.isTouched`          | 사용자가 상호작용했는지 여부          |
| `field.state.meta.isDirty`            | 값이 기본값과 다른지 여부             |
| `field.state.meta.isValid`            | 유효성 검사 에러가 없는지 여부        |
| `field.state.meta.isValidating`       | 비동기 유효성 검사 진행 중 여부       |
| `field.state.meta.errors`             | 에러 메시지 배열                      |
| `field.handleChange(value)`           | 필드 값 업데이트                      |
| `field.handleBlur()`                  | 터치 표시 + onBlur 유효성 검사 트리거 |
| `field.pushValue(item)`               | 배열 모드: 항목 추가                  |
| `field.removeValue(index)`            | 배열 모드: 항목 제거                  |
| `field.swapValues(a, b)`              | 배열 모드: 항목 교환                  |
| `field.insertValue(index, item)`      | 배열 모드: 인덱스에 삽입              |
| `field.form.setFieldValue(name, val)` | 다른 필드의 값 설정                   |
| `field.form.getFieldValue(name)`      | 다른 필드의 값 읽기                   |

### 패턴 3: 직접 임포트 — 타입 안전 없음, 보일러플레이트 제로

```tsx
import { FormTextField } from '@/components/forms/fields';

<FormTextField name='name' label='Name' />; // name은 `string` — 타입 체크 없음
```

### 어느 것을 사용할지

| 시나리오                                        | 패턴       | 이유                                       |
| ----------------------------------------------- | ---------- | ------------------------------------------ |
| 표준 필드 (텍스트, 셀렉트, 체크박스 등)         | **패턴 1** | 타입 세이프 + 간결함                       |
| 커스텀 일회성 필드 (date picker, OTP, combobox) | **패턴 2** | 전체 필드 API 접근                         |
| 커스텀 행 레이아웃이 있는 배열 필드             | **패턴 2** | `pushValue`, `removeValue`, 하위 필드 필요 |
| 조합된 컴포넌트를 사용하는 배열 필드            | **패턴 1** | `mode="array"` 전달                        |
| 다중 단계 폼 단계                               | **패턴 2** | `group.AppField` + `field.TextField`       |
| 연결된 필드 유효성 검사 (`onChangeListenTo`)    | **패턴 2** | 검증기에서 `fieldApi` 필요                 |
| 빠른 프로토타입 / 동적 필드 이름                | **패턴 3** | 가장 빠름                                  |

---

## 사용 가능한 필드 컴포넌트

각 필드에는 두 가지 변형이 있습니다:

| 베이스 (렌더 프롭용) | 조합형 (플랫 사용용)  | 입력 타입                                |
| -------------------- | --------------------- | ---------------------------------------- |
| `TextField`          | `FormTextField`       | Text, email, password, tel, url, number  |
| `TextareaField`      | `FormTextareaField`   | 선택적 문자 카운트가 있는 여러 줄 텍스트 |
| `SelectField`        | `FormSelectField`     | 단일 값 드롭다운 (`options` prop)        |
| `CheckboxField`      | `FormCheckboxField`   | 레이블이 있는 불리언 체크박스            |
| `SwitchField`        | `FormSwitchField`     | 레이블 + 설명이 있는 토글 스위치         |
| `RadioGroupField`    | `FormRadioGroupField` | 라디오 버튼 그룹 (`options` prop)        |
| `SliderField`        | `FormSliderField`     | 최소/최대 표시가 있는 범위 슬라이더      |
| `FileUploadField`    | `FormFileUploadField` | 드래그 앤 드롭 파일 업로드               |

**TextField**는 `type` prop을 지원합니다: `'text'`, `'email'`, `'password'`, `'tel'`, `'url'`, `'number'`. 비동기 유효성 검사 중에 스피너를 표시합니다.

---

## 유효성 검사

### 권장 전략: 필드 레벨 + 폼 레벨

```
┌─────────────────────────────────────────────────────┐
│  onBlur (필드 레벨)    → 탭 시 즉시 피드백            │
│  onChangeAsync (필드)  → 서버 확인 (debounced)       │
│  onSubmit (폼 레벨)    → 만능 안전망                   │
└─────────────────────────────────────────────────────┘
```

### 검증기 타이밍

| Validator       | 실행 시점                  | 사용 대상                   |
| --------------- | -------------------------- | --------------------------- |
| `onChange`      | 키 입력마다                | 즉시 피드백 (절제하여 사용) |
| `onBlur`        | 필드가 포커스를 잃을 때    | 필수 확인, 형식 유효성 검사 |
| `onChangeAsync` | 키 입력 시 debounce 후     | 서버 측 고유성 확인         |
| `onBlurAsync`   | 포커스 이탈 시 debounce 후 | 비용이 큰 서버 유효성 검사  |
| `onSubmit`      | 폼 제출 시                 | 최종 만능 검사              |
| `onMount`       | 필드 마운트 시             | 사전 유효성 검사            |

### Zod 스키마 vs 함수

```tsx
// Zod 스키마 — StandardSchemaV1, 어댑터 불필요 (Zod v4)
validators={{ onBlur: z.string().email('Invalid email') }}

// 동기 함수 — 에러 문자열 또는 undefined 반환
validators={{
  onChange: ({ value }) => value.length < 3 ? 'Too short' : undefined,
}}

// 비동기 함수 — 취소를 위한 AbortSignal 지원
validators={{
  onChangeAsync: async ({ value, signal }) => {
    const res = await fetch(`/api/check?q=${value}`, { signal });
    const { ok } = await res.json();
    return ok ? undefined : 'Already taken';
  },
  onChangeAsyncDebounceMs: 500,
}}
```

### 비동기 유효성 검사

```tsx
<FormTextField
  name='username'
  label='Username'
  validators={{
    onBlur: z.string().min(3, 'Too short'),
    onChangeAsync: async ({ value }: { value: string }) => {
      if (!value || value.length < 3) return undefined;
      await new Promise((r) => setTimeout(r, 500)); // simulated API
      if (value === 'admin') return 'Username is taken';
      return undefined;
    },
    onChangeAsyncDebounceMs: 500
  }}
/>
```

`TextField`는 `isValidating`이 true일 때 자동으로 스피너를 표시합니다.

### 연결된 / 의존적 필드 유효성 검사

다른 필드가 변경될 때 유효성 검사를 다시 실행하려면 `onChangeListenTo`를 사용하세요:

```tsx
<form.AppField
  name='confirmPassword'
  validators={{
    onChangeListenTo: ['password'],
    onChange: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue('password');
      return value !== password ? 'Passwords do not match' : undefined;
    }
  }}
>
  {(field) => <field.TextField label='Confirm Password' type='password' />}
</form.AppField>
```

### 교차 필드 (폼 레벨) 유효성 검사

여러 필드에 걸친 유효성 검사에는 폼 레벨 검증기를 사용하세요:

```tsx
const form = useAppForm({
  defaultValues: { ... },
  validators: {
    onSubmit: fullZodSchema,  // 전체 폼 형태 검증
    // 또는 함수 사용:
    onChange: ({ value }) => {
      if (value.startDate > value.endDate) return 'End date must be after start';
      return undefined;
    },
  },
});
```

폼 레벨 에러는 `<FormErrors />`로 렌더링됩니다.

### 에러 표시

에러는 다음 조건 중 하나가 충족될 때 표시됩니다:

1. **필드가 터치됨** — 사용자가 필드와 상호작용함 (blur/change)
2. **폼이 제출됨** — 필드가 터치되지 않았더라도 최소 한 번의 제출 시도가 있음

이렇게 하면 새 폼에서 에러가 표시되는 것을 방지하면서도 제출 후에는 모든 에러가 나타나도록 보장합니다.

---

## 리스너 (사이드 이펙트)

리스너는 유효성 검사에 영향을 주지 않고 사이드 이펙트를 실행합니다. 의존적 필드 초기화, 값 동기화, 분석 트리거 등에 사용하세요.

```tsx
<FormSelectField
  name='country'
  label='Country'
  options={countries}
  listeners={{
    onChange: ({ value, fieldApi }) => {
      fieldApi.form.setFieldValue('state', '');
      fieldApi.form.setFieldValue('city', '');
    }
  }}
/>
```

| 리스너     | 실행 시점               |
| ---------- | ----------------------- |
| `onChange` | 필드 값 변경 후         |
| `onBlur`   | 필드가 포커스를 잃을 때 |
| `onMount`  | 필드 마운트 시          |
| `onSubmit` | 폼 제출 시              |

각각 선택적 `*DebounceMs` 동반자가 있습니다 (예: `onChangeDebounceMs: 300`).

---

## 폼 레시피

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

### 시트 또는 다이얼로그 내 폼

HTML `form` 속성을 사용하여 외부 제출 버튼을 연결하세요:

```tsx
const [open, setOpen] = useState(false);

const form = useAppForm({
  defaultValues: { ... },
  onSubmit: ({ value }) => {
    toast.success('Created!');
    setOpen(false);
    form.reset();
  },
});

<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>
    <SheetHeader>...</SheetHeader>
    <ScrollArea className="flex-1">
      <form.AppForm>
        <form.Form id="sheet-form" className="space-y-4 p-0 md:p-0">
          {/* fields */}
        </form.Form>
      </form.AppForm>
    </ScrollArea>
    <SheetFooter>
      <Button type="submit" form="sheet-form">Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

핵심: `form.Form`에 `id="sheet-form"` + 외부 버튼에 `form="sheet-form"`.

### 다중 단계 위저드

```tsx
import { useAppForm, withFieldGroup } from '@/components/ui/tanstack-form';
import { revalidateLogic, useStore } from '@tanstack/react-form';

// 1. 단계 그룹 정의
const Step1 = withFieldGroup({
  defaultValues: { name: '', category: '' },
  render: ({ group }) => (
    <>
      <group.AppField name="name">
        {(field) => <field.TextField label="Name" required />}
      </group.AppField>
      <group.AppField name="category">
        {(field) => <field.SelectField label="Category" options={opts} />}
      </group.AppField>
    </>
  ),
});

// 2. 단계별 스키마 정의
const stepSchemas = [
  fullSchema.pick({ name: true, category: true }),
  fullSchema.pick({ description: true }),
  z.object({}),  // 검토 단계 — 유효성 검사 없음
];

// 3. 동적 유효성 검사로 폼 생성
const { currentValidator, currentStep, ... } = useFormStepper(stepSchemas);

const form = useAppForm({
  defaultValues: { ... },
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: currentValidator,
    onDynamicAsyncDebounceMs: 500,
  },
  onSubmit: ({ value }) => { ... },
});

// 4. 현재 단계 렌더링
<Step1 form={form} fields={{ name: 'name', category: 'category' }} />
```

`src/modules/forms/components/multi-step-product-form.tsx`를 참조하세요.

### 중첩 객체 필드

중첩 경로에 점 표기법을 사용하세요. `DeepKeys<T>`가 `team.name`, `team.size` 등에 대한 자동 완성을 제공합니다.

```tsx
type FormValues = {
  team: { name: string; size: number };
};

const { FormTextField } = useFormFields<FormValues>();

<FormTextField name="team.name" label="Team Name" required />
<FormTextField name="team.size" label="Team Size" type="number" />
```

### 동적 배열 행

추가/제거에 대한 완전한 제어를 위해 `mode="array"`와 함께 `form.AppField`를 사용하세요:

```tsx
type FormValues = {
  members: Array<{ name: string; role: string }>;
};

<form.AppField name='members' mode='array'>
  {(field) => (
    <div className='space-y-3'>
      {field.state.value.map((_, i) => (
        <div key={i} className='flex gap-2'>
          <form.AppField
            name={`members[${i}].name`}
            validators={{ onBlur: z.string().min(1, 'Required') }}
          >
            {(sub) => (
              <sub.FieldSet className='flex-1'>
                <sub.Field>
                  <Input
                    placeholder='Name'
                    value={sub.state.value}
                    onChange={(e) => sub.handleChange(e.target.value)}
                    onBlur={sub.handleBlur}
                  />
                </sub.Field>
                <sub.FieldError />
              </sub.FieldSet>
            )}
          </form.AppField>
          <Button variant='ghost' size='icon' onClick={() => field.removeValue(i)}>
            <Icons.close className='h-4 w-4' />
          </Button>
        </div>
      ))}
      <Button variant='outline' size='sm' onClick={() => field.pushValue({ name: '', role: '' })}>
        Add Member
      </Button>
    </div>
  )}
</form.AppField>;
```

배열 메서드: `pushValue`, `removeValue`, `insertValue`, `replaceValue`, `swapValues`, `moveValue`.

### 의존적 드롭다운 (국가 → 주)

`listeners`와 반응형 `useStore`를 결합하세요:

```tsx
// 국가 값을 반응형으로 읽기
const selectedCountry = useStore(form.store, (s) => s.values.country);
const stateOptions = countryStateMap[selectedCountry] ?? [];

<FormSelectField
  name="country"
  label="Country"
  options={countryOptions}
  listeners={{
    onChange: ({ fieldApi }) => {
      fieldApi.form.setFieldValue('state', '');  // 의존적 필드 초기화
    },
  }}
/>
<FormSelectField
  name="state"
  label="State"
  options={stateOptions}
  placeholder={selectedCountry ? 'Select state' : 'Select a country first'}
/>
```

### 비밀번호 확인 (연결된 필드)

```tsx
<form.AppField
  name='confirmPassword'
  validators={{
    onChangeListenTo: ['password'],
    onChange: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue('password');
      return value !== password ? 'Passwords do not match' : undefined;
    },
    onBlur: z.string().min(1, 'Required')
  }}
>
  {(field) => <field.TextField label='Confirm Password' required type='password' />}
</form.AppField>
```

### 체크박스 그룹 (다중 선택 배열)

리스트에서 여러 값을 선택하려면 `mode="array"`와 함께 `form.AppField`를 사용하세요:

```tsx
const positionOptions = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' }
];

<form.AppField name='position' mode='array'>
  {(field) => {
    const values: string[] = field.state.value || [];
    return (
      <field.FieldSet>
        <FieldLabel>Position(s) *</FieldLabel>
        <div className='grid grid-cols-2 gap-3'>
          {positionOptions.map((opt) => (
            <div key={opt.value} className='flex items-center space-x-2'>
              <Checkbox
                id={`position-${opt.value}`}
                checked={values.includes(opt.value)}
                onCheckedChange={(checked) => {
                  if (checked) field.pushValue(opt.value);
                  else {
                    const idx = values.indexOf(opt.value);
                    if (idx > -1) field.removeValue(idx);
                  }
                }}
              />
              <Label htmlFor={`position-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </div>
        <field.FieldError />
      </field.FieldSet>
    );
  }}
</form.AppField>;
```

### 날짜 선택 필드 (Calendar 팝오버)

날짜 선택에는 Calendar 팝오버와 함께 `form.AppField`를 사용하세요. ISO 문자열로 저장합니다:

```tsx
<form.AppField
  name='available-date'
  validators={{ onBlur: z.string().min(1, 'Please select a date') }}
>
  {(field) => (
    <field.FieldSet>
      <field.Field>
        <field.FieldLabel>Available Date *</field.FieldLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal',
                !field.state.value && 'text-muted-foreground'
              )}
            >
              <Icons.calendar className='mr-2 h-4 w-4' />
              {field.state.value ? format(new Date(field.state.value), 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={field.state.value ? new Date(field.state.value) : undefined}
              onSelect={(date) => {
                field.handleChange(date ? date.toISOString() : '');
                field.handleBlur();
              }}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </field.Field>
      <field.FieldError />
    </field.FieldSet>
  )}
</form.AppField>
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

## 새 필드 타입 추가하기

새 필드(e.g., `DatePickerField`)를 만들려면 **2개의 터치포인트**가 필요합니다:

### 1. 필드 파일 생성

```tsx
// src/components/forms/fields/date-picker-field.tsx
'use client';

import { useStore } from '@tanstack/react-form';
import { FieldLabel } from '@/components/ui/field';
import {
  useFieldContext,
  FormFieldSet,
  FormField,
  FormFieldError,
  createFormField
} from '@/components/ui/form-context';

interface DatePickerFieldProps {
  label: string;
  required?: boolean;
}

export function DatePickerField({ label, required }: DatePickerFieldProps) {
  const field = useFieldContext();
  const value = useStore(field.store, (s) => s.value) as Date | undefined;

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel>
          {label}
          {required && ' *'}
        </FieldLabel>
        {/* 날짜 선택기 UI — field.handleChange 및 field.handleBlur 호출 */}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormDatePickerField = createFormField(DatePickerField);
```

### 2. 배럴에서 export

```tsx
// src/components/forms/fields/index.tsx
export { DatePickerField } from './date-picker-field';
export { FormDatePickerField } from './date-picker-field';
```

### 3. 사용하기

```tsx
// 직접 임포트 (패턴 3)
import { FormDatePickerField } from '@/components/forms/fields';
<FormDatePickerField name='birthDate' label='Birth Date' />;

// typedField를 사용한 타입 세이프 방식 (커스텀 필드를 위한 패턴 1)
import { typedField } from '@/components/ui/tanstack-form';
const narrow = typedField<FormValues>();
const TypedDatePicker = narrow(FormDatePickerField);
<TypedDatePicker name='birthDate' label='Birth Date' />;

// 또는 내장 지원을 위해 tanstack-form.tsx의 useFormFields에 추가
```

### 선택 사항: AppField 렌더 프롭에 등록

`form.AppField` 내에서 `field.DatePickerField`를 사용하려면 `tanstack-form.tsx`의 `fieldComponents`에 추가하세요.

`useFormFields`에 포함시키려면 해당 반환 객체에 추가하세요.

---

## 타입 안전성 참조

| 항목                                          | 타입 세이프? | 방법                                                  |
| --------------------------------------------- | :----------: | ----------------------------------------------------- |
| `useFormFields<T>()`를 통한 필드 이름         |      예      | `DeepKeys<T>`가 `name`을 좁힘                         |
| `form.AppField`를 통한 필드 이름              |      예      | 네이티브 TanStack Form 타이핑                         |
| `typedField<T>()(Component)`를 통한 필드 이름 |      예      | 커스텀 필드를 위한 `DeepKeys<T>` 좁히기               |
| 직접 `FormTextField` 임포트를 통한 필드 이름  |    아니오    | `name`이 `string`                                     |
| 중첩 경로 (`team.name`, `members[0].role`)    |      예      | `DeepKeys<T>`가 점/대괄호 표기법 해결                 |
| 검증기 값 (Zod 스키마)                        |      예      | StandardSchemaV1 통과                                 |
| 검증기 함수                                   |    부분적    | `value`가 `unknown`으로 타이핑됨 — 함수 내에서 캐스트 |
| 리스너 콜백                                   |    부분적    | `value`가 `unknown`으로 타이핑됨 — 콜백 내에서 캐스트 |

---

## 익스포트 참조

### `@/components/ui/tanstack-form`에서

| Export                 | 타입     | 목적                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------ |
| `useAppForm`           | Hook     | 폼 인스턴스 생성                                                         |
| `useFormFields<T>()`   | Hook     | 타입 세이프 조합 필드 컴포넌트 가져오기                                  |
| `withForm`             | HOC      | 폼 컨텍스트로 컴포넌트 감싸기                                            |
| `withFieldGroup`       | HOC      | 다중 단계 필드 그룹 생성                                                 |
| `useFormContext`       | Hook     | 컨텍스트에서 폼 인스턴스 접근                                            |
| `useFieldContext`      | Hook     | 컨텍스트에서 필드 API 접근                                               |
| `createFormField`      | 유틸리티 | 베이스 필드에서 조합 필드 생성                                           |
| `typedField<T>()`      | 유틸리티 | 모든 조합 필드의 `name`을 `DeepKeys<T>`로 좁히기                         |
| `revalidateLogic`      | 유틸리티 | 다중 단계를 위한 동적 유효성 검사 로직                                   |
| `scrollToFirstError`   | 유틸리티 | 첫 번째 유효하지 않은 필드로 스크롤 + 포커스                             |
| `FormFieldSet`         | 컴포넌트 | 구조적 — 접근성 ID 래퍼                                                  |
| `FormField`            | 컴포넌트 | 구조적 — aria-invalid, aria-describedby                                  |
| `FormFieldError`       | 컴포넌트 | 필드 레벨 에러 렌더링                                                    |
| `FormErrors`           | 컴포넌트 | 폼 레벨 에러 렌더링                                                      |
| `FieldConfig`          | 타입     | `validators` + `asyncDebounceMs` + `listeners` + `mode` + `defaultValue` |
| `FieldValidatorConfig` | 타입     | 검증기 타이밍 옵션                                                       |
| `FieldListenerConfig`  | 타입     | 리스너 옵션                                                              |
| `WithTypedName`        | 타입     | 컴포넌트의 `name` prop 좁히기                                            |

### `@/components/forms/fields`에서

| 베이스 (렌더 프롭) | 조합형 (플랫)         |
| ------------------ | --------------------- |
| `TextField`        | `FormTextField`       |
| `TextareaField`    | `FormTextareaField`   |
| `SelectField`      | `FormSelectField`     |
| `CheckboxField`    | `FormCheckboxField`   |
| `SwitchField`      | `FormSwitchField`     |
| `RadioGroupField`  | `FormRadioGroupField` |
| `SliderField`      | `FormSliderField`     |
| `FileUploadField`  | `FormFileUploadField` |

---

## 대시보드 예제

### 폼 페이지 (`/dashboard/forms/...`)

| 페이지                | 경로                          | 시연되는 패턴                                                                                                                                                                                                                 |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **기본 폼**           | `/dashboard/forms/basic`      | 8가지 모든 필드 타입, `useFormFields`, `onBlur` + 비동기 유효성 검사, 리스너, 폼 데이터 미리보기                                                                                                                              |
| **다중 단계 폼**      | `/dashboard/forms/multi-step` | `withFieldGroup`, 단계별 Zod 스키마, `revalidateLogic`, 단계 탐색, 검토 요약                                                                                                                                                  |
| **시트 & 다이얼로그** | `/dashboard/forms/sheet-form` | 외부 제출 버튼이 있는 시트 내 폼, 다이얼로그 내 폼, 성공 시 닫기 + 초기화                                                                                                                                                     |
| **고급 패턴**         | `/dashboard/forms/advanced`   | 비동기 유효성 검사 (username 확인), 연결된 필드 (`onChangeListenTo`로 password confirm), 중첩 객체 (`team.name`), 동적 배열 행 (members), 의존적 드롭다운 (country → state with listener), `FormErrors`, `scrollToFirstError` |

### 기타 폼

| 폼            | 파일                                                  | 패턴                               |
| ------------- | ----------------------------------------------------- | ---------------------------------- |
| Product CRUD  | `src/modules/products/components/product-form.tsx`    | 패턴 1, 분할 스키마, onBlur 검증기 |
| Sheet Product | `src/modules/forms/components/sheet-product-form.tsx` | 시트 내 패턴 2                     |
| Auth          | `src/modules/auth/components/user-auth-form.tsx`      | 패턴 2, 미니멀                     |
