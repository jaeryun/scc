# 테스트 인프라 셋업 — 디자인

> 2026-06-15 · 브레인스토밍 결과
> 범위: **B** (도구 선정 + 인프라 셋업, 즉시 첫 테스트 실행 가능)

## 1. 목표

SCC 프로젝트에 자동화된 테스트 파이프라인을 도입한다.

- **단위/통합 테스트**: `bun test:unit`, `bun test:integration` 로컬에서 실행
- **E2E 테스트**: Playwright, main 브랜치에서 GitLab CI로 실행
- **PR 게이트**: lint + type-check + unit(커버리지 강제) + (develop 이상) integration + build + (main) e2e
- **기존 `docs/common/development/testing.md`**: 본 스펙을 반영해 갱신 (구현 완료 후)

## 2. 현재 상태

- **의존성**: `playwright@1.60`만 devDependency에 존재. 테스트 코드 0개
- **문서**: `docs/common/development/testing.md`가 "Vitest + Playwright" 결론을 이미 명시. 본 스펙의 결정으로 검증/갱신 예정
- **모듈 구조**: `src/modules/<name>/api/{types,service,queries,mutations}.ts` 4-레이어 — service.ts가 비즈니스 로직 단위 테스트의 1차 대상
- **DB**: `docker-compose.yml`에 Postgres — 동일 인스턴스에 `scc_test`, `scc_e2e` DB 추가

## 3. 결정 사항 (R1~R6)

| # | 항목 | 결정 |
|---|------|------|
| R1 | 컨테이너 이미지 | **사전 구성된 단일 이미지** — Bun + Playwright(브라우저 포함) + Postgres client가 사전 설치된 이미지. CI 안에서 다운로드 단계 없음. 정확한 태그명은 운영팀 제공 (placeholder: `scc-ci-runner:latest`) |
| R2 | GitLab 러너 | k8s 기반 — `image:` 자유 지정 가능. DinD 불필요 |
| R3 | 통합 테스트 DB 격리 | **truncate + seed** 방식 (트랜잭션-롤백 방식 채택 안 함 — Prisma `$transaction` 중첩 회피) |
| R4 | E2E 브랜치 | **main에서만** |
| R5 | 캐시 | GitLab cache (key: `${CI_COMMIT_REF_SLUG}`, paths: `node_modules/.cache`, `.bun/cache`). Playwright 브라우저는 이미지에 포함되어 캐시 불필요 |
| R6 | Playwright 패키지 | **`playwright` → `@playwright/test` 교체** |

## 4. 아키텍처

### 4.1 테스트 피라미드

```
        /\
       /E \        Playwright E2E (main에서만)
      /----\       e2e/*.spec.ts + POM
     / Int  \      Vitest + RTL + 실 DB (Docker / GitLab services)
/----------\
/   Unit     \    Vitest + vi.mock / MSW
/--------------\  src/lib, src/modules/<m>/api/service.ts
```

### 4.2 레이어별 책임

| 레이어 | 도구 | 대상 | DB 의존 |
|--------|------|------|---------|
| Unit | Vitest | `src/lib/` 순수 유틸, `service.ts` 비즈니스 로직 (Prisma mock) | 없음 |
| Integration | Vitest + RTL | `service.ts` (Prisma 실 호출), 컴포넌트, hook | 실 Postgres |
| E2E | Playwright | 사용자 플로우 (CRUD 페이지, 폼 제출) | staging-like DB (main) |

### 4.3 핵심 원칙

1. **단위 테스트의 mock 전략은 데이터 접근 방식에 따라 다름**:
   - **Prisma 직접 호출 모듈** (`view-settings/api/*.ts`, `demo/*/api/service.ts`): `vi.mock('@/lib/prisma')` — SQL 자체는 검증 안 함, 비즈니스 로직에 집중
   - **`apiClient` 호출 모듈** (`ipam/api/service.ts`, `cables/api/service.ts` 등): `vi.mock('@/lib/api-client')` — HTTP 호출을 가짜로 대체
   - **순수 유틸** (`src/lib/utils.ts`의 `formatBytes`, `cn` 등): mock 불필요
2. **통합 테스트는 truncate+seed** — 각 테스트 전 `scc_test` DB를 truncate 후 시드 주입. 실 SQL/제약조건/트랜잭션 회귀 검증
3. **컴포넌트 테스트는 MSW** — `apiClient`를 거치는 모든 네트워크 표준화
4. **E2E는 main에서만** — 비용 대비 효과. develop/staging은 unit + integration으로 커버
5. **테스트-빌드 분리** — `bun tsc --noEmit` + `bun run build`는 별도 잡 (기존 prebuild 패턴 유지)

