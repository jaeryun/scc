# 테스트 인프라 셋업 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SCC 프로젝트에 Vitest(단위/통합) + Playwright(E2E) + GitLab CI(브랜치별 게이트) 테스트 파이프라인을 셋업한다. 첫 PR에 lib/service/e2e 샘플 테스트가 포함된다.

**Architecture:** 3계층 피라미드 (Unit: `vi.mock`, Integration: 실 Postgres + truncate+seed, E2E: Playwright). 단일 CI 러너 이미지(`Dockerfile.ci-runner`)로 Bun + Playwright Chromium 사전 설치. k8s GitLab 러너에서 `image:`로 직접 사용.

**Tech Stack:** Vitest 2.x, @testing-library/react 16.x, MSW 2.x, @playwright/test 1.60.x, Bun (런타임/스크립트), Prisma, TanStack Query

**참조 스펙:** `docs/superpowers/specs/2026-06-15-test-infra-design.md`

---

## 작업 순서

12개 태스크, 5개 Phase. 각 태스크는 2-5분 단계 + 1 커밋.

- **Phase 1 — 기반 (5 태스크)**: 의존성, Dockerfile, vitest/playwright config, MSW/test-utils 스켈레톤, docker-compose
- **Phase 2 — 단위 샘플 (2 태스크)**: `utils.test.ts`, `get-view-settings-handler.test.ts`
- **Phase 3 — apiClient mock + E2E (2 태스크)**: `ipam/service.test.ts`, `e2e/example.spec.ts`
- **Phase 4 — 시드 + CI (2 태스크)**: 시드 스크립트, `.gitlab-ci.yml`
- **Phase 5 — 문서 (1 태스크)**: `testing.md` 갱신

---

## Task 1: `Dockerfile.ci-runner` 작성

**Files:**
- Create: `Dockerfile.ci-runner`

- [ ] **Step 1: 파일 생성**

Write `Dockerfile.ci-runner`:
```dockerfile
# Bun + Playwright(Chromium) 사전 설치된 CI 러너 이미지
# 사용: docker build -f Dockerfile.ci-runner -t registry.scc.local/ci-runner:1.0.0 .
FROM oven/bun:1.2.10-debian

# Playwright Chromium + 시스템 의존성
RUN bunx playwright@1.60.0 install --with-deps chromium

LABEL org.opencontainersimage.source="https://github.com/scc/scc"
LABEL org.opencontainersimage.description="SCC CI runner: Bun + Playwright + Chromium"
```

- [ ] **Step 2: 빌드 가능 여부 dry-run**

Run: `docker build -f Dockerfile.ci-runner -t scc-ci-runner:dryrun .`
Expected: 빌드 성공. (네트워크 접근 가능 시) 또는 docker가 없으면 "command not found" — 이 경우 Step 3만 진행하고 빌드는 사후에.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add Dockerfile.ci-runner
git commit -m "feat(testing): CI 러너 이미지 Dockerfile 추가

Bun 1.2.10 + Playwright 1.60 Chromium 사전 설치.
사내 레지스트리에 빌드/푸시 후 .gitlab-ci.yml에서 참조.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `package.json` 의존성 + 스크립트 갱신

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 새 devDependencies 추가**

`package.json`의 `devDependencies`에 다음 추가:
```json
"vitest": "^2.1.9",
"@vitest/coverage-v8": "^2.1.9",
"@vitejs/plugin-react": "^4.3.4",
"@testing-library/react": "^16.1.0",
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/user-event": "^14.5.2",
"jsdom": "^25.0.1",
"msw": "^2.7.0",
"@playwright/test": "^1.60.0"
```

- [ ] **Step 2: 기존 `playwright` 제거**

`devDependencies`에서 `"playwright": "^1.60.0"` 한 줄을 **삭제**한다 (R6 결정: `@playwright/test`로 교체).

- [ ] **Step 3: scripts 추가**

`scripts` 객체에 다음을 추가:
```json
"test": "vitest",
"test:unit": "vitest run --exclude='**/*.integration.test.ts'",
"test:integration": "vitest run --include='**/*.integration.test.ts'",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"db:test:seed": "bun scripts/test-seed.ts",
"db:e2e:seed": "bun scripts/e2e-seed.ts"
```

