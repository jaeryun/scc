# API Reference 페이지 설계 문서 (v3)

> 외부 솔루션 연동을 위한 OpenAPI 기반 API 문서 + 테스트 도구

**작성일**: 2026-05-24
**수정일**: 2026-05-24 (v3 — Security + Senior Developer + Sprint Prioritizer 리뷰 반영)
**상태**: 최종 검토
**관련 이슈**: 데모 페이지 개편 — "데이터 only" 카테고리 신설

---

## 1. 개요

인프라팀이 사용하는 외부 도구(SemaphoreUI, Ansible, 모니터링, 네트워크 장비 등)의 API를
OpenAPI 스펙 기반으로 문서화하고, 브라우저에서 바로 테스트할 수 있는 레퍼런스 페이지를 구축한다.

Scalar(`@scalar/api-reference-react`)를 사용하여 OpenAPI 문서를 렌더링하고,
Phase 2에서 "Try it" 기능으로 실시간 API 테스트를 제공한다.

---

## 2. 아키텍처

### 2.1 파일 구조

```
src/
├── app/(main)/api-reference/
│   ├── page.tsx                       # 인덱스 페이지 (API 레퍼런스 목록)
│   ├── layout.tsx                     # 공유 레이아웃
│   ├── error.tsx                      # 에러 바운더리 ('use client')
│   ├── not-found.tsx                  # 404 (Next.js 자동 감지)
│   └── [service]/
│       ├── page.tsx                   # 개별 API 뷰어 (/api-reference/semaphore)
│       ├── loading.tsx                # Suspense fallback
│       ├── error.tsx                  # 에러 바운더리 ('use client')
│       └── not-found.tsx              # 레지스트리에 없는 service 처리
├── modules/api-reference/
│   ├── api/
│   │   ├── types.ts                   # 타입 정의 (ApiSpecMeta, ApiSpecServerConfig 등)
│   │   └── registry.ts                # API 스펙 메타데이터 (클라이언트용)
│   └── components/
│       ├── scalar-viewer.tsx          # Scalar 래퍼 (default export, dynamic import용)
│       ├── scalar-loading.tsx         # 로딩 스켈레톤
│       └── quick-start-guide.tsx      # 인증/첫 호출 가이드 (default export)
└── public/api-specs/
    └── semaphore/
        └── latest.json                # Scalar Galaxy 예제 스펙
```

### 2.2 결정 사항

| 결정 | 내용 | 근거 |
|------|------|------|
| **스펙 위치** | `public/api-specs/` | 브라우저에서 URL로 직접 fetch 필요 |
| **라우트 구조** | `/api-reference/[service]` 동적 라우트 | Forms 패턴과 일관성, 북마크/공유 용이 |
| **뷰 분리** | `demo-components`에서 독립 뷰로 분리 | API Reference는 데모가 아닌 레퍼런스 |
| **SSR 처리** | `dynamic import + ssr: false` | Scalar은 완전한 CSR 컴포넌트 |
| **메타데이터** | `api/registry.ts`에서 중앙 관리 | 신규 API 추가 시 한 줄 수정 |
| **프록시** | Phase 1: 비활성화, Phase 2: 자체 구현 | 폐쇄망 + 외부 프록시 보안 리스크 |
| **Try it** | Phase 1: 비활성화, Phase 2: 자체 프록시 연동 | CORS + 인증 헤더 유출 방지 |
| **타입 분리** | `ApiSpecMeta`(클라이언트) / `ApiSpecServerConfig`(서버) | 민감 정보(`baseUrl`, `authTypes`) 클라이언트 노출 방지 |

---

## 3. 타입 정의

### 3.1 `modules/api-reference/api/types.ts`

