# Prisma 규칙

<!-- 관련 Skills: 해당 없음
     이 문서는 프로젝트 Prisma 규칙(db push 금지, 마이그레이션, 스키마/쿼리 패턴)만 기술합니다. -->

## `prisma db push` 절대 금지

- `prisma db push`는 기존 데이터를 전량 삭제하고 마이그레이션 이력을 파괴함
- `--accept-data-loss` 플래그는 데이터 손실을 의미 -- 어디서도 사용 금지 (개발/스테이징/프로덕션)
- 항상 `prisma migrate dev` 또는 `prisma migrate deploy` 사용

## 허용된 명령어

| 명령어 | 용도 |
| ------- | ------- |
| `prisma migrate dev --name YYMMDD_description` | 스키마 변경 시 마이그레이션 생성 및 적용 |
| `prisma migrate deploy` | 대기 중인 모든 마이그레이션 적용 (새 환경/DB 이관) |
| `prisma generate` | Prisma Client 재생성 |
| `prisma migrate status` | 마이그레이션 적용 상태 확인 |
| `prisma migrate diff` | 스키마와 마이그레이션 간 차이 감지 |

## 마이그레이션 네이밍

- 형식: `YYMMDD_작업-내용`
- 예시: `270524_add_batch_move_api`, `270523_add_folder_and_remove_tags`

> 실무 워크플로우 및 Shadow DB 설정은 `prisma/CLAUDE.md` 참조.

## 스키마 네이밍 (필수)

- Model: `PascalCase`, 단수형 (`Subnet`, `IpAddress`)
- Field: `camelCase` (`networkCidr`, `createdAt`)
- Relation 필드: 명시적 이름 (`author User @relation(...)`)
- Index/Unique 이름: `${Model}_${field}_idx` / `${Model}_${field}_key` (예: `Subnet_networkCidr_idx`)
- Enum: `PascalCase` 멤버, `SCREAMING_SNAKE_CASE` 값

## 인덱스/제약조건 (필수)

- 단일 필드 인덱스가 필요한 컬럼은 `@@index` 명시
- 복합 인덱스: 자주 함께 조회되는 필드 조합
- Unique 제약: 비즈니스 유니크 키 (예: `Subnet.networkCidr` 는 사이트 내 유니크)
- 복합 유니크: `@@unique([siteId, networkCidr])` (사이트 스코프)

```prisma
model Subnet {
  id          Int      @id @default(autoincrement())
  siteId      Int
  networkCidr String
  createdAt   DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, networkCidr])
  @@index([siteId])
  @@index([createdAt])
}
```

## Relation 규칙 (필수)

- `onDelete` / `onUpdate` 명시 (기본값 의존 금지)
- `Cascade`: 부모 삭제 시 자식도 삭제 (예: 사이트 삭제 → 서브넷 삭제)
- `Restrict`: 부모가 자식 참조 중이면 삭제 거부 (예: 디바이스가 참조 중인 사이트)
- `SetNull`: 참조만 끊고 보존 (예: 디바이스 owner)

## 쿼리 최적화 (필수)

### N+1 방지

- `include`/`select`로 한 번에 가져오기
- ❌ `for (const s of subnets) { await db.device.findMany({ where: { subnetId: s.id } }); }`
- ✅ `db.subnet.findMany({ include: { devices: true } })`

### 필요한 필드만 select

```typescript
// Good: 필요한 필드만
const subnets = await db.subnet.findMany({
  select: { id: true, networkCidr: true, site: { select: { name: true } } },
});

// Bad: 전체 필드
const subnets = await db.subnet.findMany({ include: { site: true } });
```

### 페이지네이션

- `skip`/`take` 또는 cursor 기반 (`cursor` + `take`)
- 무한 스크롤: cursor 권장

## 트랜잭션 (필수)

- 여러 모델 변경이 한 단위인 경우 `$transaction` 사용
- 트랜잭션 내 부분 실패 시 자동 롤백

```typescript
// Good
await db.$transaction(async (tx) => {
  const subnet = await tx.subnet.create({ data: { ... } });
  await tx.ipAddress.createMany({ data: ips.map((ip) => ({ ...ip, subnetId: subnet.id })) });
  return subnet;
});

// Bad: 부분 실패 시 데이터 불일치
const subnet = await db.subnet.create({ data: { ... } });
await db.ipAddress.createMany({ data: ips.map((ip) => ({ ...ip, subnetId: subnet.id })) });
```

- 인터랙티브 트랜잭션(`$transaction(async (tx) => ...)`) 권장
- 단순 변경은 `db.$transaction([op1, op2, op3])` 배열 형태 가능

## Shadow DB (개발)

- `prisma migrate dev`는 shadow DB로 변경 검증
- shadow DB는 `prisma migrate dev` 실행 시 자동 생성/삭제
- Docker compose로 띄운 Postgres 사용 권장 (`.env`의 `SHADOW_DATABASE_URL` — Prisma 표준)
- shadow DB는 `prisma migrate reset`으로 정리 가능

## 금지 패턴

- ❌ `db push` 사용
- ❌ 마이그레이션 파일 직접 수정 (재실행 시 충돌)
- ❌ `prisma.schema`에서 모델 간 순환 의존 (의미적으로 분리)
- ❌ 모델 간 cross-schema query (모듈 경계 무시)
