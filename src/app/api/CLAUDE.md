# API 라우트 컨벤션

에러 처리 (ZodError vs 서버), 접근성 등 공통 규칙 → [docs/core/conventions.md](../../../docs/core/conventions.md) 참조.

## 🚨 핵심 규칙

**`src/app/api/` 는 Production 전용이다.** 이 디렉토리의 모든 라우트는 Next.js 빌드 시 실제 HTTP 엔드포인트로 노출된다.

| 모듈 유형 | `src/app/api/` 존재 여부 | 데이터 소스 |
|-----------|:--:|------|
| **Production** (ipam, view-settings) | ✅ | Prisma |
| **Demo / Library** (dashboard, products, users) | ❌ | `service.ts` → mock-store |

Demo 모듈이 `src/app/api/`를 사용하는 것은 **금지**다. Demo 데이터는 mock-store에서 직접 반환하며, 절대 실제 HTTP 엔드포인트로 노출되지 않아야 한다.

## 기본 구조

- 경로: `src/app/api/<name>/route.ts`
- HTTP 메서드를 함수명 그대로 export: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- 동적 라우트: `src/app/api/<name>/[id]/route.ts` → `{ params: Promise<{ id: string }> }`

## 응답 포맷

모든 API는 `@/lib/api-response`의 표준 응답 래퍼를 사용:

```typescript
import { success, failure } from '@/lib/api-response';

// 성공 (200)
return NextResponse.json(success(data));

// 생성 성공 (201)
return NextResponse.json(success(data), { status: 201 });

// 실패 — 항상 status 명시
return NextResponse.json(failure('유효성 검사 실패'), { status: 400 });
return NextResponse.json(failure('찾을 수 없습니다'), { status: 404 });
return NextResponse.json(failure('서버 오류'), { status: 500 });
```

**응답 인터페이스**: `{ success: boolean, data: T | null, error: string | null }`

## Zod 유효성 검사

요청 본문 검증은 Zod 스키마 + `.parse()`:

```typescript
import { subnetSchema } from '@/modules/ipam/schemas';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = subnetSchema.parse(body); // 실패 시 ZodError → catch
  // ...
}
```

- 스키마는 `src/modules/<name>/schemas.ts`에 정의
- `.parse()` 실패 시 `ZodError`가 throw되므로 try/catch로 감싸서 처리

## 에러 핸들링

에러 종류에 따라 **반드시** 적절한 HTTP 상태 코드를 반환해야 합니다:

| 상황                 | HTTP 상태 | 판별 방법                        |
| -------------------- | --------- | -------------------------------- |
| Zod 유효성 검사 실패 | 400       | `error instanceof ZodError` 체크 |
| 필수 파라미터 누락   | 400       | 명시적 검증                      |
| 리소스 없음          | 404       | null/undefined 체크              |
| 서버 내부 오류       | 500       | 그 외 모든 catch 에러            |

**표준 패턴**:

```typescript
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = subnetSchema.parse(body);
    const result = await createSubnet(parsed);
    return NextResponse.json(success(result), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(failure('유효성 검사 실패'), { status: 400 });
    }
    return NextResponse.json(failure('서브넷 생성 실패'), { status: 500 });
  }
}
```

## Production API: 계층 분리 (IPAM 참조 구현)

`src/app/api/ipam/` — 가장 완성도 높은 참조 구현:

```
api/ipam/
├── subnets/route.ts          → GET(목록), POST(생성)
├── subnets/[id]/route.ts     → GET, PUT, DELETE
├── ip-addresses/route.ts     → GET(목록)
├── ip-addresses/[id]/route.ts → GET, PUT, DELETE
├── ip-addresses/assign/route.ts  → POST(할당)
├── ip-addresses/search/route.ts  → GET(검색)
└── ip-addresses/[id]/release/route.ts → POST(반납)
```

**계층 구조**:

- **`route.ts`**: 요청 파싱, Zod 검증, 응답 포매팅만 담당 (thin controller)
- **`src/modules/ipam/api/*-handlers.ts`**: 실제 비즈니스 로직 (Prisma 쿼리 등)
- **`src/modules/ipam/schemas.ts`**: Zod 스키마 정의
