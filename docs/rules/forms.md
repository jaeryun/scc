# Form rules

## Required tooling (required)

- `useAppForm` + `useFormFields<T>()` for all forms
- `z.infer<typeof schema>` for form value types -- never manually type
- `form.SubmitButton` component -- never implement submit buttons manually (auto loading/disable)

## Field usage (required)

- `AppField` render props must never use `useState` for form field state management (Sheet/modal open state is an exception)
- Field types: `FormTextField`, `FormTextareaField`, `FormSelectField`, `FormCheckboxField`, `FormSwitchField`, `FormRadioGroupField`, `FormSliderField`, `FormFileUploadField`

## Validation (required)

- `onBlur`: format/required checks (recommended)
- `onChangeAsync`: server uniqueness checks (debounced)
- `onSubmit`: final validation

## External submit buttons (Sheet/Dialog)

```typescript
<form.Form id="sheet-form">...</form.Form>
<Button type="submit" form="sheet-form">Save</Button>
```