- [ ] **Step 4: 의존성 설치**

Run: `bun install`
Expected: lockfile 갱신, `node_modules/`에 새 패키지 추가. 에러 없음.

- [ ] **Step 5: 커밋**

```bash
cd /Users/jerry/dev/scc
git add package.json bun.lock
git commit -m "feat(testing): Vitest + RTL + MSW + Playwright 의존성 추가

playwright → @playwright/test 교체. 테스트 스크립트 7개 추가.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: `vitest.config.ts` + `vitest.setup.ts` 작성

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/mocks/handlers/index.ts`
- Create: `src/mocks/handlers/ipam.ts`
- Create: `src/mocks/server.ts`
- Create: `src/mocks/browser.ts`
- Create: `src/mocks/index.ts`
- Create: `src/test-utils/render.tsx`
- Create: `src/test-utils/factories.ts`
- Create: `src/test-utils/prisma-test-db.ts`

- [ ] **Step 1: `vitest.config.ts` 작성**

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
        '**/*.d.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: false
      }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
```

- [ ] **Step 2: `vitest.setup.ts` 작성**

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

- [ ] **Step 3: MSW handlers 스켈레톤**

`src/mocks/handlers/ipam.ts`:
```ts
import { http, HttpResponse } from 'msw';

export const ipamHandlers = [
  http.get('/api/ipam/prefixes', () =>
    HttpResponse.json([
      { id: 1, prefix: '10.0.0.0/24', description: '', vlan: null, site: null, role: null }
    ])
  )
];
```

`src/mocks/handlers/index.ts`:
```ts
import { ipamHandlers } from './ipam';
export const handlers = [...ipamHandlers];
```

- [ ] **Step 4: MSW server/browser**

`src/mocks/server.ts`:
```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

`src/mocks/browser.ts`:
```ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
export const worker = setupWorker(...handlers);
```

`src/mocks/index.ts`:
```ts
export { server } from './server';
export { worker } from './browser';
```

- [ ] **Step 5: test-utils 스켈레톤**

`src/test-utils/render.tsx`:
```tsx
import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
}

function Wrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Wrapper, ...options });
}
```

`src/test-utils/factories.ts`:
```ts
import { faker } from '@faker-js/faker';

export function makeSite(overrides: Partial<{ name: string }> = {}) {
  return { name: overrides.name ?? faker.company.name() };
}

export function makeSubnet(overrides: Partial<{ networkCidr: string; siteId: number }> = {}) {
  return {
    networkCidr: overrides.networkCidr ?? faker.internet.ipv4() + '/24',
    siteId: overrides.siteId ?? 1
  };
}
```

`src/test-utils/prisma-test-db.ts`:
```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];

export async function resetTestDb() {
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );
}

export async function seedTestDb() {
  await prisma.site.create({ data: { name: 'Test Site' } });
}

export { prisma };
```

- [ ] **Step 6: 빌드 검증**

Run: `bun tsc --noEmit`
Expected: 에러 없음. (새로 추가한 파일들의 import 경로가 모두 해결됨)

- [ ] **Step 7: 커밋**

```bash
cd /Users/jerry/dev/scc
git add vitest.config.ts vitest.setup.ts src/mocks/ src/test-utils/
git commit -m "feat(testing): Vitest/MSW/test-utils 스켈레톤 추가

- vitest.config.ts: jsdom, 커버리지 임계값 80% 전역
- vitest.setup.ts: MSW server, RTL cleanup
- src/mocks/: MSW handlers/server/browser
- src/test-utils/: render, factories, prisma-test-db

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `playwright.config.ts` 작성

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: 파일 작성**

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
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'bun dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000
      }
});
```

- [ ] **Step 2: 커밋**

```bash
cd /Users/jerry/dev/scc
git add playwright.config.ts
git commit -m "feat(testing): Playwright 설정 추가

Chromium only, CI에서 2 workers, e2e/ 디렉터리.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: `docker-compose.test.yml` 작성

**Files:**
- Create: `docker-compose.test.yml`

- [ ] **Step 1: 파일 작성**

```yaml
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: scc
      POSTGRES_PASSWORD: scc
      POSTGRES_DB: scc
    ports:
      - '5433:5432'
    volumes:
      - pgdata-test:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U scc']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata-test:
