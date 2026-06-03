# TypeScript 규칙

## `any` 금지 (필수)

- 대신 `unknown` + 타입 가드 사용
- 서드파티 제네릭 제약, TanStack Form + Zod 불일치: `// @reason` 주석과 함께 예외 허용

## 객체 타입 (권장)

- 객체 정의는 `interface` 우선 (병합/확장 용이)
- 유니온, 매핑 타입은 `type` 사용

## 환경 변수 (필수)

- 클라이언트 접근 변수만 `NEXT_PUBLIC_` 접두사 사용
- 시크릿 키는 절대 `NEXT_PUBLIC_`로 노출 금지

## 폼 타입 (필수)

- 폼 값 타입은 항상 `z.infer<typeof schema>` 사용 -- 수동 타입 정의 금지
