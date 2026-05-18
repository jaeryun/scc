# 간소화된 네비게이션 RBAC 시스템

## 개요

이 문서는 네비게이션 아이템을 위한 완전 클라이언트 사이드 RBAC(역할 기반 접근 제어) 시스템을 설명합니다.

**핵심 통찰**: 네비게이션 가시성은 보안이 아닌 UX일 뿐입니다. Clerk의 훅을 사용하여 모든 것을 클라이언트 사이드에서 확인할 수 있습니다!

## 아키텍처

### 핵심 파일

1. **`src/hooks/use-nav.ts`** - 모든 필터링 로직을 처리하는 단일 훅 (완전 클라이언트 사이드)
2. **`src/types/index.ts`** - `access` 속성이 있는 타입 정의

### 클라이언트 사이드를 사용하는 이유?

- **네비게이션 가시성은 UX일 뿐입니다** - 사용자가 네비게이션 아이템을 보거나 숨긴다고 해서 보안을 우회할 수 없습니다
- **Clerk가 모든 데이터를 클라이언트 사이드에서 제공합니다** - `useOrganization()`이 `membership.permissions`와 `membership.role`을 제공합니다
- **서버 호출 제로** - 즉각적인 필터링, 로딩 상태 없음, UI 깜빡임 없음
- **더 나은 성능** - 네트워크 지연 없음, 비동기 복잡성 없음

**참고**: 실제 보안(API 라우트, 서버 액션, 페이지 보호)을 위해서는 항상 서버 사이드 검사를 사용하세요.

## 성능 특성

### 모든 검사는 동기적입니다

✅ **requireOrg**: `useOrganization()`을 사용한 클라이언트 사이드 검사  
✅ **permission**: `membership.permissions` 배열을 사용한 클라이언트 사이드 검사  
✅ **role**: `membership.role`을 사용한 클라이언트 사이드 검사  
⚠️ **plan/feature**: 서버 사이드 검사 필요 (아래 참조)

### 서버 호출 제로

- 모든 네비게이션 필터링은 동기적으로 발생합니다
- 로딩 상태 없음
- UI 깜빡임 없음
- 즉각적인 결과

## 사용법

### `nav-config.ts`에서

```typescript
{
  title: 'Teams',
  url: '/dashboard/workspaces/team',
  icon: 'userPen',
  // 간단: requireOrg (클라이언트 사이드 검사, 즉시 실행)
  access: { requireOrg: true }
}

{
  title: 'Admin Panel',
  url: '/dashboard/admin',
  icon: 'settings',
  // 모든 클라이언트 사이드 검사 - 즉시 실행!
  access: {
    requireOrg: true,
    permission: 'org:admin:manage',  // membership.permissions에서 클라이언트 사이드로 가져옴
    role: 'admin'  // membership.role에서 클라이언트 사이드로 가져옴
}
```

### 컴포넌트에서

```typescript
import { useFilteredNavItems } from '@/hooks/use-nav';

function MyComponent() {
  const filteredItems = useFilteredNavItems(navItems);
  // filteredItems는 RBAC 기반으로 자동 필터링됩니다
}
```

### 플랜/기능 검사

플랜과 기능은 서버 사이드 전용인 Clerk의 `has()` 함수가 필요합니다. 옵션:

1. **조직 메타데이터에 저장** (네비게이션에 권장):

   ```typescript
   // 조직 설정 시
   organization.publicMetadata.plan = 'pro';

   // nav-config.ts에서
   access: {
     requireOrg: true,
     // plan 대신 메타데이터 확인
   }
   ```

2. **아이템 표시, 페이지 수준에서 보호** (현재 접근 방식):
   - 네비게이션 아이템이 표시됨
   - 페이지 컴포넌트가 서버 사이드에서 검사하고 필요 시 리다이렉트/에러 표시

3. **서버 액션 사용** (정말 필요한 경우):
   - plan/feature 검사가 반드시 필요한 네비게이션 아이템에만 사용
   - 대부분의 네비게이션 아이템은 이것이 필요하지 않습니다

## 확장성

### 새 아이템 추가

`nav-config.ts`에 추가하기만 하면 됩니다:

```typescript
{
  title: 'New Feature',
  url: '/dashboard/new',
  icon: 'star',
  access: { plan: 'pro' }  // 이게 끝입니다!
}
```

시스템이 자동으로:

- 사이드바에서 필터링
- kbar에서 필터링
- 필요 시 비동기 검사 처리
- 동기 검사 즉시 처리

### 새 접근 타입 추가

1. `src/app/actions/rbac.ts`의 `PermissionCheck` 인터페이스에 추가
2. `checkAccess()` 함수에 검사 로직 추가
3. `use-nav.ts`를 업데이트하여 새 타입 처리

## 비교: 이전 vs 이후

### 이전 (과도하게 복잡)

- 복잡한 로직이 있는 4개의 파일
- 여러 개의 훅과 유틸리티
- 불분명한 데이터 흐름
- 버그 가능성

### 이후 (간소화됨)

- 1개의 메인 훅 파일
- 명확하고 선형적인 로직
- 이해하기 쉬움
- 유지보수하기 쉬움

## 모범 사례

1. **간단한 경우 `requireOrg: true` 사용** - 즉시 실행되며 서버 호출이 필요 없습니다
2. **가능하면 검사를 결합** - `{ requireOrg: true, permission: '...' }`가 별도 검사보다 더 효율적입니다
3. **불필요한 검사 피하기** - 아이템이 항상 표시되어야 한다면 `access`를 추가하지 마세요

## 이전 시스템에서 마이그레이션

이전 `visible` 함수는 하위 호환성을 위해 여전히 작동합니다:

```typescript
// 이전 방식 (여전히 작동)
visible: (context) => !!context?.organization;

// 새로운 방식 (권장)
access: {
  requireOrg: true;
}
```

## 향후 개선 사항

필요 시 가능한 최적화:

1. 권한 검사 캐싱 (예: React Query)
2. 앱 로드 시 권한 사전 페칭
3. 낙관적 UI 업데이트

하지만 현재 구현은 다음과 같습니다:

- ✅ 간단함
- ✅ 빠름
- ✅ 확장 가능
- ✅ 유지보수 가능
