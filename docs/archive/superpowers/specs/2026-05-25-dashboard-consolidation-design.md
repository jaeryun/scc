# 대시보드 통폐합 설계

## 배경

라이브러리 뷰에 `대시보드(dashboard)`와 `그리드 대시보드(grid-dashboard)` 두 개의 대시보드 메뉴가 존재한다. 둘 다 recharts 기반 데모이며, 그리드 대시보드가 대시보드의 기능을 완전히 포함(superset)하므로 하나로 통폐합한다.

## 설계

### 1. `panel-stat` 위젯 강화

구 대시보드의 4개 통계 카드(총수익, 신규고객, 활성계정, 성장률)를 커버하기 위해 panel-stat 위젯 옵션을 확장한다.

**기존 옵션 (하위 호환 유지):**
```
{ value: string, unit: string }
```

**확장 옵션:**
```typescript
interface PanelStatOptions {
  value: string;           // 표시 값 (기존)
  unit: string;            // 단위 (기존)
  title?: string;          // 상단 제목 "총 수익"
  prefix?: string;         // 값 앞 접두사 "₩"
  trend?: 'up' | 'down';  // 트렌드 방향
  trendValue?: string;     // 트렌드 값 "+12.5%"
  footer?: string;         // 하단 텍스트
}
```

**UI 구조 (보기 모드):**
```
┌─────────────────────────┐
│ 총 수익                  │  ← title
│ ₩1,250,000              │  ← prefix + value
│ [+12.5%]                 │  ← trend 배지
│ 이번 달 상승세            │  ← footer
└─────────────────────────┘
```

**편집 모드**에서는 기존 value/unit 입력 + 신규 title/trend/footer 필드 추가.

**`defaultOptions`**: 기존 `{ value: '0', unit: '' }` 유지 → 기존 panel-stat을 사용 중인 대시보드는 영향 없음.

**`PANEL_TYPES` 등록 변경:**
```typescript
{
  type: 'stat',
  label: '통계',
  description: '값, 트렌드, 설명이 있는 통계 카드',
  icon: 'trendingUp',
  defaultGridPos: { w: 3, h: 3 },  // 기존 2x2 → 더 풍부한 카드에 맞춰 3x3
  defaultOptions: { value: '0', unit: '' }
}
```

### 2. `panel-list` 신규 위젯

구 대시보드의 RecentSales 컴포넌트를 대체할 목록형 위젯. 사용자 아바타, 이름, 이메일, 금액 등을 열(column) 정의 기반으로 표시.

**옵션 스키마:**
```typescript
interface PanelListColumn {
  key: string;                     // 데이터 키
  label: string;                    // 열 헤더
  type: 'text' | 'avatar' | 'amount';  // 렌더링 스타일
}

interface PanelListOptions {
  title?: string;                   // 목록 제목
  columns: PanelListColumn[];       // 열 정의
  rows: Record<string, string>[];   // 데이터 행
}
```

**UI (보기 모드):**
```
┌─ Recent Sales ──────────────────┐
│ 👤 Olivia Martin  +₩1,999.00  │
│ 👤 Jackson Lee     +₩39.00    │
│ 👤 Isabella Nguyen +₩299.00   │
│ 👤 William Kim     +₩99.00    │
│ 👤 Sofia Davis     +₩39.00    │
└─────────────────────────────────┘
```

**`defaultOptions`:**
```typescript
{
  title: 'Recent Sales',
  columns: [
    { key: 'name', label: '이름', type: 'avatar' },
    { key: 'email', label: '이메일', type: 'text' },
    { key: 'amount', label: '금액', type: 'amount' }
  ],
  rows: [
    { name: 'Olivia Martin', email: 'olivia@example.com', amount: '+₩1,999.00' },
    { name: 'Jackson Lee', email: 'jackson@example.com', amount: '+₩39.00' },
    { name: 'Isabella Nguyen', email: 'isabella@example.com', amount: '+₩299.00' },
    { name: 'William Kim', email: 'william@example.com', amount: '+₩99.00' },
    { name: 'Sofia Davis', email: 'sofia@example.com', amount: '+₩39.00' }
  ]
}
```

**편집 모드**에서는 열 추가/제거, 행 데이터 편집 (key-value 입력) 지원.

### 3. 라우트 통합

**실행 순서 중요:** 구 대시보드 페이지 디렉토리를 먼저 삭제한 후, grid-dashboard를 dashboard로 rename.

| 순서 | 작업 | 내용 |
|------|------|------|
| 3a | 구 대시보드 삭제 | `src/app/(main)/library/modules/dashboard/` 디렉토리 전체 삭제 |
| 3b | 페이지 rename | `src/app/(main)/library/modules/grid-dashboard/` → `src/app/(main)/library/modules/dashboard/` |
| 3c | 모듈 rename | `src/modules/grid-dashboard/` → `src/modules/dashboard/` |
| 3d | API rename | `src/app/api/grid-dashboards/` → `src/app/api/dashboards/` |
| 3e | 모듈 내 import 경로 수정 | 모든 `@/modules/grid-dashboard/` → `@/modules/dashboard/` |
| 3f | API 경로 문자열 수정 | 모든 `/api/grid-dashboards` → `/api/dashboards` |
| 3g | React Query 키 수정 | `['grid-dashboards']` → `['dashboards']` |
| 3h | 구 차트 삭제 | `src/components/charts/*` (8개 파일) |
| 3i | 네비게이션 정리 | `views.ts`: 그리드 대시보드 항목 제거, 대시보드가 `/library/modules/dashboard` 링크 |
| 3j | 네비게이션 정리 | `nav-config.ts`: 그리드 대시보드 항목 제거 |
| 3k | 홈페이지 | `home/page.tsx`: 이미 `/library/modules/dashboard` → 변경 없음 |
| 3l | 모듈 소개 | `library/modules/page.tsx`: 이미 `/library/modules/dashboard` → 변경 없음 |

### 4. Prisma 정리

| 단계 | 내용 |
|------|------|
| 4a | 사용되지 않는 `Dashboard` 모델 제거 (기존 방치되어 있음) |
| 4b | `GridDashboardFolder` → `DashboardFolder` rename (+ `@@map("DemoDashboardFolder")` 유지) |
| 4c | `GridDashboard` → `Dashboard` rename (+ `@@map("DemoDashboard")` 유지) |
| 4d | 마이그레이션 생성 및 적용 (`prisma migrate dev`) |
| 4e | 서비스/쿼리/뮤테이션에서 타입 참조 업데이트: `GridDashboard` → `Dashboard`, `GridDashboardFolder` → `DashboardFolder` |

### 5. 변경 후 최종 상태

| 레이어 | 명칭 |
|--------|------|
| 페이지 라우트 | `/library/modules/dashboard` |
| 모듈 디렉토리 | `src/modules/dashboard/` |
| API 라우트 | `src/app/api/dashboards/` |
| Prisma 모델 | `Dashboard` (구 GridDashboard, @@map("DemoDashboard")), `DashboardFolder` (구 GridDashboardFolder, @@map("DemoDashboardFolder")) |
| 네비게이션 | 사이드바: 대시보드 1개만 존재 |

## 작업 순서

1. **panel-stat 강화** — 기존 위젯에 옵션 추가, 호환성 유지
2. **panel-list 신규** — 새 위젯 타입 구현
3. **라우트 통합** — 구 대시보드 삭제 → grid-dashboard → dashboard rename → 네비게이션 정리
4. **Prisma 정리** — Dashboard 모델 제거 + GridDashboard 모델 rename → Dashboard (마이그레이션)
5. **빌드 검증**