```

> 기존 `docker-compose.yml`의 `db` 서비스 (포트 5432)와 분리. 테스트용은 5433으로 충돌 회피. 마이그레이션 시 `scc_test`, `scc_e2e` DB를 자동 생성하거나, `seed` 스크립트에서 생성.

- [ ] **Step 2: 기동 테스트**

Run: `docker compose -f docker-compose.test.yml up -d`
Expected: `postgres-test` 컨테이너 healthy.

Run: `docker compose -f docker-compose.test.yml exec postgres-test psql -U scc -d scc -c "SELECT 1"`
Expected: `1` 출력.

Run: `docker compose -f docker-compose.test.yml down -v`
Expected: 컨테이너 + 볼륨 정리.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docker-compose.test.yml
git commit -m "feat(testing): 테스트용 docker-compose 추가

기존 docker-compose.yml과 분리, 포트 5433, scc DB 1개.
테스트 시점에 scc_test/scc_e2e DB 추가 생성.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 첫 단위 테스트 — `formatBytes`

**Files:**
- Create: `src/lib/utils.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
import { describe, it, expect } from 'vitest';
import { formatBytes } from './utils';

describe('formatBytes', () => {
  it('0 bytes는 "0 Byte"로 포맷', () => {
    expect(formatBytes(0)).toBe('0 Byte');
  });

  it('1024는 "1 KB"로 포맷 (default)', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('1024 * 1024는 "1 MB"로 포맷', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('sizeType: "accurate"는 KiB/MiB 사용', () => {
    expect(formatBytes(1024, { sizeType: 'accurate' })).toBe('1 KiB');
  });

  it('decimals 지정 시 소수점 자리수 적용', () => {
    expect(formatBytes(1500, { decimals: 2 })).toBe('1.46 KB');
  });
});
```

- [ ] **Step 2: 테스트 실행 — 통과 확인**

Run: `bun test:unit src/lib/utils.test.ts`
Expected: 5 passed.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add src/lib/utils.test.ts
git commit -m "test(lib): formatBytes 단위 테스트 추가

0 Byte, KB, MB, accurate, decimals 케이스.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: `getMergedViewSettings` 단위 테스트 (Prisma mock)

**Files:**
- Create: `src/modules/view-settings/api/get-view-settings-handler.test.ts`

> 실제 함수는 `getMergedViewSettings` (export 이름 확인 완료). `prisma.viewSetting.findMany()` 호출 + `views` config 머지.

- [ ] **Step 1: 테스트 파일 작성**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    viewSetting: { findMany: vi.fn() }
  }
}));

import { prisma } from '@/lib/prisma';
import { getMergedViewSettings } from './get-view-settings-handler';

describe('getMergedViewSettings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('DB에 설정이 없으면 views config의 icon 그대로 사용', async () => {
    vi.mocked(prisma.viewSetting.findMany).mockResolvedValue([]);
    const result = await getMergedViewSettings();
    // views 배열의 모든 항목이 결과에 포함되어야 함
    expect(result.length).toBeGreaterThan(0);
    // DB가 비어있으면 view.icon이 그대로 보존됨
    result.forEach((item) => {
      expect(item.viewId).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
    });
  });

  it('DB에 설정이 있으면 해당 viewId의 icon을 덮어씀', async () => {
    // 첫 번째 view의 icon을 'custom-icon'으로 덮어쓰는 케이스
    const firstView = result_first_view_id(); // helper
    vi.mocked(prisma.viewSetting.findMany).mockResolvedValue([
      { viewId: firstView, icon: 'custom-icon' } as any
    ]);
    const result = await getMergedViewSettings();
    const overridden = result.find((r) => r.viewId === firstView);
    expect(overridden?.icon).toBe('custom-icon');
  });
});

// 테스트 헬퍼: src/config/views.ts의 views 배열에서 첫 viewId 반환
function result_first_view_id(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { views } = require('@/config/views');
  return views[0].id;
}
```

- [ ] **Step 2: 테스트 실행 — 통과 확인**

Run: `bun test:unit src/modules/view-settings/api/get-view-settings-handler.test.ts`
Expected: 2 passed.

만약 `result_first_view_id()`가 `require`를 못 쓰면 (ESM 환경) 다음 패턴으로 교체:
```ts
import { views } from '@/config/views';
// 테스트 본문에서:
const firstView = views[0].id;
```

이 경우 `function result_first_view_id()` 라인을 삭제하고 import만 위에 추가.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add src/modules/view-settings/api/get-view-settings-handler.test.ts
git commit -m "test(view-settings): getMergedViewSettings 단위 테스트 추가

Prisma mock으로 DB 결과에 따른 icon 머지 검증.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: `createPrefix` 단위 테스트 (apiClient mock)

**Files:**
- Create: `src/modules/ipam/api/service.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: vi.fn()
}));

import { apiClient } from '@/lib/api-client';
import { createPrefix } from './service';

describe('createPrefix', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiClient에 POST /api/ipam/prefixes 요청을 보냄', async () => {
    vi.mocked(apiClient).mockResolvedValue({
      id: 1, prefix: '10.0.0.0/24', description: '', vlan: null, site: null, role: null
    });

    await createPrefix({ prefix: '10.0.0.0/24' });

    expect(apiClient).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(apiClient).mock.calls[0];
    expect(url).toBe('/api/ipam/prefixes');
    expect(options?.method).toBe('POST');
    expect(JSON.parse(options?.body as string)).toEqual({ prefix: '10.0.0.0/24' });
  });

  it('apiClient 응답을 그대로 반환', async () => {
    const apiResponse = {
      id: 42, prefix: '192.168.0.0/16', description: 'test', vlan: 'vlan10', site: 'dc1', role: 'infra'
    };
    vi.mocked(apiClient).mockResolvedValue(apiResponse);

    const result = await createPrefix({ prefix: '192.168.0.0/16' });
    expect(result).toEqual(apiResponse);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 통과 확인**

Run: `bun test:unit src/modules/ipam/api/service.test.ts`
Expected: 2 passed.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add src/modules/ipam/api/service.test.ts
git commit -m "test(ipam): createPrefix 단위 테스트 추가

apiClient mock으로 POST 요청 검증, 응답 매핑 검증.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: 첫 E2E 테스트

**Files:**
- Create: `e2e/example.spec.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
import { test, expect } from '@playwright/test';

test('메인 페이지 로드', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SE Command Center/);
});

