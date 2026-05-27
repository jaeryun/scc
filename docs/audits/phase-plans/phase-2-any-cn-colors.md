# Phase 2: any 타입 + cn() + 정적 Tailwind 색상 제거

> **이전 Phase:** Phase 1 (Metadata) 완료 후 진행.
> **원본 감사 보고서:** `docs/audits/2026-05-27-src-convention-audit.md` §C2, C3, C4

---

## 1. 문제 설명

### 2.1 `any` 타입 사용 (9건, 5개 파일)

컨벤션 `[필수] any 금지 — 필요 시 unknown + 타입 가드 사용. 서드파티 제네릭 제약은 // @reason 주석과 함께 예외 허용` 위반.

5개 API service 파일에서 `raw: any`, `apiClient<any>`, `p: any` 사용. 모두 `// @reason` 주석 없음.

NetBox API 응답 타입을 제대로 정의하지 않아 타입 안전성이 깨짐.

### 2.2 `cn()` 대신 템플릿 리터럴 (9건, 6개 파일)

컨벤션 `[필수] cn()으로 className 병합 — 문자열 연결, 템플릿 리터럴, !important 접미사 금지` 위반.

### 2.3 Tailwind 정적 색상 (29건, 10개 파일)

컨벤션 `[필수] 테마 색상만 사용 — text-amber-500, bg-blue-500 등 Tailwind 정적 색상 절대 금지` 위반.
CSS 변수 토큰(`text-primary`, `bg-muted/50` 등)으로 교체해야 함.

---

## 2. 대상 파일 목록

### any 타입 (5개 파일)

| 파일 | 라인 | 현재 코드 |
|------|------|----------|
| `src/modules/devices/api/service.ts` | 4 | `raw: any` (함수 파라미터) |
| `src/modules/devices/api/service.ts` | 21,26,31,39 | `apiClient<any[]>` / `apiClient<any>` |
| `src/modules/ipam/api/service.ts` | 4,15 | `raw: any` |
| `src/modules/ipam/api/service.ts` | 31,38,43,55 | `apiClient<any[]>` / `apiClient<any>` |
| `src/modules/interfaces/api/service.ts` | 4,14 | `raw: any`, `p: any` |
| `src/modules/interfaces/api/service.ts` | 24 | `apiClient<any[]>` |
| `src/modules/switch-mapping/api/service.ts` | 11,12 | `apiClient<any>` / `apiClient<any[]>` |
| `src/modules/switch-mapping/api/service.ts` | 16,22,27 | `iface: any`, `p: any` |
| `src/modules/cables/api/service.ts` | 4,22,27,32 | `raw: any`, `apiClient<any>` |

### cn() 위반 (6개 파일)

| 파일 | 라인 | 현재 패턴 |
|------|------|----------|
| `src/modules/devices/components/device-table/columns.tsx` | 104 | 백틱 템플릿 리터럴 |
| `src/modules/ipam/components/ip-address-list.tsx` | 40 | 백틱 템플릿 리터럴 |
| `src/modules/devices/components/device-detail.tsx` | 22 | 백틱 템플릿 리터럴 |
| `src/modules/dashboard/components/dashboard-list.tsx` | 285,303,366 | 3건 백틱 |
| `src/modules/exclusive/components/exclusive-view.tsx` | 17,24 | 2건 백틱 |
| `src/components/kbar/result-item.tsx` | 26 | 단순 템플릿 리터럴 |

### 정적 Tailwind 색상 (10개 파일)

| 파일 | 위반 클래스 |
|------|-----------|
| `src/modules/devices/components/device-table/columns.tsx` | `bg-green-500`, `bg-red-500`, `bg-cyan-500`, `bg-blue-500`, `bg-gray-400` |
| `src/modules/ipam/components/ip-address-list.tsx` | `bg-green-100`, `text-green-700`, `bg-yellow-100`, `text-yellow-700`, `bg-gray-100`, `text-gray-600` |
| `src/modules/devices/components/device-detail.tsx` | `bg-green-500`, `bg-gray-400` |
| `src/components/ui/file-preview.tsx` | `text-emerald-500`, `text-red-500`, `text-blue-500`, `text-green-500`, `text-yellow-500`, `text-purple-500`, `text-pink-500`, `text-amber-500`, `text-zinc-500` |
| `src/modules/chat/components/conversation-list.tsx` | `bg-green-500`, `bg-red-500` |
| `src/modules/chat/components/chat-header.tsx` | `bg-green-500`, `bg-red-500` |
| `src/modules/dashboard/components/dashboard-list.tsx` | 조건부 색상 템플릿 리터럴 |
| `src/components/ui/notification-card.tsx` | `bg-sky-500` |
| `src/components/ui/kanban.tsx` | `bg-zinc-100`, `dark:bg-zinc-900` |
| `src/app/(main)/library/components/static-pages/error/page.tsx` | `text-amber-500`, `bg-amber-500/10` |

