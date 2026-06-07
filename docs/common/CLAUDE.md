# common/ — 모든 뷰의 공통 기반

특정 뷰에 귀속되지 않고 프로젝트 전체가 공유하는 문서를 담습니다.

**로딩 시점:** 필요 시 (common/ 하위 디렉토리 탐색 시)

- `foundation/` — 프로젝트 헌장 (항상 로딩)
- `development/` — 코딩 규칙 + 구현 패턴 (구현 중 / 위반 시)
- `operations/` — 빌드, 배포, 장애 대응 (운영 시)
- `reference/` — API, 데이터 모델, env 변수 (필요 시)
- `decisions/` — 아키텍처 결정 기록 (결정 검토 시)

> 디렉토리 탐색 및 문서 배치 결정 트리는 `@docs/common/index.md` 참조.
