# 폼 규칙

## 필수 도구 (필수)

- 모든 폼에 `useAppForm` + `useFormFields<T>()` 사용
- 폼 값 타입은 `z.infer<typeof schema>` 사용 -- 수동 타입 정의 금지
- `form.SubmitButton` 컴포넌트 -- 제출 버튼 직접 구현 금지 (로딩/비활성화 자동 처리)

## 필드 사용법 (필수)

- `AppField` render props 내에서 폼 필드 상태 관리를 위한 `useState` 사용 금지 (Sheet/모달 open 상태는 예외)
- 필드 타입: `FormTextField`, `FormTextareaField`, `FormSelectField`, `FormCheckboxField`, `FormSwitchField`, `FormRadioGroupField`, `FormSliderField`, `FormFileUploadField`

## 유효성 검사 (필수)

- `onBlur`: 형식/필수 검사 (권장)
- `onChangeAsync`: 서버 중복 검사 (디바운스)
- `onSubmit`: 최종 유효성 검사

## 외부 제출 버튼 (Sheet/Dialog)

```typescript
<form.Form id="sheet-form">...</form.Form>
<Button type="submit" form="sheet-form">저장</Button>
```
