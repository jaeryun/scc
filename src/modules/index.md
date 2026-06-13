# modules/ — 기능 모듈

## 디렉터리 용도

SCC 애플리케이션의 도메인별 기능 모듈. 각 모듈은 `api/`, `hooks/`, `components/` 계층으로 구성된다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `auth/` | 인증 모듈 | authentication, SSO |
| `cables/` | 케이블 관리 | cable, connection |
| `demo/` | 데모 모듈 (인메모리 mock 데이터) | mock, demo, in-memory |
| `devices/` | 디바이스 관리 | device, hardware |
| `interfaces/` | 인터페이스 관리 | interface, network |
| `ipam/` | IP 주소 관리 (Production 정규 참조) | IPAM, subnet, IP address |
| `sites/` | 사이트 관리 | site, location |
| `switch-mapping/` | 스위치 매핑 | switch, mapping |
| `view-settings/` | 뷰 설정 | view, settings |

## API 파일 구조

```
src/modules/<name>/api/
├── types.ts        # 타입 정의 (필수)
├── service.ts      # 데이터 접근 계층 (필수) — mock-store 직접 호출 또는 apiClient 사용
├── queries.ts      # TanStack Query 옵션 (필수)
├── mutations.ts    # TanStack Mutation 옵션 (CRUD 있을 때만)
└── mock-store.ts   # Demo 모듈 전용: in-memory 데이터 저장소 + seed
```

## 정규 참조 구현

| 모듈 | 유형 | 참조 대상 |
|------|------|-----------|
| `src/modules/ipam/` | Production | Prisma + Zod + apiClient 전체 패턴 |
| `src/modules/demo/dashboard/` | Demo | mock-store + in-memory seed 패턴 |
| `src/modules/demo/products/` | Demo | `@/constants/mock-api` 공유 상수 패턴 |
| `src/app/api/ipam/` | Production API | Route Handler + Zod 검증 + 계층 분리 |

## 포함 금지 항목

- 순수 UI 컴포넌트 → `src/components/`에 배치 (도메인 의존 없음)
- 전역 유틸리티 함수 → `src/lib/`에 배치
- 공통 타입 정의 → `src/types/`에 배치
- 다른 모듈 직접 import — 모듈 간 결합 금지, 필요 시 `src/app/` 수준에서 조합
