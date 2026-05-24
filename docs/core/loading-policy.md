# CLAUDE.md 로딩 정책

## 원칙

- **항상 로딩**: 루트 CLAUDE.md에서 `@docs/core/*.md` 로 `@import`. 모든 세션, 모든 디렉토리 작업에 필수.
- **컨텍스트 로딩**: 디렉토리별 CLAUDE.md에서 `@import`. 해당 디렉토리 작업 시에만 필요.

## 항상 로딩 — 총 291줄

| 파일                          | 줄수 | 역할                     |
| ----------------------------- | ---- | ------------------------ |
| `CLAUDE.md` (루트)            | 31   | 프로젝트 진입점          |
| `docs/README.md`              | 60   | 문서 맵                  |
| `docs/core/project.md`        | 89   | 프로젝트 개요, 빌드 명령 |
| `docs/core/behavior.md`       | 30   | AI 행동 원칙             |
| `docs/core/conventions.md`    | 51   | 25 + 10개 코딩 규칙      |
| `docs/core/loading-policy.md` | 30   | 로딩 정책 (자기 자신)    |

## 컨텍스트 로딩

| 작업 디렉토리     | @import 체인                                                                                                                   | 추가 줄수 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `src/`            | `src/CLAUDE.md`(9) → `@themes/cheat-sheet.md`(25)                                                                              | 34        |
| `src/components/` | `src/components/CLAUDE.md`(20) → `@architecture/component-guide.md`(154)                                                       | 174       |
| `src/modules/`    | `src/modules/CLAUDE.md`(20) → `@data/cheat-sheet.md`(50), `@forms/cheat-sheet.md`(50), `@architecture/component-guide.md`(154) | 274       |
| `prisma/`         | `prisma/CLAUDE.md`(15) → `@rules/prisma.md`(6)                                                                                 | 21        |

## 새 파일 추가 시 체크리스트

- [ ] 항상 로딩인가, 컨텍스트 로딩인가?
- [ ] 항상 로딩이면 총 줄수를 고려했는가?
- [ ] 루트 CLAUDE.md에서 `@import` 하는가? (항상) 아니면 디렉토리 CLAUDE.md에서? (컨텍스트)
