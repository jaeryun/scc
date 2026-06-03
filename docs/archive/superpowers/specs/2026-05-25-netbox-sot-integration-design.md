# NetBox SoT Integration 설계

## 날짜

2026-05-25

## 상태

진행 중 (설계)

---

## 1. 개요

SCC 대시보드는 서버, 스토리지, 스위치 등 인프라 컴포넌트를 표현하고 조작해야 한다. 이를 위한 DB 모델링을 직접 하지 않고, NetBox를 구동하여 이를 **Source of Truth (SoT)** 로 사용한다. SCC의 Prisma DB는 UI 설정(ViewSetting, Dashboard)만 보관하고, 모든 DCIM 데이터는 NetBox에만 존재한다.

---

## 2. 결정 사항

| 결정 | 내용 |
|------|------|
| NetBox 역할 | 유일한 SoT (SCC DB에 미러링하지 않음) |
| 접근 방식 | 읽기 + 쓰기 모두 수행 |
| 호출 경로 | Browser → Next.js Route Handler → netbox-client → NetBox API (클라이언트 직접 호출 절대 금지) |
| NetBox 위치 | 별도 서버에서 이미 구동 중 |
| 인증 | NetBox API Token → SCC 서버 환경변수로 주입 |
| 캐시 | L1: React Query (브라우저), L2: Prisma NetBoxCache 테이블 (서버) — Postgres로 충분 |
| 멀티 인스턴스 | 캐시를 공유 Postgres에 두므로 문제없음 |
| NetBox 클라이언트 | `openapi-typescript` + `openapi-fetch` 로 NetBox `/api/schema/` → 자동 생성 |
| 모듈 구조 | 도메인별 독립 모듈 + 공유 netbox-client |
| 기존 IPAM | 통째로 제거 후 NetBox 기반으로 재구현 (네이밍은 `ipam` 그대로) |
| Phase 1 범위 | Device + Interface + Cable + IPAM + Site + Rack + DeviceRole + Platform |
| 제외 항목 | VLAN, VRF, Module, VirtualChassis (네트워크 엔지니어 영역, Phase 2 유보) |
| 참조 구현 | `go-netbox` (OpenAPI Generator 기반 Go SDK, 225★) — 동일 패턴을 TypeScript로 적용 |

---

## 3. 아키텍처

```
┌────────────────────────────────────────────────────────────────────┐
│                        SCC Application                             │
│                                                                    │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐  │
│  │ devices  │     │interfaces│     │  ipam    │     │  cables  │  │
│  │  module  │     │  module  │     │  module  │     │  module  │  │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘  │
│       │                │                │                │        │
│  ┌────▼────────────────▼────────────────▼────────────────▼─────┐  │
│  │                   Route Handlers (/api/*)                    │  │
│  │   Zod 검증 → cache 조회 → (miss 시) NetBox → cache 저장      │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────▼───────────────────────────────────┐  │
│  │                src/lib/netbox/                               │  │
│  │  · client.ts          ← openapi-fetch 래퍼 (인증 포함)      │  │
│  │  · schema.d.ts        ← openapi-typescript 자동 생성         │  │
│  │  · auto-paginate.ts   ← NetBox 페이징 자동 풀기              │  │
│  │  · netbox-openapi-v4.x.json ← NetBox /api/schema/ 원본 (버전관리) │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │ HTTPS
                    ┌────────▼────────┐
                    │  NetBox Server  │  (별도 서버, 이미 구동 중)
                    │  REST API       │
                    └─────────────────┘

┌─────────────────────────────────────────┐
│  Prisma DB (PostgreSQL)                 │
│                                         │
│  NetBoxCache    ← 캐시 (키: url)        │
│  ViewSetting    ← UI 설정               │
│  Dashboard      ← 그리드 대시보드       │
│  (Subnet, IpAddress, IpStatus 제거)     │
└─────────────────────────────────────────┘
```

**기존 Prisma 변경 사항**:
- `Subnet`, `IpAddress`, `IpStatus` 모델 제거 (기존 IPAM 모듈도 함께 제거)
- `NetBoxCache` 모델 추가

---

## 4. NetBox 클라이언트 — OpenAPI 자동 생성

### 4.1 접근 방식

`go-netbox` (NetBox 공식 Go SDK, 225★) 와 동일한 방식: NetBox의 OpenAPI 스키마를 코드 생성기로 변환한다. TypeScript 에서는 `openapi-typescript` + `openapi-fetch` 조합을 사용한다.

