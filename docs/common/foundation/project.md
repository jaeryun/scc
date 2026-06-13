# 프로젝트 개요

## 제약

- 폐쇄망 — 외부 CDN/리소스 사용 불가
- 좌상단 Select 드롭다운으로 뷰 전환 (`src/config/views.ts`, 라우트 그룹 `src/app/(main)/`)

## 기술 스택

Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, shadcn/ui, Prisma + PostgreSQL,
TanStack React Query, TanStack Table, TanStack Form + Zod, Zustand, Nuqs, Recharts

## 환경 설정

주요 명령: `bun install` / `bun dev` (:3000) / `bun build` / `bun lint` / `bun format` / `bunx prisma generate`

`.env.example`을 `.env.local`로 복사하여 사용 (⚠️ `.env.example` 내부 안내문은 `.env`로 복사하라고 되어 있으나, Next.js 컨벤션에 맞게 `.env.local`을 사용합니다):

```env
# 데이터베이스 (필수)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# 인증 관련 환경변수는 SSO 도입 시 추가
```

- 폐쇄망 환경이므로 외부 CDN/리소스 사용 불가 (Google Fonts, 외부 이미지 등)
- `NEXT_PUBLIC_*` 변수는 빌드 시점에 포함되므로, 런타임 시크릿은 `-e`로 Docker에 주입
- 배포 환경별 `.env` 파일: `.env.local`(로컬), `.env.production`(프로덕션)

## 프로젝트 구조

```
/
├── public/                     # 정적 파일 (robots.txt, OG 이미지 등)
├── src/                        # Next.js App Router 소스
│   ├── app/                    # 라우트 + API 라우트 핸들러
│   │   ├── (main)/             # 뷰별 라우트 그룹 (Select 드롭다운 전환)
│   │   └── api/                # API 라우트 핸들러
│   ├── modules/               # 기능 모듈 (도메인별)
│   │   ├── demo/               # Demo modules (in-memory mock data)
│   │   │   ├── billing/        # 빌링 데모
│   │   │   ├── chat/           # 채팅 데모
│   │   │   └── ...             # 기타 데모 모듈
│   │   ├── ipam/               # IPAM: 서브넷/IP 관리 (api/, hooks/, components/)
│   │   ├── cables/             # 케이블 관리
│   │   ├── devices/            # 디바이스 관리
│   │   ├── interfaces/         # 인터페이스 관리
│   │   ├── sites/              # 사이트 관리
│   │   ├── switch-mapping/     # 스위치 매핑
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
├── docs/                       # 프로젝트 문서 (common/, views/, archive/)
│   ├── common/                  # 공통 기반 (foundation, development, operations, reference, decisions)
│   ├── views/                   # 뷰별 도메인 지식 (dcim, settings, home, demo)
│   └── archive/                 # 과거 산출물 (AI 에이전트 읽기 금지)
├── scripts/                    # 개발 도구
│   └── check-migrations.sh     # 마이그레이션 무결성 검사
├── Dockerfile                  # Node.js 프로덕션 이미지 (ARG 미사용, --build-arg 불필요)
├── Dockerfile.bun              # Bun 프로덕션 이미지 (ARG 정의 있음, --build-arg 사용 가능)
├── docker-compose.yml          # PostgreSQL + Next.js 개발 환경
└── package.json
```

## 배포

[Docker 빌드 & 배포 상세 → build-deploy.md](../operations/build-deploy.md)

## 외부 문서

Next.js, shadcn/ui, Tailwind CSS v4, TanStack Table/Query/Form — 공식 문서 참조
