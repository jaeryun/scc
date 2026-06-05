# docs/ -- SCC 프로젝트 문서

이 디렉토리는 SCC 프로젝트의 모든 문서를 포함합니다.

## 구조

| 디렉토리 | 목적 | 로딩 시점 |
|-----------|---------|--------|
| `common/foundation/` | 프로젝트 헌장 -- 정체성, 제약, 핵심 결정사항 | 항상 |
| `common/rules/` | 코딩 규칙 -- 반드시 따라야 하는 SCC 고유 결정사항 | 위반 시 |
| `common/dev-patterns/` | 개발 패턴 -- 코드 예제, 구현 방법 | 구현 중 |
| `common/operation/` | 운영 가이드 -- 빌드, 배포, 장애 대응 | 운영 시 |
| `common/reference/` | 참조 자료 -- API 문서, 데이터 모델, env 변수 | 필요 시 |
| `common/adr/` | 아키텍처 결정 기록 | 결정 검토 시 |
| `views/` | 뷰별 도메인 지식 (dcim, settings, home, demo) | 뷰 작업 중 |
| `archive/` | 히스토리 기록 -- 감사, 리뷰, 과거 브랜치 산출물 | 로딩 안 함 |

## 주요 경로

- 프로젝트 개요 → `common/foundation/project.md`
- 코딩 규칙 → `common/foundation/conventions.md` → `common/rules/`
- 개발 패턴 → `common/dev-patterns/`
- 뷰별 문서 → `views/<view>/`
