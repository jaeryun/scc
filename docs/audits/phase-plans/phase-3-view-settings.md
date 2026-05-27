# Phase 3: view-settings 모듈 구조 정비

> **이전 Phase:** Phase 2 (any + cn() + 색상) 완료 후 진행.
> **원본 감사 보고서:** `docs/audits/2026-05-27-src-convention-audit.md` §M6, C1(일부)

---

## 1. 문제 설명

`src/modules/view-settings/` 모듈이 데이터 계층 컨벤션(`types.ts` → `service.ts` → `queries.ts` → `hooks`)을 위반하고 있음:

1. **`api/types.ts` 누락** — `ViewSettingItem`, `UpdateViewSettingPayload` 타입이 `service.ts`에 인라인 정의됨
2. **`api/mutations.ts` 누락** — `useMutation`이 `view-settings-form.tsx`에서 인라인 호출 (L16-22)
3. **`hooks/` 계층 누락** — 컴포넌트가 `api/queries.ts`와 `api/service.ts`를 직접 import (L7-8)
4. **Zod 검증 누락** — API route `[viewId]/route.ts`에서 `typeof icon !== 'string'` 수동 검증 사용
5. **비즈니스 로직 노출** — API route에서 views 설정과 DB 데이터 merge 로직이 직접 작성됨

---

## 2. 대상 파일

### 신규 생성 필요
- `src/modules/view-settings/api/types.ts`
- `src/modules/view-settings/api/mutations.ts`
- `src/modules/view-settings/hooks/use-view-settings.ts`
- `src/modules/view-settings/hooks/use-view-settings-mutations.ts`

### 수정 필요
- `src/modules/view-settings/api/service.ts` — 타입 분리, import
- `src/modules/view-settings/api/queries.ts` — 재검토 (이미 키 팩토리 있음)
- `src/modules/view-settings/components/view-settings-form.tsx` — 직접 import 제거, hook 사용
- `src/app/api/view-settings/route.ts` — 비즈니스 로직 분리
- `src/app/api/view-settings/[viewId]/route.ts` — Zod 검증 추가

---

## 3. 해결 방향

### 3.1 `api/types.ts` 신규 생성

```typescript
// src/modules/view-settings/api/types.ts
export interface ViewSettingItem {
  viewId: string;
  label: string;
  icon: string;
}

export interface UpdateViewSettingPayload {
  icon: string;
}

export interface ViewSettingResponse {
  settings: ViewSettingItem[];
}
```

### 3.2 `service.ts` 수정

- `ViewSettingItem`, `UpdateViewSettingPayload` 타입 정의 제거
- `types.ts`에서 import

### 3.3 `api/mutations.ts` 신규 생성

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateViewSetting } from './service';
import { viewSettingKeys } from './queries';
import type { UpdateViewSettingPayload } from './types';

export function useViewSettingsMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ viewId, payload }: { viewId: string; payload: UpdateViewSettingPayload }) =>
      updateViewSetting(viewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewSettingKeys.all });
    },
  });

  return { updateMutation };
}
```

### 3.4 `hooks/` 신규 생성

```typescript
// src/modules/view-settings/hooks/use-view-settings.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import { viewSettingsQueryOptions } from '../api/queries';

export function useViewSettings() {
  return useSuspenseQuery(viewSettingsQueryOptions());
}
```

```typescript
// src/modules/view-settings/hooks/use-view-settings-mutations.ts
export { useViewSettingsMutations } from '../api/mutations';
```

### 3.5 `view-settings-form.tsx` 수정

변경 전:
```typescript
import { viewSettingsQueryOptions, viewSettingKeys } from '@/modules/view-settings/api/queries';
import { updateViewSetting } from '@/modules/view-settings/api/service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// ...
const mutation = useMutation({ mutationFn: ..., onSuccess: ... });
```

변경 후:
```typescript
import { useViewSettings } from '@/modules/view-settings/hooks/use-view-settings';
import { useViewSettingsMutations } from '@/modules/view-settings/hooks/use-view-settings-mutations';
// ...
const { data } = useViewSettings();
const { updateMutation } = useViewSettingsMutations();
```

### 3.6 API Route Zod 검증

`[viewId]/route.ts` — 수동 검증을 Zod로 교체:

```typescript
import { z } from 'zod';

const updateViewSettingSchema = z.object({
  icon: z.string().min(1),
});

// PATCH 핸들러 내
const body = await req.json();
const { icon } = updateViewSettingSchema.parse(body);
```

### 3.7 API Route 비즈니스 로직 분리

`src/app/api/view-settings/route.ts`의 merge 로직을
`src/modules/view-settings/api/get-view-settings-handler.ts` 등으로 추출.

---

## 4. 검증 방법

```bash
# TypeScript 컴파일 체크
bun tsc --noEmit

# 빌드 검증
bun run build

# 신규 파일 존재 확인
ls src/modules/view-settings/api/types.ts
ls src/modules/view-settings/api/mutations.ts
ls src/modules/view-settings/hooks/use-view-settings.ts
ls src/modules/view-settings/hooks/use-view-settings-mutations.ts

# service.ts에서 any 잔존 확인
rg '\bany\b' src/modules/view-settings/api/service.ts

# 컴포넌트에서 api 직접 import 잔존 확인
rg "from.*view-settings/api/(service|queries)" src/modules/view-settings/components/

# useMutation 인라인 잔존 확인
rg "useMutation" src/modules/view-settings/components/

# API route에서 Zod 검증 사용 확인
rg "z\.object|\.parse\(|z\.string" src/app/api/view-settings/
```

### 완료 조건

- `bun tsc --noEmit` 통과
- `bun run build` 성공
- `api/types.ts`, `api/mutations.ts`, `hooks/use-view-settings.ts`, `hooks/use-view-settings-mutations.ts` 4개 파일 존재
- `service.ts`에서 타입 정의 없음 (types.ts에서 모두 import)
- 컴포넌트에서 `api/service.ts`나 `api/queries.ts` 직접 import 없음
- 컴포넌트에서 `useMutation` 인라인 호출 없음
- API route에서 Zod 스키마 검증 사용
- 기능 정상 동작 (뷰 설정 아이콘 변경 기능)

---

## 5. 참고 자료

- 원본 감사: `docs/audits/2026-05-27-src-convention-audit.md` §C1(일부), §M6
- 참조 구현: `src/modules/ipam/api/` (완전한 타입-서비스-쿼리-뮤테이션 분리)
- 컨벤션: `docs/core/conventions.md` §"아키텍처", §"API & 데이터"