### 4.2 코드 생성 파이프라인

```
┌─────────────────────┐
│  NetBox Server      │
│  /api/schema/       │  ← OpenAPI 3.0.3 스키마 (JSON)
└────────┬────────────┘
         │ (1) 스키마 다운로드
         ▼
  ┌──────────────────┐
  │ netbox-openapi-v4.x.json │  ← 커밋하여 버전 관리
  └────────┬─────────┘
         │ (2) openapi-typescript 변환
         ▼
  ┌──────────────────────────────┐
  │ src/lib/netbox/schema.d.ts   │  ← 자동 생성 타입 (git ignored)
  └────────┬─────────────────────┘
         │ (3) openapi-fetch 래퍼
         ▼
  ┌────────────────────────────────────────┐
  │ src/lib/netbox/client.ts              │  ← 얇은 래퍼 (인증, 에러, 캐시 우회)
  │ src/lib/netbox/auto-paginate.ts       │  ← 페이징 자동 풀기 유틸리티
  └────────────────────────────────────────┘
```

### 4.3 사용 도구

| 도구 | 버전 | 용도 |
|------|------|------|
| `openapi-typescript` | ^7.x | OpenAPI 스펙 → TypeScript 타입 생성 |
| `openapi-fetch` | ^0.17 | 타입 안전한 fetch 래퍼 |

### 4.4 npm scripts

```jsonc
// package.json
{
  "scripts": {
    "netbox:fetch-schema": "bash scripts/netbox-fetch-schema.sh",
    "netbox:generate": "openapi-typescript src/lib/netbox/netbox-openapi-v4.x.json -o src/lib/netbox/schema.d.ts",
    "netbox:update": "npm run netbox:fetch-schema && npm run netbox:generate"
  }
}
```

### 4.5 환경변수

```env
NETBOX_BASE_URL=https://netbox.internal.example.com
NETBOX_API_TOKEN=0123456789abcdef0123456789abcdef01234567
```

### 4.6 생성된 클라이언트 (`src/lib/netbox/client.ts`)

```typescript
"use server";  // Next.js 16 서버 전용 모듈 — 클라이언트 번들 유출 방지

import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { envSchema } from './env';

const env = envSchema.parse(process.env);

// src/lib/netbox/env.ts — 공유 환경변수 모듈
import { z } from 'zod';
export const envSchema = z.object({
  NETBOX_BASE_URL: z.string().url(),
  NETBOX_API_TOKEN: z.string().min(40),
});

const rawClient = createClient<paths>({
  baseUrl: env.NETBOX_BASE_URL,
  headers: {
    Authorization: `Token ${env.NETBOX_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  fetch: (input, init) => {
    // Authorization 헤더를 로깅에서 제외하기 위해 fetch를 래핑
    return fetch(input, init);
  },
});

export const netbox = {
  GET: rawClient.GET,
  POST: rawClient.POST,
  PUT: rawClient.PUT,
  PATCH: rawClient.PATCH,
  DELETE: rawClient.DELETE,
};
```

### 4.7 자동 페이징 (`src/lib/netbox/auto-paginate.ts`)

`openapi-fetch`는 개별 요청만 처리하므로, NetBox의 `next` URL을 따라가며 모든 결과를 수집하는 유틸리티를 별도 구현한다.
**NetBox v4.5.2+ 는 cursor 기반 페이징도 지원**하지만, Phase 1 에서는 전통적인 offset/limit 페이징만 처리한다.

```typescript
import { envSchema } from '@/lib/netbox/env';
import type { paths } from './schema';

// NetBox 경로 → OpenAPI 스키마 path key 매핑 (build time reference)
export const NETBOX_PATHS = {
  devices:       '/api/dcim/devices/',
  interfaces:    '/api/dcim/interfaces/',
  cables:        '/api/dcim/cables/',
  prefixes:      '/api/ipam/prefixes/',
  'ip-addresses': '/api/ipam/ip-addresses/',
  sites:         '/api/dcim/sites/',
  racks:         '/api/dcim/racks/',
  'device-roles': '/api/dcim/device-roles/',
  platforms:     '/api/dcim/platforms/',
} as const;

const MAX_PAGES = 200;  // 무한 루프 방지
const PAGE_LIMIT = 50;

