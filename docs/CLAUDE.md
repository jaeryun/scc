# docs/ — AI 로딩 정책

@index.md

| 디렉토리 | 로딩 시점 |
|----------|-----------|
| `common/foundation/` | 항상 |
| `common/development/` | 구현 중 / 규칙 위반 시 |
| `common/operations/` | 빌드, 배포, 장애 대응 시 |
| `common/reference/` | 필요 시 (API, 데이터 모델, env 참조) |
| `common/decisions/` | 결정 검토 시 |
| `views/` | 해당 뷰 작업 시 |
| `archive/` | 로딩 금지 |

문서 배치 판단이 필요하면 → `@common/CLAUDE.md`에서 common/ 로딩 정책 확인 후 `@common/index.md`의 결정 트리 참조.