test('뷰 셀렉터 드롭다운 표시', async ({ page }) => {
  await page.goto('/');
  // 좌상단 Select 드롭다운이 렌더링되는지 확인
  await expect(page.getByRole('combobox').first()).toBeVisible();
});
```

- [ ] **Step 2: 로컬 E2E 실행 (dev 서버 자동 기동)**

Run: `bun test:e2e e2e/example.spec.ts`
Expected:
- Playwright가 `bun dev` 자동 기동 (`webServer` 옵션)
- 2 passed
- HTML 리포트 `./playwright-report/` 생성 (선택)

문제 시:
- `webServer` 기동 실패 → 별도 터미널에서 `bun dev` 띄워 두고 `BASE_URL=http://localhost:3000 bun test:e2e` 실행
- `chromium` 미설치 → `bunx playwright install --with-deps chromium` (Dockerfile.ci-runner에는 사전 설치됨)

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add e2e/example.spec.ts
git commit -m "test(e2e): 메인 페이지 첫 시나리오 추가

타이틀, 뷰 셀렉터 드롭다운 렌더링 검증.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: 시드 스크립트 + 통합 테스트 환경

**Files:**
- Create: `scripts/test-seed.ts`
- Create: `scripts/e2e-seed.ts`
- Create: `src/test-utils/integration-setup.ts`

- [ ] **Step 1: `scripts/test-seed.ts` 작성**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting scc_test database...');
  const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );

  console.log('Seeding scc_test database...');
  await prisma.site.create({ data: { name: 'Test Site' } });

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: `scripts/e2e-seed.ts` 작성**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting scc_e2e database...');
  const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );

  console.log('Seeding scc_e2e database...');
  await prisma.site.createMany({
    data: [{ name: 'E2E Site 1' }, { name: 'E2E Site 2' }]
  });

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: DB 자동 생성 helper**

Prisma는 DATABASE_URL의 DB가 없으면 마이그레이션이 실패함. 통합/E2E DB를 자동 생성하는 helper:

