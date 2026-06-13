# 폼 유효성 검사 패턴

<!-- 이 파일은 form-patterns.md에서 분할됨. 2026-06-14.
     폼 시스템의 유효성 검사(Zod, onBlur/onChange/onSubmit 전략, 리스너, 연결된 필드) 관련 패턴을 다룹니다.
     인덱스: [form-patterns.md](form-patterns.md) -->

[TanStack Form](https://tanstack.com/form) + Zod 기반의 폼 유효성 검사 전략과 패턴입니다. 필드 레벨/폼 레벨 검증, 비동기 서버 확인, 연결된 필드, 교차 필드 검사, 리스너(사이드 이펙트)를 다룹니다.

> 폼 **규칙**(필수, 위반 시 리뷰 거절)은 [forms.md](forms.md) 참조.
> 이 문서는 권장 패턴 + 복사용 예제입니다.

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

## 폼 레시피 (유효성 검사)

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
