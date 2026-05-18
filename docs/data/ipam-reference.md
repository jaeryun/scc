# IPAM 전체 코드 레퍼런스

> IPAM 모듈의 실제 전체 구현입니다. 새 기능을 만들 때 이 구조를 참조하십시오.
> 기본 패턴은 [data/cheat-sheet.md](./cheat-sheet.md) 및 [data/patterns.md](./patterns.md) 참조.

## api/types.ts — 응답 타입, 필터 타입, 뮤테이션 페이로드 타입

```typescript
import { Subnet, IpAddress } from '../types';

export type SubnetListResponse = Array<
  Subnet & { _count?: { ipAddresses: number } }
>;
export type SubnetDetailResponse = Subnet & {
  ipAddresses: IpAddress[];
};

export interface CreateSubnetPayload {
  network: string;
  description?: string | null;
  vlanId?: string | null;
  purpose?: string | null;
  centers: string[];
}

export interface UpdateSubnetPayload extends CreateSubnetPayload {
  id: string;
}
```

## api/service.ts — 백엔드 호출 전용 (apiClient 외 import 금지)

```typescript
import { apiClient } from '@/lib/api-client';

export async function getSubnets(): Promise<SubnetListResponse> {
  return apiClient('/api/ipam/subnets');
}

export async function createSubnet(
  data: CreateSubnetPayload
): Promise<SubnetDetailResponse> {
  return apiClient('/api/ipam/subnets', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

## api/queries.ts — queryOptions + 쿼리 키 팩토리

```typescript
import { queryOptions } from '@tanstack/react-query';
import { getSubnets, getSubnetById } from './service';

export const subnetKeys = {
  all: ['subnets'] as const,
  lists: () => [...subnetKeys.all, 'list'] as const,
  detail: (id: string) => [...subnetKeys.all, 'detail', id] as const
};

export const subnetsQueryOptions = () =>
  queryOptions({
    queryKey: subnetKeys.lists(),
    queryFn: () => getSubnets()
  });

export const subnetDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: subnetKeys.detail(id),
    queryFn: () => getSubnetById(id),
    enabled: !!id
  });
```

## api/mutations.ts — mutationOptions + 캐시 무효화

```typescript
import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createSubnet } from './service';
import { subnetKeys } from './queries';

export const createSubnetMutation = mutationOptions({
  mutationFn: (data: CreateSubnetPayload) => createSubnet(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  }
});
```

## api/subnet-handlers.ts — Prisma 비즈니스 로직 계층

```typescript
import { prisma } from '@/lib/prisma';
import { SubnetInput } from '../schemas';

export async function getSubnets() {
  return prisma.subnet.findMany({
    include: { _count: { select: { ipAddresses: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createSubnet(data: SubnetInput) {
  return prisma.subnet.create({ data });
}
```

## Route Handler — API 엔드포인트 (서비스 ↔ 핸들러 연결)

```typescript
// app/api/ipam/subnets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import * as handlers from '@/features/ipam/api/subnet-handlers';

export async function GET() {
  try {
    const subnets = await handlers.getSubnets();
    return NextResponse.json(success(subnets));
  } catch (error) {
    return NextResponse.json(failure('서브넷 조회 실패'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subnet = await handlers.createSubnet(body);
    return NextResponse.json(success(subnet));
  } catch (error) {
    return NextResponse.json(failure('서브넷 생성 실패'), { status: 500 });
  }
}
```

## 전체 데이터 흐름 (4계층)

```
컴포넌트 → hooks/use-*.ts → queries.ts (queryOptions) → service.ts → apiClient()
                           ↘ mutations.ts (mutationOptions) → service.ts → apiClient()
                                                                        ↓
                                                               Route Handler (API Route)
                                                                        ↓
                                                               *-handlers.ts (Prisma 로직)
                                                                        ↓
                                                                     Prisma
```

| 계층 | 파일 | 역할 |
|------|------|------|
| 1. 쿼리/뮤테이션 | `queries.ts`, `mutations.ts` | React Query 옵션, 캐시 전략 |
| 2. 서비스 | `service.ts` | API 호출 (유일한 교체 지점) |
| 3. 라우트 핸들러 | `app/api/*/route.ts` | HTTP 요청/응답 처리, 에러 핸들링 |
| 4. 비즈니스 로직 | `*-handlers.ts` | Prisma ORM 호출, 실제 데이터 연산 |