## 5. 파일 레이아웃

### 5.1 신규 디렉터리 / 파일

```
scc/
├── vitest.config.ts                    # 신규
├── vitest.setup.ts                     # 신규
├── playwright.config.ts                # 신규
├── .gitlab-ci.yml                      # 신규
├── src/
│   ├── lib/
│   │   └── format.test.ts              # 신규 (단위, 1~2 케이스)
│   ├── mocks/                          # 신규
│   │   ├── handlers/
│   │   │   ├── index.ts
│   │   │   └── ipam.ts
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   └── index.ts
│   ├── modules/
│   │   └── ipam/
│   │       └── api/
│   │           ├── service.test.ts              # 신규 (단위, Prisma vi.mock)
│   │           └── service.integration.test.ts  # 신규 (실 DB, 선택)
│   ├── test-utils/                     # 신규
│   │   ├── prisma-test-db.ts           # truncate+seed 픽스처
│   │   ├── render.tsx                  # RTL render + Providers 래퍼
│   │   └── factories.ts                # @faker-js/faker로 테스트 데이터
├── e2e/                                # 신규
│   ├── fixtures/
│   │   └── auth.ts
│   ├── pages/                          # POM
│   │   └── home.ts
│   ├── example.spec.ts                 # 신규 (메인 페이지 로드)
│   └── ipam-create-subnet.spec.ts      # 신규 (E2E 첫 시나리오)
├── scripts/
│   ├── test-seed.ts                    # 신규 — scc_test용 시드
│   └── e2e-seed.ts                     # 신규 — scc_e2e용 시드
├── docker-compose.test.yml             # 신규 — scc_test, scc_e2e Postgres
```

### 5.2 컨벤션

| 파일 종류 | 위치 | 네이밍 |
|----------|------|--------|
| 단위 | 모듈 co-location | `<name>.test.ts(x)` |
| 통합 | 모듈 co-location | `<name>.integration.test.ts(x)` |
| 컴포넌트 | 모듈 co-location | `<component>.test.tsx` |
| E2E | `e2e/` | `*.spec.ts` |
| MSW handlers | `src/mocks/handlers/<도메인>.ts` | 도메인별 |
| POM | `e2e/pages/<view>.ts` | 뷰별 |

## 6. 도구 설정

### 6.1 `vitest.config.ts` (요지)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,integration.test}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,integration.test}.{ts,tsx}',
        'src/**/index.ts',
        'src/components/ui/**',
        'src/mocks/**',
        'src/test-utils/**',
        '**/*.d.ts',
      ],
      thresholds: {
        // lib 80% / api 70% → vitest는 디렉터리별 임계값 미지원
        // 80% 전역으로 통일, api 미달은 PR 리뷰에서 정성 확인
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: false,
      },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

**임계값 결정 근거**: vitest는 디렉터리별 임계값을 직접 지원하지 않음. 통일 안 하면 CI 스크립트가 복잡해져서 80% 전역으로 박음. 신규 파일 부담을 줄이려고 `perFile: false`. 안정화 후 `true`로 전환 검토.

### 6.2 `vitest.setup.ts`

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './src/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

### 6.3 `playwright.config.ts` (요지)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI ? undefined : {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### 6.4 신규 의존성

```jsonc
{
  "devDependencies": {
    "vitest": "^2.x",
    "@vitest/coverage-v8": "^2.x",
    "@vitejs/plugin-react": "^4.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jsdom": "^25.x",
    "msw": "^2.x",
    "@playwright/test": "^1.60"  // 기존 'playwright' 교체
  }
}
```

> ⚠️ 정확한 버전은 `bun install` 시점에 맞춰 결정.

### 6.5 `package.json` 스크립트 추가

```jsonc
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --exclude='**/*.integration.test.ts'",
    "test:integration": "vitest run --include='**/*.integration.test.ts'",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:test:seed": "bun scripts/test-seed.ts",
    "db:e2e:seed": "bun scripts/e2e-seed.ts"
  }
}
```

## 7. GitLab CI 파이프라인

### 7.1 잡 구성