`src/test-utils/create-test-db.ts`:
```ts
import { PrismaClient } from '@prisma/client';

/**
 * DATABASE_URL이 가리키는 DB가 없으면 생성.
 * docker-compose-test는 단일 'scc' DB만 만들므로,
 * 통합 테스트는 'scc_test', E2E는 'scc_e2e' DB를 별도로 생성해야 함.
 */
export async function ensureTestDatabase(targetDb: 'scc_test' | 'scc_e2e') {
  const baseUrl = process.env.DATABASE_URL ?? '';
  // postgres DB로 일단 접속
  const adminUrl = baseUrl.replace(/\/[^/]+$/, '/postgres');
  const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } });
  try {
    const exists = await admin.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = '${targetDb}')`
    );
    if (!exists[0]?.exists) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${targetDb}"`);
      console.log(`Created database: ${targetDb}`);
    }
  } finally {
    await admin.$disconnect();
  }
}
```

- [ ] **Step 4: 시드 스크립트에 DB 자동 생성 통합**

`scripts/test-seed.ts`를 다음과 같이 수정:
```ts
import { PrismaClient } from '@prisma/client';
import { ensureTestDatabase } from '../src/test-utils/create-test-db';

const prisma = new PrismaClient();

async function main() {
  await ensureTestDatabase('scc_test');

  console.log('Resetting scc_test database...');
  const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );

  console.log('Seeding scc_test database...');
  await prisma.site.create({ data: { name: 'Test Site' } });

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

`scripts/e2e-seed.ts`도 동일 패턴 (targetDb만 `'scc_e2e'`로).

- [ ] **Step 5: 로컬 검증**

Run: `docker compose -f docker-compose.test.yml up -d`
Run: `DATABASE_URL=postgresql://scc:scc@localhost:5433/scc_test bun run db:test:seed`
Expected: "Resetting...", "Seeding...", "Done." 순서대로 출력. (DB 자동 생성 로그도)

Run: `DATABASE_URL=postgresql://scc:scc@localhost:5433/scc_test bunx prisma migrate deploy`
Expected: 모든 마이그레이션 적용.

Run: `docker compose -f docker-compose.test.yml down -v`

- [ ] **Step 6: 커밋**

```bash
cd /Users/jerry/dev/scc
git add scripts/test-seed.ts scripts/e2e-seed.ts src/test-utils/create-test-db.ts
git commit -m "feat(testing): 시드 스크립트 + DB 자동 생성

- scripts/test-seed.ts: scc_test DB reset + 최소 시드
- scripts/e2e-seed.ts: scc_e2e DB reset + 시드
- src/test-utils/create-test-db.ts: DB 자동 생성 helper

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: `.gitlab-ci.yml` 작성

**Files:**
- Create: `.gitlab-ci.yml`

- [ ] **Step 1: 파일 작성**

```yaml
default:
  image: registry.scc.local/ci-runner:1.0.0
  tags: [scc-runner]

variables:
  POSTGRES_IMAGE: postgres:16
  GLOBAL_PATH: $PATH:/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin

.cache-bun: &bun-cache
  key: ${CI_COMMIT_REF_SLUG}
  paths: [.bun/cache, node_modules/.cache]
  policy: pull-push

stages:
  - test
  - build

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
    reports:
      coverage_report: coverage/coverage-summary.json
  cache: *bun-cache

.integration-base: &integration-base
  services:
    - name: ${POSTGRES_IMAGE}
      alias: postgres
  variables:
    POSTGRES_DB: scc
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
  script:
    - bun install --frozen-lockfile
    - bun run prebuild
    - bun run build
  rules:
    - if: $CI_COMMIT_BRANCH =~ /^(develop|staging|main)$/
    - if: $CI_MERGE_REQUEST_TARGET_BRANCH_NAME =~ /^(develop|staging|main)$/
  needs: [integration]

