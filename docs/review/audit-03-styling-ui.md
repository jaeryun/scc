# Audit #3: 스타일 & UI 규칙

**감사 항목:** 정적 Tailwind 색상, cn() 사용, 아이콘 임포트, shadcn/ui 수정, 버튼 접근성, `!important` 사용

---

## 1. 정적 Tailwind 색상

### 규칙

`text-primary`, `bg-muted`, `text-destructive` 등 CSS 변수 기반 시맨틱 토큰만 사용.  
`text-red-500`, `bg-blue-600` 등 정적 Tailwind 색상 금지.  
`src/components/ui/` 디렉토리 내 shadcn 기본 컴포넌트는 제외.

### 위반 (4건)

**`src/modules/auth/components/interactive-grid.tsx`**
- 58행: `stroke-gray-400/30`
- 59행: `fill-gray-300/30`

**`src/modules/dashboard/components/widgets/panel-info-card.tsx`**
- 39행: `'border-l-blue-500'`
- 40행: `'border-l-green-500'`
- 41행: `'border-l-amber-500'`
- 42행: `'border-l-red-500'`

**`src/components/github-stars-button.tsx`**
- 61행: `'text-[#0FBF3E]'` — GitHub 브랜드 컬러
- 62행: `'text-[#8534F3]'` — Copilot 브랜드 컬러

### 결과: 대체로 양호

`text-*`, `bg-*`, `border-*` 패턴 검색 결과, 위 4건 외에는 정적 Tailwind 색상 발견되지 않음. `cn()` 사용이 보편화되어 있고, 대부분의 색상이 시맨틱 토큰으로 적용됨.

---

## 2. cn() 사용

### 규칙

`cn()`으로 className 병합. 문자열 연결, 템플릿 리터럴, 조건부 삼항 연산자 금지.

### 위반 (7건)

**`src/app/(main)/library/components/table/table-demos.tsx`** — `cn` 미임포트
- 181행: `className={sortKey === 'hostname' ? 'text-primary' : ''}`
- 192행: `className={sortKey === 'ip' ? 'text-primary' : ''}`
- 203행: `className={sortKey === 'cpu' ? 'text-primary' : ''}`
- 214행: `className={sortKey === 'memory' ? 'text-primary' : ''}`
- 225행: `className={sortKey === 'status' ? 'text-primary' : ''}`
- 318행: `className={isSelected ? 'bg-muted/50' : ''}`

**`src/modules/billing/components/billing-view.tsx`** — `cn` 미임포트
- 142행: `className={plan.popular ? 'border-primary' : ''}`

### `!important` 접미사 (2건)

**`src/components/kbar/index.tsx`**
- 69행: `!p-0`
- 74행: `!mt-64 !-translate-y-12`

> kbar 라이브러리 통합에서 필요한 오버라이드일 수 있으나, 규칙상 주석으로 이유 명시 필요.

---

## 3. 아이콘 임포트

### 규칙

`@/components/icons`에서만 임포트. `@tabler/icons-react` 직접 임포트 금지.

### 결과: 완벽

`@tabler/icons-react` 직접 import **0건**. 모든 아이콘이 `Icons.keyName` 패턴으로 중앙 관리됨.

---

## 4. shadcn/ui 컴포넌트 수정

### 규칙

`src/components/ui/` 직접 수정 금지, 확장만 허용.

### 결과

다수의 커스텀 컴포넌트가 `src/components/ui/`에 존재하나 (`button-group`, `infobar`, `notification-card`, `kanban`, `code-block`, `file-preview`, `spinner` 등), 이들은 shadcn 원본 수정이 아닌 자체 제작 컴포넌트. shadcn 원본 컴포넌트는 수정되지 않음.

---

## 5. 버튼 접근성

### 규칙

- 아이콘 전용 `<Button>`에 `aria-label` 필수
- 비동기 작업 버튼에 `<Button isLoading={isPending}>` 사용

### aria-label 누락 (7건)

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/app/(main)/library/components/tooltip/tooltip-demos.tsx` | 203 | `<Button variant='outline' size='icon'>` — `<Icons.help />`만 래핑 |
| `src/modules/kanban/components/board-column.tsx` | 32 | `<Button variant='ghost' size='icon'>` — `<Icons.gripVertical />` |
| `src/modules/dashboard/components/widgets/panel-info-card.tsx` | 92 | `<Button variant='ghost' size='icon' className='size-7'>` — `<Icons.settings />` |
| `src/app/(main)/library/components/tabs-accordion/tabs-accordion-demos.tsx` | 400 | CollapsibleTrigger 내 아이콘 버튼 |
| `src/app/(main)/library/components/tabs-accordion/tabs-accordion-demos.tsx` | 465 | 또 다른 CollapsibleTrigger 아이콘 버튼 |
| `src/modules/forms/components/advanced-form-patterns.tsx` | 307 | 행 삭제 아이콘 버튼 |
| `src/modules/profile/components/profile-view-page.tsx` | 136 | 경력 삭제 아이콘 버튼 |

### isLoading 누락

`user-form-sheet.tsx:160`만 `<Button isLoading={isPending}>` 올바르게 사용. 다른 비동기 버튼들은 `disabled={isPending}` + 수동 텍스트 전환 사용.

---

## 요약

| 카테고리 | 위반 수 | 심각도 |
|----------|---------|--------|
| 정적 Tailwind 색상 | 4건 | 🟢 경미 |
| cn() 우회 | 7건 | 🟢 경미 |
| `!important` 접미사 | 2건 | 🟢 경미 |
| 아이콘 임포트 | 0건 | ✅ 양호 |
| shadcn/ui 수정 | 0건 | ✅ 양호 |
| 버튼 aria-label | 7건 | 🟢 경미 |
| 버튼 isLoading | 다수 누락 | 🟢 경미 |