async function fetchPage(
  pathOrUrl: string,
  params: Record<string, string>,
  baseUrl: string,
  apiToken: string,
): Promise<{ results: unknown[]; next: string | null }> {
  // NetBox next URL은 절대 URL일 수 있으므로 분기 처리
  let url: URL;
  if (pathOrUrl.startsWith('http')) {
    url = new URL(pathOrUrl);  // 절대 URL 그대로 사용
  } else {
    url = new URL(`${baseUrl}${pathOrUrl}`);
  }
  Object.entries({ ...params, limit: String(PAGE_LIMIT) }).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Token ${apiToken}` },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`NetBox API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export async function netboxAll(
  path: string,
  params?: Record<string, string>,
): Promise<unknown[]> {
  const env = envSchema.parse(process.env);
  const results: unknown[] = [];
  let nextPath: string | null = path;

  for (let page = 0; page < MAX_PAGES && nextPath; page++) {
    const pageData = await fetchPage(
      nextPath,
      params ?? {},
      env.NETBOX_BASE_URL,
      env.NETBOX_API_TOKEN,
    );
    results.push(...pageData.results);
    nextPath = pageData.next;

    if (pageData.results.length === 0) break;

    // 100ms throttle — 초당 최대 10회 요청
    if (nextPath) await new Promise(r => setTimeout(r, 100));
  }

  return results;
}
```

**주의사항**:
- `netboxAll`은 NetBox 응답의 `next` URL을 그대로 따라간다. NetBox가 cursor 기반 페이징으로 전환해도(`?cursor=xxx`) 호환된다.
- 변형(mutation)이 빈번한 엔티티에서 페이징 중 데이터가 중복/누락될 수 있으므로, 정확성이 중요한 경우 단일 페이지 쿼리 + 수동 페이지네이션을 권장한다.
- Throttle: 초당 최대 10회 요청으로 제한 (Rate limiting 회피).

### 4.8 장점

| 장점 | 설명 |
|------|------|
| **완벽한 타입 안전성** | NetBox 인스턴스의 실제 스키마 기반이므로 필드 누락/오타 컴파일 에러 |
| **NetBox 버전 대응** | NetBox 업그레이드 시 스키마만 재다운로드 → 재생성, 나머지 코드는 그대로 |
| **모든 엔드포인트 커버** | DCIM, IPAM, Circuits, Tenancy, Extras, Plugins까지 완전 자동 커버 |
| **코드 리뷰 대상 최소화** | 생성된 `schema.d.ts` 는 git ignore, 수동 작성 코드는 `client.ts`, `auto-paginate.ts` 뿐 |

### 4.9 고려사항

- **스키마 업데이트 주기**: NetBox 설정 변경 (Custom Fields 추가, Plugin 설치) 시 스키마 재생성 필요
- **초기 설정 비용**: `openapi-typescript`, `openapi-fetch` 설치 + 스크립트 작성 (약 30분)
- **생성 코드 크기**: schema.d.ts 는 5~10MB 수준. 에디터 성능에 영향 가능 → 필요시 `netbox:update` 만 CI에서 실행

---

## 5. 캐시 레이어 (2계층)

### Prisma 모델

```prisma
model NetBoxCache {
  url        String   @id
  data       Json
  expiresAt  DateTime               // fresh 캐시 경계 (TTL)
  staleUntil DateTime               // stale 허용 경계 (expiresAt + 24h)
  hitCount   Int      @default(0)   // 모니터링 메트릭

  @@index([expiresAt])
  @@index([url(ops: raw("text_pattern_ops"))])  // startsWith 무효화 시 인덱스 사용
}
```

### 캐시 키 포맷

Prefix 충돌(`/5` → `/50` 삭제) 방지를 위해 namespaced format 사용:

```
// List:   "dcim:devices:list:role=server&site=1"
// Detail: "dcim:devices:detail:5"
```

Cache key 생성 시 URLSearchParams를 정렬하여 `?role=server&site=1` 과 `?site=1&role=server` 가 동일한 키를 사용하도록 한다.

### 동작 (stale-while-revalidate)

```typescript
// src/lib/netbox/cache.ts

export async function checkCache<T>(url: string): Promise<{ data: T; fresh: boolean } | null> {
  const cached = await prisma.netBoxCache.findUnique({ where: { url } });
  if (!cached) return null;

  if (cached.expiresAt > new Date()) {
    // Fresh cache
    await prisma.netBoxCache.update({ where: { url }, data: { hitCount: { increment: 1 } } });
    return { data: cached.data as T, fresh: true };
  }

  if (cached.staleUntil > new Date()) {
    // Stale but usable — background 재검증
    setImmediate(async () => {
      try {
        // checkCache만으로는 fetcher를 알 수 없으므로, 호출자가 재검증 promise를 전달해야 함
        // → 실제 구현 시에는 checkCache({ url, revalidate: () => fetchAndCache(url, freshData) })
      } catch { /* silent */ }
    });
    return { data: cached.data as T, fresh: false };
  }

  return null;  // 완전히 만료
}

async function fetchAndCache(url: string, data: unknown): Promise<void> {
  const now = new Date();
  const ttl = parseInt(process.env.NETBOX_CACHE_TTL_SECONDS ?? '300', 10);
  await prisma.netBoxCache.upsert({
    where: { url },
    update: { data: data as any, expiresAt: new Date(now.getTime() + ttl * 1000), staleUntil: new Date(now.getTime() + 86400 * 1000) },
    create: { url, data: data as any, expiresAt: new Date(now.getTime() + ttl * 1000), staleUntil: new Date(now.getTime() + 86400 * 1000) },
  });
}
```

**주의**: Prisma `Json` 필드에는 `JSON.stringify` 하지 않고 JavaScript 객체를 직접 전달한다. `JSON.stringify`를 사용하면 double-encoding이 발생한다.

### Route Handler 패턴

```
handler(req) {
    1. Zod 검증
     2. cacheKey = buildCacheKey(entity, 'list', params)  ← e.g. "dcim:devices:list:role=server"
    3. cached = await checkCache(cacheKey)
       if (cached?.fresh) return success(cached.data)   ← L2 fresh hit
    4. try {
         data = await netboxAll(path, params)            ← NetBox API 호출
         await fetchAndCache(cacheKey, data)
         return success(data)
       } catch (netboxError) {
         if (cached?.data) {
           // stale-while-revalidate: NetBox 장애 시 만료된 캐시라도 반환
           return success(cached.data)
         }
         throw netboxError  // 캐시도 없음 → 502
       }
    5. TTL 기본값: 5분 (환경변수 NETBOX_CACHE_TTL_SECONDS 로 조정)
}
```

### 캐시 무효화 전략

| 작업 | 무효화 규칙 |
|------|------------|
| POST/PUT/PATCH `{entity}/` | 해당 entity list 캐시만 삭제 |
| POST/PUT/PATCH `{entity}/{id}` | 해당 entity detail + list 캐시 삭제 + 연관 entity 캐시도 삭제 |
| DELETE `{entity}/{id}` | POST/PUT와 동일 |

**Cross-module 무효화**: Device 삭제 시 NetBox에서 해당 Interface/Cable도 cascade 삭제되므로, 우리 캐시도 함께 무효화한다:

```typescript
// Device 삭제 시
await invalidateCache('dcim:devices:*');         // Device 모든 캐시
await invalidateCache('dcim:interfaces:*');      // 연관 Interface 캐시
await invalidateCache('dcim:cables:*');          // 연관 Cable 캐시
```

무효화 구현:
```typescript
async function invalidateCache(prefix: string): Promise<void> {
  await prisma.netBoxCache.deleteMany({
    where: { url: { startsWith: prefix } },
  });
}
```

Prefix 충돌은 `:` 구분자(namespace)로 방지한다. 예: `dcim:devices:detail:5` 는 `dcim:devices:detail:50` 과 매칭되지 않는다.

### Thundering Herd 방지 (인메모리 dedup)

멀티 인스턴스가 동일 URL을 동시에 cold cache miss 할 때, 중복 NetBox 요청을 방지:

```typescript
const inFlight = new Map<string, Promise<unknown>>();

export async function cachedFetch(url: string, fetcher: () => Promise<unknown>): Promise<unknown> {
  if (inFlight.has(url)) return inFlight.get(url)!;

  const promise = fetcher().finally(() => inFlight.delete(url));
  inFlight.set(url, promise);
  return promise;
}
```

### React Query L1 캐시

- `staleTime`: 2분 (L2 캐시보다 짧게)
- `gcTime`: 10분
- L1 miss → L2 조회 → NetBox API 호출의 계단식 fallback
- Cross-user eventual consistency: 최대 2분 (L1 staleTime). Phase 2에서 broadcast channel로 개선 가능.

### Retry 전략

Route Handler 레벨에서 exponential backoff (최대 2회 retry, 총 3회 시도):

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, 2 ** attempt * 500));
    }
  }
}
```

---

## 6. 모듈 구조

도메인별 독립 모듈, IPAM 4계층 패턴 재사용:

```
src/
├── lib/
│   └── netbox/
│       ├── netbox-openapi-v4.x.json    # NetBox OpenAPI 스키마 원본 (버전 관리)
│       ├── schema.d.ts                 # openapi-typescript 자동 생성 (git ignore)
│       ├── env.ts                      # Zod 환경변수 검증 (공유 모듈)
│       ├── client.ts                   # openapi-fetch 래퍼 (인증, "use server")
│       ├── paths.ts                    # NetBox 경로 매핑 + cache key builder
│       ├── auto-paginate.ts            # NetBox 페이징 자동 풀기
│       ├── cache.ts                    # checkCache / fetchAndCache / invalidateCache
│       ├── retry.ts                    # exponential backoff withRetry
│       └── errors.ts                   # NetBoxHttpError 래퍼
├── modules/
│   ├── devices/                   # Device CRUD + 목록
│   │   ├── api/
│   │   │   ├── types.ts           # NetBox Device 응답 타입 + 우리 타입
│   │   │   ├── service.ts         # netbox-client 호출 + 변환
│   │   │   ├── queries.ts         # React Query 키 + 옵션
│   │   │   └── mutations.ts       # 생성/수정/삭제 뮤테이션
│   │   ├── hooks/
│   │   │   ├── use-devices.ts
│   │   │   └── use-device-mutations.ts
│   │   └── components/
│   │       └── device-table.tsx
│   │
│   ├── interfaces/                # Interface 조회 (Device 하위)
│   │   ├── api/
│   │   │   ├── types.ts
│   │   │   ├── service.ts
│   │   │   └── queries.ts
│   │   ├── hooks/
│   │   │   └── use-interfaces.ts
│   │   └── components/
│   │       └── interface-table.tsx
│   │
│   ├── cables/                    # Cable 연결 관리
│   │   ├── api/
│   │   │   ├── types.ts
│   │   │   ├── service.ts
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   ├── hooks/
│   │   │   ├── use-cables.ts
│   │   │   └── use-cable-mutations.ts
│   │   └── components/
│   │       └── cable-form.tsx
│   │
│   ├── ipam/                      # 기존 IPAM 제거 후 재구현
│   │   ├── api/
│   │   │   ├── types.ts           # Prefix, IPAddress (NetBox IPAM)
│   │   │   ├── service.ts
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   ├── hooks/
│   │   │   ├── use-prefixes.ts
│   │   │   ├── use-ip-addresses.ts
│   │   │   ├── use-prefix-mutations.ts
│   │   │   └── use-ip-mutations.ts
│   │   └── components/
│   │       └── ...
│   │
│   └── sites/                     # Site + Rack + Role + Platform (참조 데이터)
│       ├── api/
│       │   ├── types.ts
│       │   ├── service.ts          # getSites, getRacks, getRoles, getPlatforms
│       │   └── queries.ts          # sitesQueryOptions, racksQueryOptions 등
│       ├── hooks/
│       │   ├── use-sites.ts
│       │   ├── use-racks.ts
│       │   ├── use-roles.ts
│       │   └── use-platforms.ts
│       └── components/
│           └── site-selector.tsx
│
├── app/
│   └── api/
│       ├── devices/
│       │   ├── route.ts           # GET (목록), POST (생성)
│       │   └── [id]/
│       │       └── route.ts       # GET, PUT, DELETE
│       ├── interfaces/
│       │   ├── route.ts           # GET (deviceId 필터)
│       │   └── [id]/
│       │       └── route.ts       # GET
│       ├── cables/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── ipam/
│       │   ├── prefixes/
│       │   │   ├── route.ts       # GET, POST
│       │   │   └── [id]/
│       │   │       └── route.ts   # GET, PUT, DELETE
│       │   └── ip-addresses/
│       │       ├── route.ts       # GET, POST
│       │       ├── assign/
│       │       │   └── route.ts   # POST (IP 자동 할당)
│       │       ├── search/
│       │       │   └── route.ts   # GET (?hostname=) — 호스트명 검색
│       │       └── [id]/
│       │           ├── route.ts   # GET, PUT, DELETE
│       │           └── release/
│       │               └── route.ts   # POST (IP 반납)
│       └── sites/
│           ├── route.ts           # GET (목록)
│           ├── racks/
│           │   └── route.ts       # GET (siteId 필터)
│           ├── roles/
│           │   └── route.ts       # GET
│           └── platforms/
│               └── route.ts       # GET
```

---

## 7. 데이터 흐름

### 읽기 경로 (예: Device 목록 조회)

```
 1. DeviceTable 컴포넌트 렌더링
 2. useDevices() 훅 → useQuery({ queryKey: deviceKeys.list(filters), queryFn })
 3. queryFn → deviceService.getDevices(filters)
 4. service → apiClient.get('/api/devices', { params: filters })
 5. Route Handler GET /api/devices:
    a. Zod로 query params 검증
    b. cacheKey = buildCacheKey('dcim:devices', 'list', filters)
    c. cached = await checkCache(cacheKey)
    d. (miss) data = await netboxAll('/api/dcim/devices/', filters)
    e. fetchAndCache(cacheKey, data) → 200 { success: true, data }
 6. React Query가 data 캐시 (L1, staleTime=2min)
 7. 컴포넌트 렌더링
```

### 쓰기 경로 (예: Device 생성)

```
 1. DeviceForm 제출
 2. useDeviceMutations().createDevice(body)
 3. mutationFn → deviceService.createDevice(body)
 4. service → apiClient.post('/api/devices', { body })
 5. Route Handler POST /api/devices:
    a. Zod로 body 검증
    b. netboxAll 요청 (POST) → NetBox API 호출
    c. invalidateCache('dcim:devices:*')      ← Device 캐시 무효화
       invalidateCache('dcim:interfaces:*')   ← 연관 Interface 캐시 무효화
       invalidateCache('dcim:cables:*')       ← 연관 Cable 캐시 무효화
    d. 201 { success: true, data }
 6. React Query 캐시 무효화:
    queryClient.invalidateQueries({ queryKey: deviceKeys.all })
```

---

## 8. 타입 전략

### 원칙

모든 NetBox 타입은 `openapi-typescript`가 생성한 `schema.d.ts`에서 가져온다. **수동 타입 정의는 하지 않는다.** 컴포넌트에서 사용할 도메인 타입은 `service.ts`에서 생성된 타입을 기반으로 변환하여 제공한다.

### 타입 추출 예시

```typescript
// src/modules/devices/api/types.ts
import type { components, paths } from '@/lib/netbox/schema';

// NetBox API 응답 타입 (자동 생성)
export type NetBoxDevice = components['schemas']['Device'];
export type NetBoxDeviceListResponse = paths['/api/dcim/devices/']['get']['responses'][200]['content']['application/json'];

// 우리 도메인 타입 (컴포넌트에서 사용, snake_case → camelCase 정규화)
export interface Device {
  id: number;
  name: string;
  deviceType: { id: number; model: string; manufacturer: string };
  role: { id: number; name: string };
  site: { id: number; name: string } | null;
  rack: { id: number; name: string } | null;
  status: string;
  serial: string;
  primaryIpv4: string | null;
}
```

### 변환 계층

변환은 `service.ts`에서 담당. Route Handler에서 NetBox 응답을 그대로 통과시키고, service.ts에서 도메인 타입으로 변환한다:

```typescript
// src/modules/devices/api/service.ts
import type { NetBoxDevice } from './types';
import type { Device } from './types';
import { apiClient } from '@/lib/api-client';

function toDevice(raw: NetBoxDevice): Device {
  return {
    id: raw.id,
    name: raw.name ?? '(unnamed)',
    deviceType: {
      id: raw.device_type.id,
      model: raw.device_type.model,
      manufacturer: raw.device_type.manufacturer.name,
    },
    role: { id: raw.role.id, name: raw.role.name },
    site: raw.site ? { id: raw.site.id, name: raw.site.name } : null,
    rack: raw.rack ? { id: raw.rack.id, name: raw.rack.name } : null,
    status: raw.status.value,
    serial: raw.serial,
    primaryIpv4: raw.primary_ip4?.address ?? null,
  };
}

export async function getDevices(filters?: Record<string, string>): Promise<Device[]> {
  const response = await apiClient.get('/api/devices', { params: filters });
  return response.data.map(toDevice);
}
```

---

## 9. API 응답 포맷 & 에러 처리

### 응답 포맷

기존 `@/lib/api-response`의 `success(data)` / `failure(message)` 포맷 유지:

```typescript
// 성공
{ success: true, data: T }

// 실패
{ success: false, error: string }
```

### Route Handler 에러 처리 패턴

```typescript
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { withRetry } from '@/lib/netbox/retry';

export async function GET(req: NextRequest) {
  try {
    const data = await withRetry(() => netboxAll('/api/dcim/devices/', params));
    return success(data);
  } catch (e) {
    if (e instanceof NetBoxHttpError) {
      return failure(e.sanitizedMessage, { status: e.status });
    }
    // Network-level errors (DNS, TLS, timeout) → 502
    console.error('NetBox unreachable:', e);
    return failure('NetBox service temporarily unavailable', { status: 502 });
  }
}
```

### NetBoxHttpError 래퍼

`netboxAll`에서 발생하는 오류를 일관된 형태로 변환. **민감 정보 유출 방지**를 위해 전체 response body 대신 `detail` 필드만 노출:

```typescript
export class NetBoxHttpError extends Error {
  status: number;
  sanitizedMessage: string;

  constructor(status: number, body: unknown) {
    const detail = typeof body === 'object' && body !== null && 'detail' in body
      ? (body as { detail: string }).detail
      : 'NetBox request failed';
    super(detail);
    this.status = status;
    this.sanitizedMessage = detail;
  }
}
```

### 에러 시나리오 매트릭스

| 상황 | 처리 | HTTP 상태코드 |
|------|------|:--:|
| NetBox 200 OK | `success(data)` | 200 |
| NetBox 201 Created | `success(data)` | 201 |
| NetBox 400 validation | `failure(netbox.detail)` | 400 |
| NetBox 401 Unauthorized | `failure("Authentication failed")` + 관리자 로그 | 401 |
| NetBox 403 Forbidden | `failure("Permission denied")` | 403 |
| NetBox 404 Not Found | `failure("Resource not found")` | 404 |
| NetBox 409 Conflict | `failure("Resource conflict")` | 409 |
| NetBox 429 Rate Limited | `Retry-After` 헤더 기반 재시도 → 실패 시 502 | 502 |
| NetBox 500 Internal Error | `failure("NetBox internal error")` | 502 |
| NetBox 503 Maintenance | Stale 캐시 fallback → 없으면 502 | 502 |
| Zod 검증 실패 | `failure(zod.errors)` | 400 |
| DNS 실패 / ECONNREFUSED | `failure("NetBox service unavailable")` | 502 |
| TLS 오류 | `failure("NetBox connection failed")` | 502 |
| 타임아웃 (30초) | `failure("Request timeout")` | 504 |
| 캐시 만료 + NetBox 장애 | Stale 캐시 사용 → `success(staleData)` + 경고 로그 | 200 |

### NetBox API 스키마 버전 관리

```
src/lib/netbox/
  ├── netbox-openapi-v4.6.json   ← 버전 명시한 스키마 원본 (git 관리)
  ├── schema.d.ts                ← 자동 생성 (git ignore)
  └── ...
```

`netbox:update` 실행 시:
1. `curl ${NETBOX_BASE_URL}/api/schema/` → `netbox-openapi-v{version}.json`
2. `openapi-typescript` → `schema.d.ts`
3. CI에서 이전 스키마와 새 스키마 diff → 변경사항 검토

NetBox 업그레이드 시 이전 스키마 파일은 보존하여 롤백 가능하게 한다.

---

## 10. 단계별 구현 계획 (Phase 1)

### Phase 1-1: 인프라 구축

- `openapi-typescript` + `openapi-fetch` 설치
- NetBox `/api/schema/` → `src/lib/netbox/netbox-openapi-v4.x.json` 다운로드 스크립트 (`scripts/netbox-fetch-schema.sh`)
- `src/lib/netbox/schema.d.ts` 자동 생성 (npm script `netbox:generate`)
- `src/lib/netbox/client.ts` — Zod env 검증 + "use server" 지시어 + openapi-fetch 래퍼
- `src/lib/netbox/auto-paginate.ts` — raw fetch 기반 next URL 페이징, MAX_PAGES 안전장치, throttle
- `src/lib/netbox/cache.ts` — checkCache / fetchAndCache / invalidateCache (stale-while-revalidate)
- `src/lib/netbox/retry.ts` — exponential backoff withRetry
- `src/lib/netbox/paths.ts` — SCC 경로 → NetBox API 경로 매핑 (NETBOX_PATHS) + cache key builder (`buildCacheKey`)
- `src/lib/netbox/errors.ts` — NetBoxHttpError 래퍼 (민감 정보 제외)
- `src/lib/netbox/env.ts` — Zod envSchema 공유 모듈
- 환경변수 `NETBOX_BASE_URL`, `NETBOX_API_TOKEN`, `NETBOX_CACHE_TTL_SECONDS` 추가 (`.env.example` 업데이트)
- Prisma `NetBoxCache` 모델 + 마이그레이션 (url, data, expiresAt, staleUntil, hitCount + text_pattern_ops index)
- `.gitignore`: `src/lib/netbox/schema.d.ts` 추가

### Phase 1-2: Sites & Roles (참조 데이터, 읽기 전용)

- `src/modules/sites/` — Site, Rack, DeviceRole, Platform 조회
- `src/app/api/sites/` Route Handlers
- Site/Role Selector 컴포넌트
- **이유**: Device 생성 시 Site/Role 선택이 필요하므로 가장 먼저

### Phase 1-3: Devices (핵심)

- `src/modules/devices/` 전체 (CRUD)
- `src/app/api/devices/` Route Handlers
- Device 목록 테이블 + 생성/수정 폼
- **이유**: 가장 핵심적인 엔티티, 모든 것이 Device를 중심으로 연결됨

### Phase 1-4: Interfaces

- `src/modules/interfaces/` (읽기 위주)
- Device 상세에서 Interface 목록 표시
- 케이블 연결 정보 표시 (link_peers)

### Phase 1-5: IPAM

- 기존 `src/modules/ipam/` 제거
- NetBox IPAM 기반으로 재구현 (`prefixes`, `ip-addresses`)
- IP 할당/반납 기능

### Phase 1-6: Cables

- `src/modules/cables/` (생성/삭제)
- 두 Interface 간 Cable 연결/해제 UI

### Phase 1-7: Switch Mapping 통합

- `src/modules/switch-mapping/` 의 mock 데이터를 NetBox 실데이터로 전환
- 기존 `MOCK_DEVICES_BY_ROLE`, `MOCK_SWITCH_PORTS` 제거

---

## 11. 에러 처리

에러 시나리오 매트릭스는 [Section 9](#9-api-응답-포맷--에러-처리)에 통합되어 있다.

---

## 12. 테스트 전략

| 계층 | 도구 | 대상 |
|------|------|------|
| Unit | Vitest | `auto-paginate.ts` (MSW로 NetBox 페이징 모킹), `cache.ts`, `toDevice` 변환 함수 |
| Integration | Vitest | Route Handler + netboxAll (MSW) |
| E2E | Playwright | 실제 NetBox 인스턴스 대상 smoke test (선택적) |

## 13. 고려사항

- **NetBox API 버전**: 스키마가 `netbox-openapi-v{version}.json`에 버전 관리되므로 NetBox 업그레이드 시 스키마 재다운로드 → 재생성 → diff 검토.
- **Rate Limiting**: `netboxAll` 요청 간 100ms throttle. NetBox의 `X-RateLimit-Remaining` 헤더 모니터링.
- **캐시 만료 주기**: 실제 사용 패턴을 보고 `NETBOX_CACHE_TTL_SECONDS` 조정 (기본 5분).
- **폐쇄망**: NetBox 서버가 같은 폐쇄망 내에 있어야 함. `NETBOX_BASE_URL` 은 사설 CIDR(10.x, 172.16.x)로 제한 권장.
- **보안**: `NETBOX_API_TOKEN` 은 최소 권한(read+write)으로 발급. 읽기 전용 엔드포인트(sites, roles)에는 별도 `NETBOX_READONLY_TOKEN` 사용 검토 (Phase 2).
- **스키마 업데이트 CI**: `netbox:generate` 후 이전 schema.d.ts와 새 schema.d.ts diff 검사 → 변경사항 CHANGELOG 자동 생성.
- **Cross-user staleness**: mutation 후 다른 사용자의 브라우저는 최대 2분(L1 staleTime) 동안 stale 데이터를 볼 수 있음. Phase 2에서 broadcast channel 도입 가능.