e2e:
  stage: test
  services:
    - name: ${POSTGRES_IMAGE}
      alias: postgres
  variables:
    POSTGRES_DB: scc
    POSTGRES_USER: scc
    POSTGRES_PASSWORD: scc
    DATABASE_URL: "postgresql://scc:scc@postgres:5432/scc_e2e"
    BASE_URL: "http://localhost:3000"
    CI: "true"
  script:
    - bun install --frozen-lockfile
    - bunx prisma migrate deploy
    - bun run db:e2e:seed
    - bun run build
    - bun start &
    - bunx playwright test
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  needs: [integration]
```

- [ ] **Step 2: YAML 검증 (선택)**

Run: `bunx js-yaml .gitlab-ci.yml` 또는 `python3 -c "import yaml; yaml.safe_load(open('.gitlab-ci.yml'))"`
Expected: 파싱 에러 없음.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add .gitlab-ci.yml
git commit -m "feat(testing): GitLab CI 파이프라인 추가

6개 잡: lint, type-check, unit, integration, build, e2e.
브랜치별 발화 매트릭스 (feature/develop/staging/main).
image: registry.scc.local/ci-runner:1.0.0 (Dockerfile.ci-runner 기반).

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: `docs/common/development/testing.md` 갱신

**Files:**
- Modify: `docs/common/development/testing.md`

- [ ] **Step 1: 헤더 갱신**

기존:
```markdown
> **현 상태 (2026-06-14):** Playwright는 설치되어 있으나 실제 테스트 코드는 작성되지 않음.
> 이 문서는 앞으로의 테스트 작성 규칙을 정의한다.
```

새로:
```markdown
> **현 상태 (2026-06-15):** Vitest + Playwright 인프라 셋업 완료. 단위/통합/E2E 3계층 동작.
> 상세 셋업 내용: `docs/superpowers/specs/2026-06-15-test-infra-design.md`
```

- [ ] **Step 2: GitLab CI 섹션 추가**

기존 "## E2E 작성 패턴" 섹션 다음에 새 섹션 추가:

```markdown
## GitLab CI

- 6개 잡: `lint`, `type-check`, `unit`, `integration`, `build`, `e2e`
- 단일 CI 러너 이미지: `registry.scc.local/ci-runner:1.0.0` (정의: `Dockerfile.ci-runner`)
- 브랜치별 발화:

| 잡 | feature | develop | staging | main |
|----|---------|---------|---------|------|
| lint, type-check, unit | ✅ | ✅ | ✅ | ✅ |
| integration, build | ❌ | ✅ | ✅ | ✅ |
| e2e | ❌ | ❌ | ❌ | ✅ |

- 통합/E2E 잡의 `services:`는 GitLab CI 표준 Postgres 서비스 사용
- 커버리지는 unit 잡에서 측정, MR에 리포트 첨부
- 캐시: `node_modules/.cache`, `.bun/cache` (key: `${CI_COMMIT_REF_SLUG}`)
```

- [ ] **Step 3: 통합 테스트 격리 섹션 추가**

기존 "## Mocking 규칙" 섹션 다음에 추가:

```markdown
## 통합 테스트 격리

- `scc_test` DB는 `scripts/test-seed.ts`로 truncate + seed
- `scc_e2e` DB는 `scripts/e2e-seed.ts`로 truncate + seed
- DB 자동 생성: `src/test-utils/create-test-db.ts`의 `ensureTestDatabase()`
- 트랜잭션-롤백 방식 채택 안 함 (Prisma `$transaction` 중첩 회피)
```

- [ ] **Step 4: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/testing.md
git commit -m "docs(testing): testing.md에 CI/격리 섹션 추가

GitLab CI 6개 잡, 브랜치 매트릭스, 통합 테스트 격리 정책.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## 정의된 DoD 체크리스트

전체 작업 완료 후 검증:

- [ ] `bun install` 후 `bun test:unit` 통과 (Task 6/7/8에서 추가한 3개 테스트)
- [ ] `docker compose -f docker-compose.test.yml up` 후 `bun run db:test:seed` 성공
- [ ] `bun test:coverage` 실행 시 80% 임계값 (또는 파일 추가에 따라 70% 조정)
- [ ] `bun test:e2e e2e/example.spec.ts` 통과
- [ ] `bun tsc --noEmit` + `bun run build` 통과
- [ ] `Dockerfile.ci-runner` 빌드 가능
- [ ] `registry.scc.local/ci-runner:1.0.0` 사내 레지스트리에 push 완료
- [ ] `.gitlab-ci.yml`의 `image:` 라인이 실제 푸시한 태그와 일치
- [ ] `docs/common/development/testing.md` 갱신 완료
