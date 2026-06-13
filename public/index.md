# public/ — 구조와 파일 목록

## 디렉터리 용도

Next.js가 빌드 시 그대로 서빙하는 정적 파일 디렉토리.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `public/` | 정적 에셋 | 정적파일, 서빙 |
| `robots.txt` | 폐쇄망 크롤러 차단 | robots, 크롤러 |
| `fonts/` | woff2 폰트 직접 서빙 | 폰트, woff2 |
| `api-specs/internal/` | 빌드 스크립트 생성 JSON 아티팩트 | API, 스펙, 빌드 |
| `index.md` | 이 파일 — public/ 디렉터리 구조 | 인덱스 |
| `CLAUDE.md` | AI 에이전트 로딩 지침 | AI, 로딩 |

## 포함 금지 항목

- 소스코드, React 컴포넌트 — `src/` 에 배치
- 문서 — `docs/` 에 배치
- Prisma 관련 파일 — `prisma/` 에 배치
- 개발 스크립트 — `scripts/` 에 배치
- 크리덴셜, `.env` — 절대 금지 (public/ 은 외부에 노출됨)
