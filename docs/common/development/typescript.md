# TypeScript 규칙

<!-- 관련 Skills: vercel-react-best-practices (React 타입 패턴),
                  shadcn (컴포넌트 props 타입)
     이 문서는 프로젝트 TypeScript 규칙만 기술합니다.
     React 19 타입은 Skill 참조. -->

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

## `satisfies` 사용 (권장)

- 객체 리터럴이 특정 타입을 만족하는지 검증하되, 추론된 리터럴 타입을 유지
- `as`보다 우선 사용

```typescript
// Good: satisfies는 추론 유지
const routes = {
  home: '/',
  settings: '/settings',
} satisfies Record<string, string>;
// routes.home은 '' (리터럴), satisfies가 Record<string, string> 검증

// Bad: as는 추론 손실
const routes = {
  home: '/',
  settings: '/settings',
} as Record<string, string>;
// routes.home은 string (넓어짐)
```

## Branded Types (권장)

- 도메인 ID, IP, MAC 등 의미적으로 다른 string/number를 구분

```typescript
type SubnetId = string & { __brand: 'SubnetId' };
type DeviceId = string & { __brand: 'DeviceId' };

function getSubnet(id: SubnetId) { /* ... */ }
const id: string = '...';
getSubnet(id); // ❌ 컴파일 에러
const subnetId = id as SubnetId; // 명시적 캐스팅 필요
```

## Discriminated Unions (권장)

- 상태/액션 표현 시 `kind` 또는 `type` 필드로 판별

```typescript
type AsyncState<T> =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: T }
  | { kind: 'error'; error: Error };

// 사용: switch로 exhaustiveness 보장
switch (state.kind) {
  case 'idle': /* ... */ break;
  case 'loading': /* ... */ break;
  case 'success': /* ... */ break;
  case 'error': /* ... */ break;
}
```

## `as const` 활용 (권장)

- 리터럴 타입 보존, readonly 배열/객체

```typescript
// Good
const STATUSES = ['active', 'inactive', 'pending'] as const;
type Status = (typeof STATUSES)[number]; // 'active' | 'inactive' | 'pending'

// Bad
const STATUSES: string[] = ['active', 'inactive', 'pending'];
type Status = string; // 너무 넓음
```

## Generic Constraints (권장)

- 제네릭 타입 매개변수에 `extends`로 제약 추가

```typescript
// Good
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // ...
}

// Bad: any 사용
function pick(obj: any, keys: any[]): any { /* ... */ }
```

## 유틸리티 타입 조합 (권장)

- `Pick`, `Omit`, `Partial`, `Required`, `Record` 조합으로 derived 타입 생성
- 중복 타입 정의 금지

```typescript
type SubnetSummary = Pick<Subnet, 'id' | 'network' | 'cidr'>;
type SubnetUpdate = Partial<Pick<Subnet, 'name' | 'description'>>;
type SubnetBySite = Record<SiteId, Subnet[]>;
```

## `// @reason` 주석 (필수, any 예외 시)

`any` 사용 시 반드시 이유 명시:

```typescript
// @reason: TanStack Form onChange 시그니처가 unknown을 허용하지 않음
const value: any = event.target.value;
```

## `// @ts-expect-error` / `// @ts-ignore` (권장 금지)

- 타입 에러 회피용 주석은 사용 금지
- 진짜로 타입 정의가 잘못된 경우만 사용, 사유 명시
