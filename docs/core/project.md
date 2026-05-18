# 프로젝트 개요

## Phase 1 제약
- 인증 없음 (Clerk/Sentry 제거), 향후 Keycloak SSO
- 폐쇄망 — 외부 CDN/리소스 사용 불가
- 좌상단 Select 드롭다운으로 뷰 전환 (`src/config/views.ts`, 라우트 그룹 `src/app/(main)/`)
- IPAM Demo: 서브넷/IP CRUD (`src/features/ipam/`)

## 기술 스택
Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, shadcn/ui, Prisma + PostgreSQL,
TanStack React Query, TanStack Table, TanStack Form + Zod, Zustand, Nuqs, Recharts

## 빌드 명령어
| 명령어 | 용도 |
|--------|------|
| `bun install` | 의존성 설치 |
| `bun run dev` | 개발 서버 (:3000) |
| `bun run build` | 프로덕션 빌드 |
| `bun run lint` | ESLint |
| `bun run lint:fix` | ESLint 자동 수정 |
| `bun run format` | Prettier |
| `bun run format:check` | 포매팅 검사 |
| `bunx prisma generate` | Prisma 클라이언트 생성 |

## 환경 설정

`.env.example`을 `.env.local`로 복사하여 사용 (⚠️ `.env.example` 내부 안내문은 `.env`로 복사하라고 되어 있으나, Next.js 컨벤션에 맞게 `.env.local`을 사용합니다):

```env
# 데이터베이스 (필수)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Phase 1: 인증 없음 (Clerk/Sentry 제거, 관련 환경변수 불필요)
# 향후 Keycloak SSO 도입 시 인증 관련 환경변수 추가 예정
```

- 폐쇄망 환경이므로 외부 CDN/리소스 사용 불가 (Google Fonts, 외부 이미지 등)
- `NEXT_PUBLIC_*` 변수는 빌드 시점에 포함되므로, 런타임 시크릿은 `-e`로 Docker에 주입
- 배포 환경별 `.env` 파일: `.env.local`(로컬), `.env.production`(프로덕션)

## 프로젝트 구조

```
/
├── src/                        # Next.js App Router 소스
│   ├── app/                    # 라우트 + API 라우트 핸들러
│   │   ├── (main)/             # 뷰별 라우트 그룹 (Select 드롭다운 전환)
│   │   └── api/                # API 라우트 핸들러
│   ├── features/               # 기능 모듈 (도메인별)
│   │   ├── auth/               # 인증 (Phase 2)
│   │   ├── chat/               # 채팅
│   │   ├── elements/           # UI 요소 데모
│   │   ├── forms/              # 폼 데모
│   │   ├── ipam/               # IPAM: 서브넷/IP 관리 (api/, hooks/, components/)
│   │   ├── kanban/             # 칸반 보드
│   │   ├── notifications/      # 알림
│   │   ├── overview/           # 대시보드 개요
│   │   ├── products/           # 상품 관리
│   │   ├── profile/            # 사용자 프로필
│   │   ├── react-query-demo/   # React Query 데모
│   │   ├── users/              # 사용자 관리
│   │   └── view-settings/      # 뷰 설정
│   ├── components/             # 공통 컴포넌트
│   │   ├── ui/                 # shadcn/ui 기반 (직접 수정 금지)
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── forms/              # 폼 컴포넌트
│   │   ├── themes/             # 테마 컴포넌트
│   │   └── icons.tsx           # 아이콘 중앙 관리 (직접 @tabler/icons-react 임포트 금지)
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 유틸리티 함수
│   ├── config/                 # 설정 파일
│   │   ├── nav-config.ts       # 내비게이션 및 RBAC
│   │   └── views.ts            # 뷰 전환 Select 옵션
│   ├── constants/              # 상수 정의
│   ├── styles/                 # 전역 스타일
│   └── types/                  # 공통 타입 정의
├── prisma/                     # DB 스키마 + 마이그레이션 + 시드
│   ├── schema.prisma           # Prisma 스키마 정의
│   ├── migrations/             # 마이그레이션 SQL
│   └── seed.ts                 # 데모 데이터 시드
├── docs/                       # 내부 문서
│   ├── forms.md                # 폼 시스템 가이드
│   ├── themes.md               # 테마 시스템 가이드
│   └── nav-rbac.md             # 내비게이션 RBAC 가이드
├── scripts/                    # 개발 도구
│   └── check-migrations.sh     # 마이그레이션 무결성 검사
├── Dockerfile                  # Node.js 프로덕션 이미지 (ARG 미사용, --build-arg 불필요)
├── Dockerfile.bun              # Bun 프로덕션 이미지 (ARG 정의 있음, --build-arg 사용 가능)
├── docker-compose.yml          # PostgreSQL + Next.js 개발 환경
└── package.json
```

## 배포

### Docker 빌드

- Next.js `output: 'standalone'` 모드 사용 (`BUILD_STANDALONE=true` 환경변수로 활성화; `.env.example` 참조)
  - `Dockerfile.bun`: `ENV BUILD_STANDALONE=true`가 명시되어 있어 자동 적용
  - `Dockerfile` (Node.js): `next.config.ts` 또는 프로젝트 `.env`에서 `BUILD_STANDALONE` 설정 필요
- 빌드 시점 환경변수(`NEXT_PUBLIC_*`): `Dockerfile.bun`만 ARG 정의가 있으므로 `docker build --build-arg`로 전달 가능 (`Dockerfile` Node.js는 ARG 미정의)
- 런타임 환경변수(시크릿): `docker run -e`로 전달

```bash
# Node.js 이미지
docker build -t scc-app .

# Bun 이미지
docker build -f Dockerfile.bun -t scc-app:bun .
```

### Docker Compose (개발)

```bash
docker compose up -d
```

- PostgreSQL + Next.js 개발 서버 동시 실행
- `.env.local`의 `DATABASE_URL`이 컨테이너 내 PostgreSQL을 가리키도록 설정

## 외부 문서
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [TanStack React Query](https://tanstack.com/query/latest)
