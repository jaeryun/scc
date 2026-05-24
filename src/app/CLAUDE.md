# App Router 컨벤션

서버 컴포넌트, 메타데이터 등 공통 규칙 → [docs/core/conventions.md](../../docs/core/conventions.md) 참조.
데이터 페칭 패턴 → [../modules/CLAUDE.md](../modules/CLAUDE.md) 참조.
API 라우트 규칙 → [api/CLAUDE.md](api/CLAUDE.md) 참조.

## 라우트 그룹

- App Router 전용, Pages Router 금지 (`pages/` 디렉토리 없음)
- 뷰별 라우트 그룹: `src/app/(main)/<view-id>/page.tsx`
- 각 뷰 그룹은 독립적인 `layout.tsx` 가질 수 있음

## 파일 컨벤션

| 파일               | 역할                                               |
| ------------------ | -------------------------------------------------- |
| `layout.tsx`       | 공유 레이아웃 (중첩 가능)                          |
| `page.tsx`         | 라우트의 실제 페이지                               |
| `loading.tsx`      | Suspense fallback (page 로딩 중)                   |
| `error.tsx`        | 에러 바운더리 (`'use client'` 필수)                |
| `not-found.tsx`    | 404 페이지                                         |
| `global-error.tsx` | 루트 에러 바운더리 (`<html>`, `<body>` 포함 필수)  |
| `route.ts`         | API 라우트 핸들러 → [api/CLAUDE.md](api/CLAUDE.md) |

## 에러 처리

### `error.tsx` — 페이지/레이아웃 단위

- 해당 세그먼트와 하위 세그먼트의 런타임 에러를 캐치
- `'use client'` 필수, `Error` 객체의 `message`와 `reset()` 함수를 props로 받음
- **주의**: 동일 세그먼트의 `layout.tsx` 에러는 잡지 못함 (상위 `error.tsx` 필요)

```tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>오류 발생</h2>
      <p>{error.message}</p>
      <button onClick={reset}>재시도</button>
    </div>
  );
}
```

### `global-error.tsx` — 전역 루트 에러

- 루트 레이아웃 전체를 대체하는 전역 에러 바운더리
- **`<html>` 및 `<body>` 태그를 반드시 포함**해야 함 (레이아웃을 완전히 대체하므로)
- `app/global-error.tsx`에만 배치 (하위 디렉토리 배치 시 무시됨)

```tsx
'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h2>치명적 오류</h2>
        <p>{error.message}</p>
        <button onClick={reset}>재시도</button>
      </body>
    </html>
  );
}
```

## 병렬 라우트

- `@` 접두사 슬롯으로 동일 layout에서 여러 페이지 동시 렌더링
- 예: `@area_stats/`, `@bar_stats/`, `@pie_stats/`, `@sales/` → `layout.tsx`에서 `props`로 받음
- 슬롯별 독립적인 `loading.tsx`, `error.tsx` 가능

## 신규 페이지 추가 워크플로

1. `src/config/views.ts` → `views` 배열에 새 뷰 등록 (또는 기존 뷰에 navItems 추가)
2. `src/app/(main)/<view-id>/page.tsx` → 페이지 생성
3. `PageContainer`로 래핑, `pageTitle`/`pageDescription` props 사용
4. 데이터 페칭: [../modules/CLAUDE.md](../modules/CLAUDE.md)의 `prefetchQuery` + `useSuspenseQuery` 패턴 참조