| 잡 | 단계 | 서비스 | 트리거 |
|----|------|--------|--------|
| `lint` | test | — | 모든 브랜치 |
| `type-check` | test | — | 모든 브랜치 |
| `unit` | test | — | 모든 브랜치 (커버리지 강제) |
| `integration` | test | `postgres:16` | develop/staging/main |
| `build` | build | — | develop/staging/main |
| `e2e` | test | `postgres:16` | main |

### 7.2 `.gitlab-ci.yml` (요지)

```yaml
default:
  # 사전 구성된 CI 러너 이미지 (Bun + Playwright + Postgres client 사전 설치)
  # 정확한 태그명은 운영팀이 제공 — placeholder
  image: scc-ci-runner:latest
  tags: [scc-runner]

variables:
  # 서비스 컨테이너용 Postgres — k8s 러너가 pull 가능해야 함
  POSTGRES_IMAGE: postgres:16

.cache-bun: &bun-cache
  key: ${CI_COMMIT_REF_SLUG}
  paths: [.bun/cache, node_modules/.cache]
  policy: pull-push

lint:
  stage: test
  script: [bun install --frozen-lockfile, bun lint]
  cache: *bun-cache

type-check:
  stage: test
  script: [bun install --frozen-lockfile, bun tsc --noEmit]
  cache: *bun-cache

unit:
  stage: test
  script: [bun install --frozen-lockfile, bunx vitest run --coverage]
  coverage: '/All files\s*\|\s*([\d.]+)/'
  artifacts:
    when: always
    paths: [./coverage]
    reports: { coverage_report: coverage/coverage-summary.json }
  cache: *bun-cache

.integration-base: &integration-base
  services: [{ name: ${POSTGRES_IMAGE}, alias: postgres }]
  variables:
    POSTGRES_DB: scc_test
    POSTGRES_USER: scc
    POSTGRES_PASSWORD: scc
    DATABASE_URL: "postgresql://scc:scc@postgres:5432/scc_test"

integration:
  <<: *integration-base
  stage: test
  script:
    - bun install --frozen-lockfile
    - bunx prisma migrate deploy
    - bun run db:test:seed
    - bunx vitest run --include='**/*.integration.test.ts'
  rules:
    - if: $CI_COMMIT_BRANCH =~ /^(develop|staging|main)$/
    - if: $CI_MERGE_REQUEST_TARGET_BRANCH_NAME =~ /^(develop|staging|main)$/
  needs: [unit]

build:
  stage: build
  script: [bun install --frozen-lockfile, bun run prebuild, bun run build]
  rules:
    - if: $CI_COMMIT_BRANCH =~ /^(develop|staging|main)$/
    - if: $CI_MERGE_REQUEST_TARGET_BRANCH_NAME =~ /^(develop|staging|main)$/
  needs: [integration]

e2e:
  stage: test
  services: [{ name: ${POSTGRES_IMAGE}, alias: postgres }]
  variables:
    POSTGRES_DB: scc_e2e
    POSTGRES_USER: scc
    POSTGRES_PASSWORD: scc
    DATABASE_URL: "postgresql://scc:scc@postgres:5432/scc_e2e"
    BASE_URL: "http://localhost:3000"
    CI: "true"
  script:
    - bun install --frozen-lockfile
    - bunx prisma migrate deploy
    - bun run db:e2e:seed
    # Playwright 브라우저는 사전 설치된 이미지에 포함 → 설치 단계 생략
    - bun run build && bun start &
    - bunx playwright test
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  needs: [integration]
```

### 7.3 브랜치별 발화 매트릭스

| 잡 | feature | develop | staging | main |
|----|---------|---------|---------|------|
| lint | ✅ | ✅ | ✅ | ✅ |
| type-check | ✅ | ✅ | ✅ | ✅ |
| unit | ✅ | ✅ | ✅ | ✅ |
| integration | ❌ | ✅ | ✅ | ✅ |
| build | ❌ | ✅ | ✅ | ✅ |
| e2e | ❌ | ❌ | ❌ | ✅ |

## 8. 통합 테스트 격리 전략

**truncate + seed** (R3 결정).

```ts
// src/test-utils/prisma-test-db.ts (요지)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tables = ['IpAddress', 'Subnet', 'Device', 'Site']; // FK 역순

export async function resetTestDb() {
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );
}

export async function seedTestDb() {
  // 최소 시드 — 사이트 1개
  await prisma.site.create({ data: { name: 'Test Site' } });
}
```

