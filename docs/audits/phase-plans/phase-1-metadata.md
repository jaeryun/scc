# Phase 1: Metadata 30개 페이지 추가

> **이전 Phase에서 인계된 상태:** 없음. 이 문서 하나로 독립 진행 가능.
> **원본 감사 보고서:** `docs/audits/2026-05-27-src-convention-audit.md`

---

## 1. 문제 설명

컨벤션 `[필수] 메타데이터 — page.tsx마다 Metadata export` 위반.
전체 48개 `page.tsx` 중 30개(62%)에서 `export const metadata: Metadata`가 누락되어 있음.

누락된 페이지는 모두 읽기 전용 정보 표시 페이지들로, SEO와 접근성에 영향을 줌.

---

## 2. 대상 파일 목록 (30개)

### Root/Redirect
1. `src/app/page.tsx`

### Settings (5)
2. `src/app/(main)/settings/page.tsx`
3. `src/app/(main)/settings/appearance/page.tsx`
4. `src/app/(main)/settings/general/page.tsx`
5. `src/app/(main)/settings/notifications/page.tsx`
6. `src/app/(main)/settings/views/page.tsx`

### DCIM (5)
7. `src/app/(main)/dcim/page.tsx`
8. `src/app/(main)/dcim/devices/page.tsx`
9. `src/app/(main)/dcim/devices/[id]/page.tsx`
10. `src/app/(main)/dcim/ipam/page.tsx`
11. `src/app/(main)/dcim/ipam/prefixes/[id]/page.tsx`

### Library (19)
12. `src/app/(main)/library/components/chat/page.tsx`
13. `src/app/(main)/library/components/forms/page.tsx`
14. `src/app/(main)/library/components/forms/basic/page.tsx`
15. `src/app/(main)/library/components/forms/advanced/page.tsx`
16. `src/app/(main)/library/components/forms/multi-step/page.tsx`
17. `src/app/(main)/library/components/forms/sheet-form/page.tsx`
18. `src/app/(main)/library/components/icons/page.tsx`
19. `src/app/(main)/library/components/kanban/page.tsx`
20. `src/app/(main)/library/components/notifications/page.tsx`
21. `src/app/(main)/library/components/profile/[[...profile]]/page.tsx`
22. `src/app/(main)/library/modules/billing/page.tsx`
23. `src/app/(main)/library/modules/exclusive/page.tsx`
24. `src/app/(main)/library/modules/products/page.tsx`
25. `src/app/(main)/library/modules/products/[productId]/page.tsx`
26. `src/app/(main)/library/modules/users/page.tsx`
27. `src/app/(main)/library/modules/workspaces/page.tsx`
28. `src/app/(main)/library/modules/workspaces/team/[[...rest]]/page.tsx`
29. `src/app/(main)/library/modules/react-query/page.tsx`
30. `src/app/(main)/library/modules/dashboard/page.tsx`

---

## 3. 해결 방향

### 작업 전 준비

1. 이미 Metadata가 있는 page.tsx들을 참고하여 패턴을 파악한다.
   예시 참고 파일들:
   - `src/app/(main)/home/page.tsx` (있는 예시)
   - `src/app/(main)/library/page.tsx` (있는 예시)
   - `src/app/(main)/library/components/chart/page.tsx` (있는 예시)

### 패턴

각 `page.tsx` 상단에 다음을 추가:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '{페이지 제목}',
  description: '{페이지 설명}',
};
```

`page.tsx`가 이미 `metadata`를 export 하고 있지만 타입 어노테이션이 없는 경우(`src/app/(main)/home/page.tsx`):
- `import type { Metadata } from 'next';` 추가
- `metadata`에 `: Metadata` 타입 추가

### 페이지 제목 규칙

- Settings: `'설정 - {메뉴명} | SE Command Center'`
- DCIM: `'{메뉴명} - DCIM | SE Command Center'`
- Library: `'{메뉴명} | Library | SE Command Center'`

### 주의사항

- `'use client'`가 있는 페이지도 서버에서 metadata export 가능 (Next.js는 클라이언트 컴포넌트에서의 metadata export를 지원)
- 기존 코드를 건드리지 않고 import + metadata export만 추가
- `src/app/layout.tsx`에 `template: '%s | SE Command Center'`가 있다면 title은 상대 경로명만 사용

---

## 4. 검증 방법

```bash
# TypeScript 컴파일 체크
bun tsc --noEmit

# 빌드 검증
bun run build

# (선택) metadata 누락 재확인
rg -L "export const metadata|export.*Metadata" --glob "**/page.tsx" src/app/
```

### 완료 조건

- `bun tsc --noEmit` 통과
- `bun run build` 성공
- 30개 page.tsx 중 `export const metadata` 또는 `export.*Metadata`가 없는 파일이 0개

---

## 5. 참고 자료

- 원본 감사: `docs/audits/2026-05-27-src-convention-audit.md` §C1
- 컨벤션: `docs/core/conventions.md` §"메타데이터" 항목
- Next.js Metadata docs: `https://nextjs.org/docs/app/building-your-application/optimizing/metadata`
