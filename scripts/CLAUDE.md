# scripts/ — 개발 도구

| 스크립트 | 실행 시점 | 용도 |
|----------|-----------|------|
| `check-migrations.sh` | prebuild (자동) | Prisma schema ↔ migration 불일치 검출 |
| `generate-api-spec.ts` | prebuild (자동) | `src/app/api/` route handler 스캔 → `public/api-specs/internal/latest.json` 생성 |
| `doc-links.py` | 수동 | 문서 간 `[text](path.md)` / `@docs/...` 참조 분석 → 각 `index.md` 하단 링크 상태 테이블 갱신 |

## 사용법

```bash
python3 scripts/doc-links.py              # 전체 갱신
python3 scripts/doc-links.py -n           # dry-run (출력만 확인)
```
