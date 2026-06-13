# 상태 관리 규칙

<!-- 관련 Skills: vercel-react-best-practices (rerender-*, transitions),
                  shadcn (UI 컴포넌트 내부 상태)
     이 문서는 client global state 규칙만 기술합니다.
     React 기본 hooks(useState, useReducer, useTransition)는 Skill 참조.
     Server state는 TanStack Query (data-layer.md 참조). -->

> **원칙:** client global state(Zustand)는 UI 전용. 서버 데이터는 TanStack Query.

## Zustand만 사용 (필수)

client global state 라이브러리는 **Zustand만** 허용한다. Redux, Jotai, Recoil, MobX 등 신규 도입 금지.

기존 사용처: `src/modules/demo/{chat,kanban,notifications}/utils/store.ts`

## Store 파일 위치 (필수)

- 위치: `<module>/utils/store.ts`
- 모듈별 디렉터리에 `utils/` 하위 폴더 사용
- 제품 모듈(`src/modules/<name>/`)과 데모 모듈(`src/modules/demo/<name>/`) 동일 규칙

## 슬라이스 패턴 (권장)

- 단일 모듈에서 여러 도메인 상태를 다룰 때: 단일 store + 슬라이스 selector 패턴
- 도메인이 명확히 다르고 모듈 크기가 작은 경우: 다중 store 허용
- 결정 기준: 두 store의 selector를 한 컴포넌트에서 같이 호출해야 하면 단일 store

```typescript
// store.ts
import { create } from 'zustand';

interface ChatState {
  selectedId: string | null;
  isOpen: boolean;
  setSelectedId: (id: string | null) => void;
  toggleOpen: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedId: null,
  isOpen: false,
  setSelectedId: (id) => set({ selectedId: id }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
}));

// 컴포넌트: selector만 호출 (불필요 리렌더 방지)
const selectedId = useChatStore((s) => s.selectedId);
```

## Persist (선택)

- `persist` 미들웨어는 localStorage 동기화가 필요한 경우만 (예: 다크모드, 사이드바 collapsed)
- 서버에서 hydrate되는 데이터는 절대 persist 금지 (TanStack Query 영역)
- persist key는 `${moduleName}:${storeName}` 네임스페이스

## 금지 패턴

- ❌ Zustand store에서 서버 fetch 함수 호출 — TanStack Query 영역
- ❌ 컴포넌트 내부에 `useState`로 관리 가능한 UI 상태를 store에 두기
- ❌ store 간 직접 import — 컴포넌트에서 두 store를 호출
- ❌ `useChatStore()` (selector 없이 전체 구독) — 불필요 리렌더

## 새 라이브러리 도입 절차

신규 client state 라이브러리 도입이 필요하면:
1. PR에 `왜 Zustand로 불가능한지` 명시
2. 이 문서(`state-management.md`)에 새 라이브러리 섹션 추가
3. 팀 리뷰 필수