```typescript
export type ApiCategory =
  | 'automation'     // Ansible, Semaphore, Terraform
  | 'monitoring'     // Prometheus, Grafana
  | 'network'        // 스위치, 라우터, 방화벽
  | 'storage'        // NAS, SAN
  | 'compute'        // Proxmox, VMware
  | 'security'       // Vault, Keycloak
  | 'other';

export type SpecStatus = 'draft' | 'stable' | 'deprecated';

/** 클라이언트 번들에 포함되는 메타데이터 */
export interface ApiSpecMeta {
  id: string;
  title: string;
  description: string;
  specUrl: string;            // public/ 기준 상대 URL
  category: ApiCategory;
  version: string;
  versions?: string[];
  tags: string[];
  status: SpecStatus;
  icon: string;
  officialDocsUrl?: string;
  githubUrl?: string;
}

/** 서버 전용 — 클라이언트 번들에 포함되지 않음 */
export interface ApiSpecServerConfig {
  authTypes?: ('api-key' | 'jwt' | 'basic' | 'oauth2')[];
  baseUrl?: string;           // 환경변수에서 로드
  rateLimit?: string;
}
```

---

## 4. 레지스트리

### 4.1 `modules/api-reference/api/registry.ts`

```typescript
import type { ApiSpecMeta } from './types';

export const apiSpecRegistry: ApiSpecMeta[] = [
  {
    id: 'semaphore',
    title: 'SemaphoreUI',
    description: '오픈소스 Ansible 웹 UI의 REST API 레퍼런스',
    specUrl: '/api-specs/semaphore/latest.json',
    category: 'automation',
    version: 'v2.10.0',
    tags: ['automation', 'ansible', 'ci-cd'],
    status: 'draft',
    icon: 'serverBolt',
    officialDocsUrl: 'https://docs.semaphoreui.com',
    githubUrl: 'https://github.com/semaphoreui/semaphore',
  },
];

export function getSpecById(id: string): ApiSpecMeta | undefined {
  return apiSpecRegistry.find((s) => s.id === id);
}

export function getAllSpecs(): ApiSpecMeta[] {
  return apiSpecRegistry;
}
```

**중요**: `ApiSpecMeta`에는 민감 정보(`baseUrl`, `authTypes`, `rateLimit`)가
포함되지 않습니다. 이 값들은 서버 전용 환경변수와 `ApiSpecServerConfig`로 관리됩니다.

---

## 5. 페이지 구현

### 5.1 인덱스 페이지 (`app/(main)/api-reference/page.tsx`)

- `demo-components/page.tsx`의 카드 그리드 패턴 차용
- 레지스트리의 모든 API를 카드로 표시
- 상태 뱃지(draft/stable/deprecated), 버전, 태그 표시
- **Phase 1**: 필터 없음 (아이템 1개이므로). Phase 2에서 3개 이상 등록 시 텍스트 필터 추가
- `PageContainer` 사용, `generateMetadata` export

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { getAllSpecs } from '@/modules/api-reference/api/registry';

export const metadata: Metadata = {
  title: 'API Reference',
  description: '외부 시스템 통합을 위한 OpenAPI 스펙 문서 모음입니다.',
};

