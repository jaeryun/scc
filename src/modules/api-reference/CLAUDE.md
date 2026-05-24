# API Reference 모듈

## 아키텍처: OpenAPI 스펙 + Scalar 렌더링

외부 시스템의 OpenAPI 스펙 문서를 Scalar API Reference로 렌더링하는 문서화 모듈입니다. 별도 백엔드나 데이터베이스 없이, 정적 OpenAPI JSON 파일을 브라우저에서 직접 fetch하여 렌더링합니다.

```
페이지 → registry.ts → specUrl 확인
                            ↓
                    DynamicScalarViewer → dynamic import (ssr: false)
                            ↓
                      ScalarViewer → @scalar/api-reference-react
                            ↓
                  public/api-specs/<id>/latest.json (브라우저 fetch)
```

| 계층               | 파일                                   | 설명                                        |
| ------------------ | -------------------------------------- | ------------------------------------------- |
| 레지스트리         | `api/registry.ts`                      | API 스펙 메타데이터 중앙 관리               |
| 타입               | `api/types.ts`                         | ApiSpecMeta(클라이언트), ServerConfig(서버) |
| 클라이언트 래퍼    | `components/dynamic-scalar-viewer.tsx` | next/dynamic으로 CSR 전용 로딩              |
| Scalar 뷰어        | `components/scalar-viewer.tsx`         | @scalar/api-reference-react 직접 렌더링     |
| 로딩 스켈레톤      | `components/scalar-loading.tsx`        | Scalar 레이아웃을 모방한 Skeleton           |
| Quick Start 가이드 | `components/quick-start-guide.tsx`     | curl 예제 + Quick Start 카드                |

- `public/api-specs/`는 브라우저에서 직접 접근 가능한 경로이므로, 별도 API Route 없이 fetch 가능.
- Scalar는 반드시 `dynamic import + ssr: false`로 로드 (서버 사이드에서 @scalar/api-reference-react를 import하면 빌드 오류 발생).

## 데이터 모델

### ApiSpecMeta (`api/types.ts`)

```typescript
type ApiCategory =
  | 'automation'
  | 'monitoring'
  | 'network'
  | 'storage'
  | 'compute'
  | 'security'
  | 'other';
type SpecStatus = 'draft' | 'stable' | 'deprecated';

interface ApiSpecMeta {
  id: string; // URL slug, registry 조회 키
  title: string; // 카드/페이지 제목
  description: string; // 카드 설명
  specUrl: string; // OpenAPI JSON 경로 (public/api-specs/...)
  category: ApiCategory; // 카테고리 (미래 필터링용)
  version: string; // 현재 버전
  versions?: string[]; // 지원 버전 목록 (미래)
  tags: string[]; // 태그 (카드에 Badge로 표시)
  status: SpecStatus; // draft | stable | deprecated
  icon: string; // Icons 객체 키
  officialDocsUrl?: string; // 공식 문서 링크
  githubUrl?: string; // GitHub 저장소 링크
}
```

### ApiSpecServerConfig (`api/types.ts`)

```typescript
interface ApiSpecServerConfig {
  authTypes?: ('api-key' | 'jwt' | 'basic' | 'oauth2')[];
  baseUrl?: string; // 실제 API 베이스 URL (절대 클라이언트에 노출 금지)
  rateLimit?: string; // Rate limit 정보 (예: "100/min")
}
```

- `ApiSpecMeta`는 클라이언트에서 사용 가능한 필드만 포함. `specUrl`은 public 경로이므로 안전.
- `ApiSpecServerConfig`는 서버 전용 필드. `baseUrl`, `authTypes`, `rateLimit`은 클라이언트 번들에 포함되면 안 됨.
- 현재 Phase 1에서는 `ApiSpecServerConfig`를 사용하지 않지만, Phase 2 "Try it" 기능에서 활용 예정.

## 레지스트리 (`api/registry.ts`)

```typescript
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
    githubUrl: 'https://github.com/semaphoreui/semaphore'
  }
];

export function getSpecById(id: string): ApiSpecMeta | undefined;
export function getAllSpecs(): ApiSpecMeta[];
```

- 새 API 스펙 추가 시 **이 배열에 1줄 추가**하면 인덱스 페이지와 동적 라우트에 자동 반영됨.
- `id`는 URL slug(`/api-reference/<id>`)와 `public/api-specs/<id>/` 디렉토리 이름 모두에 사용.

## 라우트 구조

