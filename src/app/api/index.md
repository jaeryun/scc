# api/ — Production API 라우트 구조와 파일 목록

## 디렉터리 용도

Next.js Route Handler 기반의 Production API 엔드포인트. Prisma를 통해 데이터베이스와 직접 통신하며, 모든 라우트는 빌드 시 실제 HTTP 엔드포인트로 노출된다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `dcim/` | DCIM API (cables, devices, interfaces, sites) | dcim, crud |
| `ipam/` | IPAM API (subnets, ip-addresses — prefixes, assign, search, release) | ipam, subnets, ip |
| `view-settings/` | 뷰 설정 API (테마, 네비게이션 등 사용자 설정) | settings, preferences |

## 포함 금지 항목

- Demo 모듈의 API 라우트 — Demo 데이터는 mock-store에서 직접 반환하며, HTTP 엔드포인트로 노출하지 않음
