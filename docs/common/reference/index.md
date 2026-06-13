# reference/ — 구조와 파일 목록

## 디렉터리 용도

여러 뷰가 공유하는 데이터 계약을 담습니다. 유일하게 하위 디렉터리 중첩을 허용하는 디렉토리입니다.

## 판단 기준

- **API 명세는 뷰가 아니라 제공자 관점에서 분류한다** — IPAM API라고 해서 `views/dcim/`에 넣지 않고 `reference/api/`에 둔다
- **데이터 모델은 소비자가 아닌 계약 관점에서 분류한다** — 여러 뷰가 소비하는 스키마는 `reference/data-models/`에 둔다
- **새 하위 디렉토리는 3개 이상 파일이 예상될 때만 생성** — 1-2개는 `reference/` 루트에 플랫하게

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `reference/` | 참조 자료 | API, 데이터모델, 환경변수 |
| `api/` | API 엔드포인트 명세, 요청/응답 스키마 | API, 명세, 스키마 |
| `data-models/` | DB 스키마, 엔티티 관계, 공유 타입 | DB, 스키마, 타입 |
| `env/` | 환경변수 목록, 설정값, 피처 플래그 | 환경변수, 설정, 피처플래그 |
| `index.md` | 이 파일 — reference/ 디렉터리 구조 | 인덱스 |
| `CLAUDE.md` | AI 에이전트 로딩 지침 | AI, 로딩 |

## 포함 금지 항목

- AI 지침 — 로딩 시점, 행동 규칙은 CLAUDE.md에서 관리
- 뷰별 문서 — 특정 뷰 전용 API/데이터라도 [views/](../../views/) 대신 reference/에 배치 (API는 계약)


<!-- LINK STATUS START -->
## 🔗 링크 상태

> ⚠️ `scripts/doc-links.py` 자동 생성 — 직접 수정 금지 · 2026-06-07 16:36 UTC

| 파일 | 피참조 |
|:-----|:-------|
| `index.md` | CLAUDE.md |
| `CLAUDE.md` | 🟢 auto-loading |
<!-- LINK STATUS END -->