| 경로                       | 페이지        | 설명                             |
| -------------------------- | ------------- | -------------------------------- |
| `/api-reference`           | 인덱스 페이지 | 카드 그리드로 등록된 API 나열    |
| `/api-reference/[service]` | 상세 페이지   | Scalar 뷰어 + Quick Start 가이드 |

- 인덱스 페이지: `src/app/(main)/api-reference/page.tsx` — RSC, `getAllSpecs()` 직렬 호출
- 상세 페이지: `src/app/(main)/api-reference/[service]/page.tsx` — RSC, `generateStaticParams()`로 SSG 지원
- 사이드바 내비게이션: `src/config/views.ts`의 `api-reference` 뷰에서 관리

## Scalar 설정 및 제약사항

### CSR 전용 (Phase 1)

- `@scalar/api-reference-react`는 브라우저 API(DOM)에 의존 → **반드시 CSR로만 로드**.
- `DynamicScalarViewer`에서 `dynamic(() => import(...), { ssr: false })`로 감싸서 사용.
- 로딩 중에는 `ScalarLoadingSkeleton`이 왼쪽 사이드바 + 오른쪽 본문 구조의 스켈레톤을 표시.

### Phase 1 비활성화 기능

- **Proxy 비활성화**: air-gapped 환경 + 보안상 이유로 Phase 1에서는 Scalar의 프록시 미사용.
- **"Try it" 비활성화**: 프록시 없이 브라우저에서 직접 API 호출 불가 → Phase 1에서는 요청 전송 기능 off.
- Phase 2: 자체 호스팅 프록시 도입 → SSRF allowlist + rate limiting 적용 후 "Try it" 활성화.

### 다크 모드 동기화

- `src/styles/scalar-overrides.css`에서 Scalar의 CSS 커스텀 프로퍼티를 shadcn/ui 테마 변수와 매핑.
- `hideDarkModeToggle: true`로 Scalar 내장 토글 비활성화 → 앱의 테마 시스템을 따름.

```css
.scalar-app {
  --scalar-color-1: var(--foreground);
  --scalar-color-2: var(--muted-foreground);
  --scalar-background-1: var(--background);
  --scalar-background-2: var(--muted);
  --scalar-border-color: var(--border);
  --scalar-color-accent: var(--primary);
}
```

## 새 API 레퍼런스 추가 방법

1. OpenAPI JSON 파일을 `public/api-specs/<id>/latest.json`에 배치
2. `api/registry.ts`의 `apiSpecRegistry` 배열에 새 항목 추가
3. `src/config/views.ts`의 `api-reference` 뷰 `navItems`에 항목 추가

```typescript
// registry.ts 예시
{
  id: 'new-service',
  title: 'New Service',
  description: '설명',
  specUrl: '/api-specs/new-service/latest.json',
  category: 'monitoring',
  version: 'v1.0.0',
  tags: ['monitoring'],
  status: 'draft',
  icon: 'api'
}
```

## 보안

- **절대 커밋 금지**: OpenAPI spec 파일에 내부 IP, 내부 도메인, 실제 인증 토큰 포함 시 pre-commit hook이 차단.
- **baseUrl/authTypes 분리**: 서버 측 정보(`ApiSpecServerConfig`)는 클라이언트 번들에 포함되지 않도록 `api/types.ts`에서 별도 인터페이스로 분리.
- **Spec 파일 경로**: `public/api-specs/`는 빌드 시 그대로 `/public`에 복사되므로, 공개해도 되는 정보만 포함해야 함.
- Phase 2 프록시 도입 시: SSRF 방지를 위한 allowlist, rate limiting, 인증 정보 중계 로직 추가 예정.

## 특별 규칙

### Scalar 버전 관리

- `@scalar/api-reference-react`는 peer dependency로 `@scalar/api-reference` 사용.
- 버전 업데이트 시 Scalar의 breaking changes를 확인하고 `scalar-overrides.css`의 CSS 변수명 변경 여부 점검.

### 정적 생성 (SSG)

- `[service]/page.tsx`의 `generateStaticParams()`로 빌드 시 모든 스펙 페이지를 정적 생성.
- 새 스펙 추가 후 반드시 `bun run build`로 정적 페이지 재생성 확인.

### 아이콘 등록

- `Icons` 객체(`src/components/icons.tsx`)에 `api`, `listTree`, `serverBolt`가 등록되어 있어야 함.
- 새 API의 `icon` 필드에 사용할 아이콘이 `Icons`에 없으면 먼저 등록 후 사용.
