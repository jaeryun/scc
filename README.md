# SE Command Center

**Next.js 16 + shadcn/ui 기반 사내 인프라팀 관리 대시보드**

오픈소스 어드민 대시보드 템플릿([next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter))을 기반으로, 사내 인프라팀 운영 환경에 맞춰 커스터마이징한 프로젝트입니다.

---

## 기술 스택

| 분류        | 기술                                 |
| ----------- | ------------------------------------ |
| 프레임워크  | Next.js 16 (App Router), React 19    |
| 언어        | TypeScript 5.7                       |
| 스타일링    | Tailwind CSS v4, shadcn/ui           |
| 상태 관리   | Zustand, Nuqs (URL search params)    |
| 데이터 페칭 | TanStack React Query, TanStack Table |
| 폼          | TanStack Form + Zod                  |
| 차트        | Recharts                             |
| DB          | Prisma + PostgreSQL                  |
| 런타임      | Bun                                  |

---

## 개발 현황

- **인증 없음** — 로그인/회원가입 없이 모든 페이지 접근 가능. 향후 Keycloak SSO 연동 예정.
- **폐쇄망 환경** — 외부 CDN, Google Fonts 등 외부 리소스를 사용하지 않도록 구성.
- **뷰(View) 전환** — 좌상단 Select 드롭다운으로 뷰(dcim, demo, settings, home)를 전환.
- **IPAM** — 서브넷(Subnet) 및 IP 주소 CRUD. 사내 인프라 관리의 핵심 제품 모듈.
- **Demo** — 인메모리 mock 데이터로 동작하는 UI 데모 모음 (테이블, 폼, 차트, Kanban 등).

---

## 프로젝트 구조

```
scc/
├── src/
│   ├── app/(main)/           # 라우트 그룹 (dcim, demo, home, settings)
│   ├── app/api/              # API 라우트 핸들러
│   ├── modules/             # 기능 모듈 (제품 + 데모)
│   ├── components/           # 공통 UI 컴포넌트 (layout, ui, forms, themes)
│   ├── config/               # 네비게이션, 뷰, RBAC 설정
│   ├── lib/                  # 유틸리티 함수
│   ├── hooks/                # 공통 커스텀 훅
│   ├── constants/            # 상수 정의
│   ├── styles/               # 전역 스타일
│   └── types/                # TypeScript 타입 정의
├── prisma/                   # DB 스키마, 마이그레이션, 시드 데이터
├── docs/                     # 프로젝트 문서 (common/, views/, archive/)
├── scripts/                  # 빌드/유틸리티 스크립트
├── Dockerfile                # Node.js 기반 Docker 빌드
├── Dockerfile.bun            # Bun 기반 Docker 빌드
└── docker-compose.yml        # PostgreSQL + App 개발 환경
```

### 제품 모듈

| 디렉토리                    | 설명                                   |
| --------------------------- | -------------------------------------- |
| `modules/ipam/`             | IPAM — 서브넷/IP 주소 관리 (CRUD)      |
| `modules/cables/`           | 케이블 관리                             |
| `modules/devices/`          | 디바이스 관리                           |
| `modules/interfaces/`       | 인터페이스 관리                         |
| `modules/sites/`            | 사이트 관리                             |
| `modules/switch-mapping/`   | 스위치 매핑                             |
| `modules/view-settings/`    | 뷰 설정                                 |

### 데모 모듈 (`modules/demo/`)

인메모리 mock 데이터로 동작하는 UI 참조 구현체. 제품 코드는 demo 모듈을 임포트하지 않는다.

| 디렉토리             | 설명                              |
| -------------------- | --------------------------------- |
| `demo/products/`     | TanStack Table + React Query 예시 |
| `demo/users/`        | React Query + Nuqs 패턴           |
| `demo/kanban/`       | Kanban 보드 — dnd-kit + Zustand   |
| `demo/chat/`         | 채팅 UI                           |
| `demo/dashboard/`    | Recharts 차트 대시보드            |
| `demo/forms/`        | TanStack Form + Zod 예시          |
| `demo/billing/`      | 빌링 페이지                        |

---

## 시작하기

### 사전 요구사항

- **Bun** ≥ 1.1 (권장) 또는 Node.js 20+
- **PostgreSQL** (개발용: `docker compose up db` 로 실행)

### 설치 및 실행

```bash
# 의존성 설치
bun install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 DATABASE_URL 설정

# DB 마이그레이션 및 클라이언트 생성
bunx prisma migrate dev --config prisma/config/prisma.config.ts
bunx prisma generate --config prisma/config/prisma.config.ts

# (선택) 시드 데이터
bunx prisma db seed --config prisma/config/prisma.config.ts

# 개발 서버 실행
bun run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

---

## 빌드 & 배포

### 개발 빌드

```bash
bun run build   # prebuild(마이그레이션 체크) + next build
bun run start
```

### Docker

```bash
# Node.js 이미지
docker build -t scc .

# Bun 이미지
docker build -f Dockerfile.bun -t scc .

# PostgreSQL + App 전체 실행
docker compose up -d
```

### DB 마이그레이션

```bash
bunx prisma migrate dev --config prisma/config/prisma.config.ts    # 개발: 마이그레이션 생성 및 적용
bunx prisma migrate deploy --config prisma/config/prisma.config.ts # 운영: 마이그레이션 적용만
bunx prisma generate --config prisma/config/prisma.config.ts       # Prisma Client 재생성
```

---

## 문서

이 프로젝트는 `CLAUDE.md` + `index.md` 쌍으로 AI와 사람 모두가 탐색 가능한 문서 구조를 갖추고 있습니다. 자세한 안내는 [`docs/index.md`](docs/index.md) 참조.

| 디렉토리 | 내용 |
|----------|------|
| [`docs/common/foundation/`](docs/common/foundation/) | 프로젝트 헌장, 아키텍처, 컨벤션 |
| [`docs/common/development/`](docs/common/development/) | 코딩 규칙 + 구현 패턴 |
| [`docs/common/operations/`](docs/common/operations/) | 빌드, 배포, 장애 대응 |
| [`docs/common/reference/`](docs/common/reference/) | API, 데이터 모델, 환경변수 |
| [`docs/common/decisions/`](docs/common/decisions/) | 아키텍처 결정 기록 (ADR) |
| [`docs/views/`](docs/views/) | 뷰별 도메인 문서 (dcim, settings, home, demo) |

---

## 라이선스

MIT
