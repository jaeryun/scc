# scripts/ — 구조와 파일 목록

## 디렉터리 용도

개발 자동화 도구와 유틸리티 스크립트를 보관합니다. 빌드 파이프라인 검증, 문서 링크 분석, API 스펙 생성 등의 작업을 담당합니다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `check-migrations.sh` | Prisma 7 패턴으로 갱신된 마이그레이션 무결성 검사 (`prisma/schema.prisma` datamodel 직접 참조, `prisma.config.ts` config 분리) | prisma, migration, validation, prebuild |
| `generate-api-spec.ts` | `src/app/api/` route handler 스캔 → `public/api-specs/internal/latest.json` 생성 (prebuild 자동 실행) | API, spec, generation, prebuild |
| `doc-links.py` | 문서 간 참조 분석 → 각 `index.md` 하단 링크 상태 테이블 갱신 (수동 실행) | docs, links, validation |
| `CLAUDE.md` | AI 에이전트 가이드 (스크립트 사용법) | guide, usage |

## 포함 금지 항목

- 일반 문서 파일 (문서는 `docs/` 디렉토리에 위치)
- 런타임 애플리케이션 코드 (`src/` 디렉토리에 위치)