**트랜잭션-롤백 채택 안 한 이유**: 코드 내부에서 `prisma.$transaction(...)` 호출 시 중첩 트랜잭션이 발생해 Prisma가 이를 지원하지 않아 실패. truncate+seed는 안전하지만 약간 느림 — 성능 이슈 시 revisit.

## 9. 샘플 테스트 (첫 PR에 포함)

### 9.1 `src/lib/utils.test.ts` — 단위, mock 불필요

`src/lib/format.ts`가 아닌 `src/lib/utils.ts`에 `formatBytes`가 존재함 (lib/index.md 기준).

```ts
import { describe, it, expect } from 'vitest';
import { formatBytes } from './utils';

describe('formatBytes', () => {
  it('formats bytes into human readable string', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(0)).toBe('0 B');
  });
});
```

### 9.2 `src/modules/view-settings/api/get-view-settings-handler.test.ts` — 단위, Prisma mock

`view-settings`는 Prisma를 직접 호출하는 모듈이라 `vi.mock('@/lib/prisma')` 패턴의 정석 사례. IPAM은 `apiClient`만 거치므로 다른 패턴 필요.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    viewSetting: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getViewSettingsHandler } from './get-view-settings-handler';

describe('getViewSettingsHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('설정이 없으면 기본값 반환', async () => {
    vi.mocked(prisma.viewSetting.findUnique).mockResolvedValue(null);
    // ... 구현된 기본값 구조에 맞춰 검증
  });

  it('설정이 있으면 그대로 반환', async () => {
    vi.mocked(prisma.viewSetting.findUnique).mockResolvedValue({
      userId: 'u1',
      // ... 실제 컬럼 구조에 맞춤
    } as any);
    // ...
  });
});
```

> 위 시그니처는 구현 시점에 `get-view-settings-handler.ts`의 실제 export와 Prisma `viewSetting` 모델에 맞춰 확정.

### 9.3 `src/modules/ipam/api/service.test.ts` — 단위, apiClient mock (보조 예시)

IPAM service는 `apiClient`를 거치므로 `vi.mock('@/lib/api-client')`로 mock.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from '@/lib/api-client';
import { createPrefix } from './service';

describe('createPrefix', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiClient에 POST 요청을 위임', async () => {
    vi.mocked(apiClient).mockResolvedValue({
      id: 1, prefix: '10.0.0.0/24', description: '', vlan: null, site: null, role: null,
    });
    await createPrefix({ prefix: '10.0.0.0/24' });
    expect(apiClient).toHaveBeenCalledWith(
      '/api/ipam/prefixes',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
```

### 9.4 `e2e/example.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('메인 페이지 로드', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SE Command Center/);
});
```

## 10. 로컬 워크플로우

```bash
# 1. 일회성 — docker compose에 test/e2e DB 추가
docker compose -f docker-compose.test.yml up -d
bun run db:test:seed

# 2. 개발 중 — 단위 워치
bun test:unit --watch

# 3. PR 올리기 전 — 풀 로컬 검증
bun lint && bun tsc --noEmit && bun test:coverage
docker compose -f docker-compose.test.yml exec postgres \
  psql -U scc -d scc_test -c "SELECT 1"
bun test:integration
bun test:e2e
```

## 11. 완료 기준 (DoD)

- [ ] `bun install` 후 `bun test:unit` 통과
- [ ] `docker compose -f docker-compose.test.yml up` 후 `bun test:integration` 통과
- [ ] `bun test:coverage` 시 80% 임계값 충족
- [ ] `bun test:e2e` 로컬에서 통과
- [ ] GitLab CI: feature MR에서 `lint + type-check + unit` 통과
- [ ] GitLab CI: develop MR에서 `+ integration + build` 통과
- [ ] GitLab CI: main 머지 후 `+ e2e` 통과
- [ ] `docs/common/development/testing.md` 갱신 (실제 셋업 결과 반영)
- [ ] 첫 PR에 `src/lib/utils.test.ts` + `src/modules/view-settings/api/get-view-settings-handler.test.ts` + `src/modules/ipam/api/service.test.ts` + `e2e/example.spec.ts` 포함

## 12. 후속 작업 (이번 스코프 밖)

- Storybook / 시각 회귀 테스트
- Stryker (변이 테스트)
- nightly 풀스위트
- staging DB가 production-like해지면 e2e를 staging에서도 발화
- 페이지 객체 패턴 본격 적용 (E2E 시나리오 누적 시)
