# IPAM (IP Address Management) 모듈

## 아키텍처: 4계층 (실제 Prisma DB)

다른 기능(mock-api 기반)과 달리 IPAM은 실제 Prisma DB를 사용하는 4계층 구조입니다:

```
컴포넌트 → hooks/use-*.ts → queries.ts → service.ts → apiClient()
                                                  ↓
                                         Route Handler (app/api/ipam/)
                                                  ↓
                                         *-handlers.ts (Prisma 로직)
                                                  ↓
                                               Prisma
```

| 계층 | 파일 | 설명 |
|------|------|------|
| 1. 쿼리/뮤테이션 | `queries.ts`, `mutations.ts` | React Query 옵션, 캐시 전략 |
| 2. 서비스 | `service.ts` | `apiClient()`로 API Route 호출 |
| 3. 라우트 핸들러 | `app/api/ipam/*/route.ts` | Zod 검증, 응답 포맷팅 |
| 4. 비즈니스 로직 | `*-handlers.ts` | Prisma CRUD, IP 할당 알고리즘 |

- `prisma` import는 **반드시 `*-handlers.ts`에만** 존재해야 함.
- 컴포넌트/훅에서 `apiClient`, `prisma` 직접 호출 절대 금지.

## 데이터 모델

### Subnet (`types.ts`)
```typescript
interface Subnet {
  id: string;
  network: string;        // CIDR 형식 (e.g. "10.0.0.0/24")
  description?: string | null;
  vlanId?: string | null;
  purpose?: string | null;
  centers: string[];      // 센터 배열 (다중 선택)
  createdAt: Date;
  updatedAt: Date;
}
```

### IpAddress (`types.ts`)
```typescript
type IpStatus = 'FREE' | 'ALLOCATED' | 'RESERVED' | 'DISABLED';

interface IpAddress {
  id: string;
  ip: string;
  status: IpStatus;
  hostname?: string | null;
  description?: string | null;
  subnetId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

- Subnet 조회 시 `_count: { ipAddresses: true }` include로 IP 개수 표시.
- Subnet 상세 조회 시 `ipAddresses` 전체 include.

## API 엔드포인트

| 메서드 | 경로 | 설명 | 핸들러 |
|--------|------|------|--------|
| `GET` | `/api/ipam/subnets` | 서브넷 목록 | `subnet-handlers.ts` |
| `POST` | `/api/ipam/subnets` | 서브넷 생성 | `subnet-handlers.ts` |
| `PUT` | `/api/ipam/subnets/[id]` | 서브넷 수정 | `subnet-handlers.ts` |
| `DELETE` | `/api/ipam/subnets/[id]` | 서브넷 삭제 | `subnet-handlers.ts` |
| `GET` | `/api/ipam/ip-addresses?subnetId=` | IP 목록 (필터) | `ip-handlers.ts` |
| `POST` | `/api/ipam/ip-addresses` | IP 직접 생성 | `ip-handlers.ts` |
| `PUT` | `/api/ipam/ip-addresses/[id]` | IP 수정 | `ip-handlers.ts` |
| `DELETE` | `/api/ipam/ip-addresses/[id]` | IP 삭제 | `ip-handlers.ts` |
| `POST` | `/api/ipam/ip-addresses/assign` | IP 자동 할당 | `ip-handlers.ts` |
| `POST` | `/api/ipam/ip-addresses/[id]/release` | IP 반납 | `ip-handlers.ts` |
| `GET` | `/api/ipam/ip-addresses/search?hostname=` | 호스트명 검색 | `ip-handlers.ts` |

## 쿼리 키

```typescript
// queries.ts
export const subnetKeys = {
  all: ['subnets'] as const,
  lists: () => [...subnetKeys.all, 'list'] as const,
  detail: (id: string) => [...subnetKeys.all, 'detail', id] as const,
};

export const ipAddressKeys = {
  all: ['ip-addresses'] as const,
  lists: (filters: IpAddressFilters) =>
    [...ipAddressKeys.all, 'list', filters] as const,
  search: (filters: HostnameSearchFilters) =>
    [...ipAddressKeys.all, 'search', filters] as const,
};
```

## 훅

| 훅 | 파일 | 용도 |
|----|------|------|
| `useSubnets()` | `hooks/use-subnets.ts` | 서브넷 목록 조회 (`useQuery`) |
| `useSubnetMutations()` | `hooks/use-subnet-mutations.ts` | 서브넷 생성/수정/삭제 |
| `useIpAddresses(filters)` | `hooks/use-ip-addresses.ts` | IP 주소 목록 조회 (`useQuery`) |
| `useIpAddressMutations()` | `hooks/use-ip-mutations.ts` | IP 생성/수정/삭제 |

## 스키마

- **위치**: `schemas.ts` 단일 파일 (스키마가 2개뿐이므로 디렉토리 불필요)
- `subnetSchema`: network(필수), description, vlanId, purpose, centers[]
- `ipAddressSchema`: ip(필수), status(FREE|ALLOCATED|RESERVED|DISABLED), hostname, description, subnetId

## 특별 규칙

### IP 할당 비즈니스 로직 (`ip-handlers.ts`의 `assignIpFromSubnet`)
1. FREE 상태 IP 우선 할당
2. 없으면 서브넷 CIDR 범위 내 새 IP 생성 (최대 254개)
3. `releaseIp`: IP 상태를 FREE로, hostname/description 초기화

### 캐시 무효화
- IP 생성/삭제/할당/반납 시 `subnetKeys.all` **함께** 무효화 (서브넷의 `_count` 변경 때문)
- `assignIp`/`releaseIp` 성공 시 `subnetKeys.all` + `ipAddressKeys.all` 둘 다 무효화

### API 응답 포맷
- `@/lib/api-response`의 `success(data)` / `failure(message)` 사용
- 성공: `{ success: true, data: T }`, 실패: `{ success: false, error: string }`
- Zod 검증 실패 시 `catch`에서 `ZodError` instanceof 체크 → 400