export default function ApiReferenceIndexPage() {
  const specs = getAllSpecs();

  return (
    <PageContainer
      pageTitle='API Reference'
      pageDescription='외부 시스템 통합을 위한 OpenAPI 스펙 문서 모음입니다.'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {specs.map((spec) => {
          const Icon = Icons[spec.icon as keyof typeof Icons] || Icons.api;
          return (
            <Link href={`/api-reference/${spec.id}`} key={spec.id} className='block group'>
              <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                      <Icon className='h-5 w-5' />
                    </div>
                    {spec.title}
                  </CardTitle>
                  <CardDescription>{spec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    <Badge variant='outline'>{spec.version}</Badge>
                    <Badge variant={spec.status === 'stable' ? 'default' : 'secondary'}>
                      {spec.status}
                    </Badge>
                    {spec.tags.map((tag) => (
                      <Badge key={tag} variant='outline' className='text-xs'>{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
```

### 5.2 서비스별 페이지 (`app/(main)/api-reference/[service]/page.tsx`)

```
┌─────────────────────────────────────────────────────┐
│  [PageContainer]                                     │
│  pageTitle: "SemaphoreUI API Reference"              │
│  pageDescription: "CI/CD 파이프라인 자동화 REST API"  │
├─────────────────────────────────────────────────────┤
│  Quick Start Guide                                   │
│  - curl 단일 예제 (복사-붙여넣기 바로 동작)           │
│  - Phase 2: 인증 가이드, 다중언어, 에러 코드 추가      │
├─────────────────────────────────────────────────────┤
│  Scalar API Reference (full width)                   │
│  - OpenAPI 스펙 기반 인터랙티브 문서                  │
│  - Phase 1: "Try it" 비활성화                        │
└─────────────────────────────────────────────────────┘
```

```tsx
// app/(main)/api-reference/[service]/page.tsx — 서버 컴포넌트

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { getAllSpecs, getSpecById } from '@/modules/api-reference/api/registry';
import { QuickStartGuide } from '@/modules/api-reference/components/quick-start-guide';
import { ScalarLoadingSkeleton } from '@/modules/api-reference/components/scalar-loading';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const spec = getSpecById(service);
  if (!spec) return { title: 'Not Found' };
  return {
    title: `${spec.title} API Reference`,
    description: spec.description,
  };
}

export async function generateStaticParams() {
  return getAllSpecs().map((spec) => ({ service: spec.id }));
}

const DynamicScalarViewer = dynamic(
  () => import('@/modules/api-reference/components/scalar-viewer'),
  { ssr: false, loading: () => <ScalarLoadingSkeleton /> }
);

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const spec = getSpecById(service);
  if (!spec) notFound();

  return (
    <PageContainer
      pageTitle={`${spec.title} API Reference`}
      pageDescription={spec.description}
    >
      <QuickStartGuide spec={spec} />
      <DynamicScalarViewer specUrl={spec.specUrl} />
    </PageContainer>
  );
}
```

### 5.3 Scalar 뷰어 (`modules/api-reference/components/scalar-viewer.tsx`)

```tsx
'use client'

import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'
import { cn } from '@/lib/utils'

interface ScalarViewerProps {
  specUrl: string
  className?: string
}

export default function ScalarViewer({ specUrl, className }: ScalarViewerProps) {
  return (
    <div className={cn('w-full', className)} role='region' aria-label='API Reference'>
      <ApiReferenceReact
        configuration={{
          spec: { url: specUrl },
          // Phase 1: 프록시 비활성화 (폐쇄망 + 보안)
          // Phase 2: 자체 프록시 사용 시 SCALAR_PROXY_URL 환경변수 (NEXT_PUBLIC_ 접두사 금지)
          hideDarkModeToggle: true,
          hideSearch: false,
        }}
      />
    </div>
  )
}
```

### 5.4 로딩 스켈레톤 (`modules/api-reference/components/scalar-loading.tsx`)

```tsx
export function ScalarLoadingSkeleton() {
  return (
    <div className='flex w-full min-h-[600px] gap-4 p-4' aria-hidden='true'>
      {/* 사이드바 영역 */}
      <div className='hidden w-64 flex-col gap-3 lg:flex'>
        <div className='bg-muted h-6 w-full animate-pulse rounded' />
        <div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
        <div className='bg-muted h-4 w-5/6 animate-pulse rounded' />
        <div className='bg-muted h-4 w-2/3 animate-pulse rounded' />
      </div>
      {/* 메인 콘텐츠 영역 */}
      <div className='flex flex-1 flex-col gap-4'>
        <div className='bg-muted h-8 w-48 animate-pulse rounded' />
        <div className='bg-muted h-4 w-full animate-pulse rounded' />
        <div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
        <div className='bg-muted h-32 w-full animate-pulse rounded' />
      </div>
    </div>
  )
}
```

### 5.5 Quick Start 가이드 (`modules/api-reference/components/quick-start-guide.tsx`)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiSpecMeta } from '@/modules/api-reference/api/types'

interface QuickStartGuideProps {
  spec: ApiSpecMeta
}

export default function QuickStartGuide({ spec }: QuickStartGuideProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-lg'>Quick Start</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <h3 className='text-sm font-semibold mb-1'>첫 API 호출</h3>
          <pre className='bg-muted p-3 rounded-md text-sm overflow-x-auto'>
            <code>
              {`curl ${spec.officialDocsUrl || 'https://semaphore.example.com/api'}/projects`}
            </code>
          </pre>
        </div>
        <p className='text-sm text-muted-foreground'>
          Phase 2에서 인증 가이드, 다중 언어 예제(TS/Python), 에러 코드 테이블이 추가됩니다.
        </p>
      </CardContent>
    </Card>
  )
}
```

### 5.6 에러 바운더리 (`app/(main)/api-reference/[service]/error.tsx`)

```tsx
'use client'

import { Button } from '@/components/ui/button'

export default function ApiReferenceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='flex flex-col items-center justify-center p-12'>
      <h2 className='text-xl font-semibold mb-2'>API Reference 로딩 실패</h2>
      <p className='text-muted-foreground mb-4 text-sm'>스펙 파일을 불러오는 중 오류가 발생했습니다.</p>
      <Button onClick={reset}>재시도</Button>
    </div>
  )
}
```

**참고**: 프로덕션 환경에서는 원본 `error.message`를 사용자에게 직접 노출하지 않습니다.

### 5.7 not-found 처리 (`app/(main)/api-reference/[service]/not-found.tsx`)

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ApiReferenceNotFound() {
  return (
    <div className='flex flex-col items-center justify-center p-12'>
      <h2 className='text-xl font-semibold mb-2'>API Reference를 찾을 수 없습니다</h2>
      <p className='text-muted-foreground mb-4 text-sm'>
        요청하신 API 레퍼런스가 존재하지 않거나 이동되었습니다.
      </p>
      <Button asChild>
        <Link href='/api-reference'>전체 목록 보기</Link>
      </Button>
    </div>
  )
}
```

---

## 6. 네비게이션 업데이트

### 6.1 `src/config/views.ts`

```typescript
{
  id: 'api-reference',
  label: 'API Reference',
  icon: 'api',
  navItems: [
    { title: 'All APIs', href: '/api-reference', icon: 'listTree' },
    { title: 'SemaphoreUI', href: '/api-reference/semaphore', icon: 'serverBolt' },
  ]
}
```

### 6.2 `src/config/nav-config.ts`

```typescript
{
  label: 'API Reference',
  items: [
    {
      title: 'SemaphoreUI',
      url: '/api-reference/semaphore',
      icon: 'serverBolt',
      isActive: false,
      access: { requireOrg: true },
      items: []
    },
  ]
}
```

---

## 7. 테마 통합

Scalar은 자체 테마 시스템을 가지므로, 프로젝트 OKLCH 테마와 완전 통합은
Phase 2로 미룬다. Phase 1에서는 최소한의 CSS 변수 오버라이드로 다크모드 동기화만 처리한다.

```css
/* src/styles/scalar-overrides.css */
.scalar-app {
  --scalar-color-1: var(--foreground);
  --scalar-color-2: var(--muted-foreground);
  --scalar-background-1: var(--background);
  --scalar-background-2: var(--muted);
  --scalar-border-color: var(--border);
  --scalar-color-accent: var(--primary);
}
```

`layout.tsx`에서 이 CSS를 import한다.

---

## 8. 보안 설계

### 8.1 클라이언트/서버 타입 분리 (🔴 P0)

`ApiSpecMeta`(클라이언트 노출용)와 `ApiSpecServerConfig`(서버 전용)을 엄격히 분리한다:

| 필드 | 클라이언트 | 서버 | 이유 |
|------|-----------|------|------|
| `id`, `title`, `description`, `specUrl` | ✅ | - | 렌더링에 필요 |
| `category`, `version`, `tags`, `status`, `icon` | ✅ | - | 필터링/표시에 필요 |
| `officialDocsUrl`, `githubUrl` | ✅ | - | 링크 표시에 필요 |
| `baseUrl`, `authTypes`, `rateLimit` | ❌ | ✅ | 민감 정보 — 클라이언트 노출 금지 |

### 8.2 CORS & 프록시

Phase 1에서는 `public/`의 정적 JSON을 사용하므로 CORS 문제 없음.
Scalar의 `proxyUrl`은 **폐쇄망 환경에서 외부 서버 연결 불가** + **API 키 유출 리스크**로 비활성화.

Phase 2 자체 프록시 설계 시 포함할 사항:
- **SSRF 방지**: `baseUrl` allowlist로만 요청 전달
- **레이트 리미팅**: API 라우트 자체에 rate limit
- **API 키 서버 측 주입**: 클라이언트는 키를 모르고, 프록시가 서버 환경변수에서 주입
- **환경변수**: `SCALAR_PROXY_URL` (`NEXT_PUBLIC_` 접두사 금지)

```
src/app/api/api-specs/proxy/route.ts
- 요청 method, headers 전달 (인증 헤더만, 바디 로깅 금지)
- allowlist 검증 (baseUrl 기준)
- CORS 헤더 설정
```

### 8.3 스펙 sanitize

`public/api-specs/`에 커밋 전 internal endpoint sanitize 규칙:
1. IP 주소 검출 금지 (`\b([0-9]{1,3}\.){3}[0-9]{1,3}\b`)
2. 내부 도메인 검출 금지 (`\.(internal|local|corp|lan)\b`)
3. `servers[].url`에 내부 호스트명 금지
4. description에 하드코딩된 예제 URL/토큰 제거

**Pre-commit hook** (Phase 1에 포함):

```bash
#!/bin/bash
# .git/hooks/pre-commit
! grep -rE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' public/api-specs/ || \
  (echo "ERROR: IP addresses found in API specs" && exit 1)
! grep -rE '\.(internal|local|corp|lan)\b' public/api-specs/ || \
  (echo "ERROR: Internal domains found in API specs" && exit 1)
```

### 8.4 Phase 1 인증 부재 대응

Phase 1은 Clerk/Sentry가 제거된 상태이므로 모든 `public/` 경로가 인증 없이 접근 가능하다.
`public/api-specs/` 파일이 노출되는 위험을 완화하기 위해:

1. **스펙 파일 sanitize** (8.3의 pre-commit hook)
2. **민감 정보 제거**: `baseUrl`, `authTypes`는 클라이언트 번들에서 제외 (8.1의 타입 분리)
3. **Phase 2**: 스펙 파일을 API Route로 서빙하여 인증 확인

---

## 9. 확장 계획

### 9.1 버전 관리

```
public/api-specs/
└── semaphore/
    ├── v2.8.0.json
    ├── v2.9.0.json
    ├── v2.10.0.json
    └── latest.json → v2.10.0.json
```

버전별 접근은 Phase 2에서 페이지 내 셀렉터로 처리.

### 9.2 신규 API 추가 절차

1. `public/api-specs/<id>/latest.json`에 OpenAPI 스펙 추가
2. `modules/api-reference/api/registry.ts`에 메타데이터 1행 추가
3. `views.ts`에 navItem 추가 (선택)

레지스트리가 5개 이상으로 커지면 파일 분리 패턴으로 리팩토링:
```
api/registry/
├── semaphore.ts
├── ansible.ts
├── index.ts
```

---

## 10. 구현 순서 (우선순위 재조정)

### P0 — 이번 스프린트 (핵심 기능)

| 단계 | 작업 | 예상 공수 |
|------|------|-----------|
| 1 | `@scalar/api-reference-react` 설치 + `npm audit` | 30분 |
| 2 | 타입 정의 (`api/types.ts`) | 20분 |
| 3 | 레지스트리 (`api/registry.ts`) | 20분 |
| 4 | Scalar Galaxy 예제 스펙 (`public/api-specs/semaphore/latest.json`) | 15분 |
| 5 | Pre-commit hook (스펙 sanitize) | 15분 |
| 6 | Scalar 뷰어 컴포넌트 (default export, dynamic import) | 30분 |
| 7 | 로딩 스켈레톤 + `error.tsx` + `not-found.tsx` | 1시간 |
| 8 | 서비스별 페이지 (`/api-reference/[service]`) + `generateStaticParams` | 1시간 |
| 9 | 네비게이션 등록 (views.ts + nav-config.ts, `access` 포함) | 30분 |

### P1 — 이번 스프린트 (P0 이후)

| 단계 | 작업 | 예상 공수 |
|------|------|-----------|
| 10 | 인덱스 페이지 (`/api-reference`) | 1시간 |
| 11 | CSS 오버라이드 (다크모드 동기화) | 20분 |
| 12 | Quick Start 가이드 (curl 예제 1개) | 30분 |
| 13 | 번들 크기 측정 (Lighthouse/LiteTree) | 15분 |
| 14 | 접근성 검증 (키보드 네비게이션, 스크린 리더) | 30분 |

### P2 — 다음 스프린트

| 단계 | 작업 | 비고 |
|------|------|------|
| 15 | 인덱스 텍스트 필터 | API 3개 이상 등록 시 |
| 16 | Quick Start 확장 (인증 가이드, TS/Python, 에러 코드) | Try it 활성화 시점 |
| 17 | kbar 검색 등록 | |
| 18 | 자체 프록시 라우트 (`/api/api-specs/proxy`) | 별도 설계 문서 필요 |
| 19 | Scalar 테마 완전 통합 (OKLCH 매핑) | |
| 20 | 레지스트리 파일 분리 | 5개 이상 등록 시 |

---

## 11. Super-MVP 증분 전략

전체 Phase 1을 한 번에 구현하기 전에, 기술적 리스크를 먼저 검증하는 접근:

```
Step 1 (반나절): Super-MVP
  1. @scalar/api-reference-react 설치
  2. public/api-specs/semaphore/latest.json 추가
  3. app/(main)/api-reference/page.tsx (인덱스 없이 바로 Scalar)
  4. scalar-viewer.tsx (dynamic import + ssr: false)
  5. views.ts + nav-config.ts 등록
  → 검증 포인트: Scalar가 next.config, 테마, CSS isolation과 충돌하지 않는가?

Step 2 (1~2일): MVP+
  Super-MVP + error/not-found + 로딩 스켈레톤 + CSS 오버라이드 + [service] 동적 라우트

Step 3 (2~3일): Full Phase 1
  MVP+ + 타입/레지스트리 + 인덱스 페이지 + Quick Start(curl 1개) + kbar
```

---

## 12. 변경 이력

| 버전 | 주요 변경 |
|------|-----------|
| v1 | 초안. 3개 서브에이전트 리뷰 (Frontend / Architect / DX) |
| v2 | P0 수정: 프록시 비활성화, registry 위치, ApiCategory 분리, 컨벤션 준수 (PageContainer/Metadata/RBAC/error.tsx) |
| v3 | 3개 신규 리뷰 반영: Security (타입 분리, sanitize hook), Senior Dev (8개 import 누락 수정, Icons.list→listTree, RelatedResources 통합), Sprint Prioritizer (우선순위 재조정, Quick Start 간소화, Super-MVP 도입, 누락 항목 추가) |
