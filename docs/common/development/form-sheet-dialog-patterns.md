# 시트/다이얼로그 내 폼 패턴

<!-- 이 파일은 form-patterns.md에서 분할됨. 2026-06-14.
     폼 시스템의 Sheet/Dialog 내 폼, 외부 제출 버튼(form attribute) 관련 패턴을 다룹니다.
     인덱스: [form-patterns.md](form-patterns.md) -->

[TanStack Form](https://tanstack.com/form)을 shadcn/ui의 `Sheet`/`Dialog` 컴포넌트와 함께 사용할 때의 패턴입니다. HTML `form` 속성을 통해 외부 제출 버튼을 연결하는 방식을 다룹니다.

> 폼 **규칙**(필수, 위반 시 리뷰 거절)은 [forms.md](forms.md) 참조.
> 이 문서는 권장 패턴 + 복사용 예제입니다.

---

## 폼 레시피

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
