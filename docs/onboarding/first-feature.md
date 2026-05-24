# 첫 기능 만들기 — IPAM 따라하기

## 참조 구현: IPAM

`src/modules/ipam/`은 이 프로젝트의 **정규 참조 구현**입니다.
신규 기능을 추가할 때 먼저 이 구조를 살펴보세요.

## IPAM 구조

```
src/modules/ipam/
├── api/
│   ├── types.ts         # 데이터 타입, 필터, 페이로드
│   ├── service.ts       # apiClient 호출 전용
│   ├── queries.ts       # queryOptions + 쿼리 키 팩토리
│   └── mutations.ts     # useMutation 옵션 정의
├── hooks/
│   ├── use-subnets.ts           # 서브넷 목록 조회 훅
│   ├── use-subnet-mutations.ts  # 서브넷 뮤테이션 훅
│   ├── use-ip-addresses.ts      # IP 주소 목록 조회 훅
│   └── use-ip-mutations.ts      # IP 뮤테이션 훅
├── components/           # UI 컴포넌트
├── schemas.ts            # Zod 유효성 검사 스키마
└── types.ts              # 도메인 공통 타입
```

## 신규 기능 7단계 워크플로

1. `src/modules/<name>/api/types.ts` — 응답 타입, 필터 타입, 뮤테이션 페이로드 정의
2. `src/modules/<name>/api/service.ts` — `apiClient` 호출 전용 (외부에서 직접 호출 금지)
3. `src/modules/<name>/api/queries.ts` — `queryOptions()` + 쿼리 키 팩토리
4. `src/modules/<name>/hooks/` — `use-<name>s.ts`, `use-<name>-mutations.ts`
5. `src/modules/<name>/components/` — UI 컴포넌트
6. `src/app/(views)/<view>/` 또는 `src/app/dashboard/<name>/page.tsx` — 페이지 등록
7. `src/config/nav-config.ts` — 내비게이션 아이템 등록 (`access` 속성 필수)

## 핵심 원칙

- **데이터 계층 분리**: 컴포넌트에서 직접 `apiClient`/`fetch`/Prisma 호출 금지
- **쿼리 키 팩토리**: 문자열 하드코딩 금지, `entityKeys.all/list/detail` 사용
- **서버→클라이언트**: `<HydrationBoundary>` + `<Suspense>` 조합 필수
- **폼**: `useAppForm` + `AppField` + `useFormFields<T>()` 사용
