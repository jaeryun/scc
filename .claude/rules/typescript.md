---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript 규칙

- Strict 모드 활성화 (`tsconfig.json`)
- 공개 함수에 명시적 반환 타입 사용
- 객체 정의에 `type`보다 `interface` 우선
- `@/*` 별칭으로 src에서 임포트
- 폼 값 타입은 `z.infer<typeof schema>`로 추론
