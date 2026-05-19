# SE Command Center

**Next.js 16 + shadcn/ui 기반 사내 인프라팀 관리 대시보드**

오픈소스 어드민 대시보드 템플릿([next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter))을 기반으로, 사내 인프라팀 운영 환경에 맞춰 커스터마이징한 프로젝트입니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19 |
| 언어 | TypeScript 5.7 |
| 스타일링 | Tailwind CSS v4, shadcn/ui |
| 상태 관리 | Zustand, Nuqs (URL search params) |
| 데이터 페칭 | TanStack React Query, TanStack Table |
| 폼 | TanStack Form + Zod |
| 차트 | Recharts |
| DB | Prisma + PostgreSQL |
| 런타임 | Bun |

---

## Phase 1 현황

> **현재 Phase 1 단계로 개발 중입니다.**

- **인증 없음** — 로그인/회원가입 없이 모든 페이지 접근 가능. 향후 Keycloak SSO 연동 예정.
- **폐쇄망 환경** — 외부 CDN, Google Fonts 등 외부 리소스를 사용하지 않도록 구성.
- **뷰(View) 전환** — 좌상단 Select 드롭다운으로 뷰를 전환하여 서로 다른 기능 그룹을 탐색.
- **IPAM Demo** — 서브넷(Subnet) 및 IP 주소 CRUD. 실제 사내 인프라 관리의 참조 구현체.

---

## 프로젝트 구조

```
scc/
├── src/
│   ├── app/(main)/           # 라우트 그룹 (demo-ipam, demo-components, home, settings)
│   ├── app/api/              # API 라우트 핸들러
│   ├── modules/             # 기능 모듈 (ipam, products, users, kanban, chat 등)
│   ├── components/           # 공통 UI 컴포넌트 (layout, ui, themes, kbar)
│   ├── config/               # 네비게이션, 뷰, 데이터 테이블 설정
│   ├── lib/                  # 유틸리티 (query-client, searchparams 등)
│   ├── hooks/                # 공통 커스텀 훅
│   ├── constants/            # 상수 정의
│   ├── styles/               # 글로벌 CSS 및 테마
│   └── types/                # TypeScript 타입 정의
├── prisma/                   # DB 스키마, 마이그레이션, 시드 데이터
├── docs/                     # 프로젝트 문서
├── scripts/                  # 빌드/유틸리티 스크립트
├── Dockerfile                # Node.js 기반 Docker 빌드
├── Dockerfile.bun            # Bun 기반 Docker 빌드
└── docker-compose.yml        # PostgreSQL + App 개발 환경
```

### 주요 feature 모듈

| 디렉토리 | 설명 |
|----------|------|
| `modules/ipam/` | IPAM — 서브넷/IP 주소 관리 (CRUD, Prisma 연동) |
| `modules/products/` | 상품 목록/폼 — TanStack Table + React Query 예시 |
| `modules/users/` | 사용자 테이블 — React Query + Nuqs 패턴 |
| `modules/kanban/` | Kanban 보드 — dnd-kit + Zustand |
| `modules/chat/` | 채팅 UI |
| `modules/overview/` | 대시보드 개요 — Recharts 차트 |
| `modules/notifications/` | 알림 센터 |

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
bunx prisma migrate dev
bunx prisma generate

# (선택) 시드 데이터
bunx prisma db seed

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
bunx prisma migrate dev    # 개발: 마이그레이션 생성 및 적용
bunx prisma migrate deploy # 운영: 마이그레이션 적용만
bunx prisma generate       # Prisma Client 재생성
```

---

## 문서 & CLAUDE.md

이 프로젝트에는 AI 코딩 어시스턴트(Claude Code 등)를 위한 `CLAUDE.md` 파일이 곳곳에 배치되어 있어, AI 도구 사용 시 프로젝트 컨벤션과 규칙이 자동으로 적용됩니다.

자세한 문서 목록은 [`docs/README.md`](docs/README.md)를 참조하세요.

| 문서 | 설명 |
|------|------|
| `docs/core/conventions.md` | 코딩 컨벤션 (25개 규칙) |
| `docs/onboarding/quickstart.md` | 5분 개발 서버 가이드 |
| `docs/onboarding/first-feature.md` | IPAM 신규 기능 따라하기 |
| `docs/data/cheat-sheet.md` | 데이터 페칭 패턴 빠른 참조 |
| `docs/forms/guide.md` | TanStack Form + Zod 가이드 |
| `docs/themes/guide.md` | 테마 시스템 가이드 |
| `docs/architecture/build-deploy.md` | 빌드 & 배포 가이드 |

---

## 라이선스

MIT