---

## 3. 해결 방향

### 3.1 any 타입 제거

현재 `api/types.ts`에 정의된 타입(예: `NetBoxDevice`, `Cable`)을 활용하거나,
존재하지 않는 경우 새 타입을 `api/types.ts`에 정의.

**패턴:**

```typescript
// 변경 전
export async function getDevices(): Promise<Device[]> {
  const raw: any = await apiClient('dcim/devices/');
  return raw.results.map(mapDevice);
}

// 변경 후
import type { NetBoxDevice } from './types';
export async function getDevices(): Promise<Device[]> {
  const raw = await apiClient<{ results: NetBoxDevice[] }>('dcim/devices/');
  return raw.results.map(mapDevice);
}
```

map/mapper 함수 파라미터도 명시적 타입 정의:

```typescript
// 변경 전
function mapDevice(raw: any): Device { ... }
// 변경 후
function mapDevice(raw: NetBoxDevice): Device { ... }
```

### 3.2 cn() 교체

```typescript
// 변경 전
<div className={`mr-1 inline-block w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />

// 변경 후 (색상도 함께 교체)
<div className={cn('mr-1 inline-block w-1.5 h-1.5 rounded-full', status === 'active' ? 'bg-success' : 'bg-muted')} />
```

### 3.3 Tailwind 정적 색상 → CSS 변수 토큰

| 정적 색상 | CSS 변수 토큰 권장 |
|-----------|-------------------|
| `bg-green-500` | `bg-success` 또는 `bg-primary` |
| `bg-red-500` | `bg-destructive` |
| `text-red-500` | `text-destructive` |
| `bg-blue-500` | `bg-primary` |
| `bg-gray-400` | `bg-muted` |
| `bg-sky-500` | `bg-info` 또는 `bg-primary` |
| `bg-amber-500` | `bg-warning` 또는 `text-amber-foreground` |
| `bg-green-100` | `bg-success/20` |
| `text-green-700` | `text-success` |
| `bg-gray-100` | `bg-muted/30` |
| `text-gray-600` | `text-muted-foreground` |
| `bg-zinc-100` | `bg-muted/30` |
| `dark:bg-zinc-900` | (테마가 자동 처리) |

> **참고:** `src/components/ui/file-preview.tsx`의 파일 확장자별 아이콘 색상(문서=파랑, 엑셀=녹색)은 시맨틱하게 의도적인 색상이나, 테마 전환 시 무반응 문제가 있음. 차트 컬러 변수(`--chart-1` ~ `--chart-5`)를 대신 사용하거나, 적절한 토큰 매핑 필요.

---

## 4. 검증 방법

```bash
# TypeScript 컴파일 체크
bun tsc --noEmit

# 빌드 검증
bun run build

# any 잔존 확인
rg '\bany\b' --glob '**/api/service.ts' src/

# 템플릿 리터럴 className 잔존 확인
rg 'className=\{`' --glob '*.tsx' src/

# 정적 Tailwind 색상 잔존 확인 (기존 컨벤션 어긴 패턴 기준)
rg 'text-(red|blue|green|yellow|amber|purple|pink|emerald|sky|gray|zinc)-(50|100|200|300|400|500|600|700|800|900)' --glob '*.tsx' src/
rg 'bg-(red|blue|green|yellow|amber|purple|pink|emerald|sky|gray|zinc)-(50|100|200|300|400|500|600|700|800|900)' --glob '*.tsx' src/
```

### 완료 조건

- `bun tsc --noEmit` 통과
- `bun run build` 성공
- `src/modules/*/api/service.ts`에서 `any` 타입 0건
- className 템플릿 리터럴 0건
- `src/modules/` 및 `src/components/` 내 정적 Tailwind 색상 0건 (단, `src/app/(main)/library/` 데모 페이지는 선택적)

---

## 5. 참고 자료

- 원본 감사: `docs/audits/2026-05-27-src-convention-audit.md` §C2, C3, C4
- 컨벤션: `docs/core/conventions.md` §"TypeScript", §"UI & 스타일"
- 테마 치트시트: `docs/themes/cheat-sheet.md`
