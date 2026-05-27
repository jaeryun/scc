# 외부 API 응답 타입 모델링 (NetBox Raw 패턴)

> NetBox 등 snake_case 중첩 응답을 반환하는 외부 API의 타입을 안전하게 모델링하는 패턴.

## 언제 사용하는가

외부 API가 snake_case 필드명과 중첩 객체(예: `{ device_type: { model: string } }`)를 반환할 때.
도메인 타입은 camelCase 평탄화, Raw 타입은 API 응답 그대로 유지.

## 파일 구조

```
src/modules/<name>/api/
  types.ts    → 도메인 타입 + NetBox<Name>Raw 타입
  service.ts  → apiClient<NetBoxXxxRaw> + toXxx() 변환 함수
```

## 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| Raw 타입 | `NetBox<도메인>Raw` | `NetBoxDeviceRaw`, `NetBoxPrefixRaw` |
| 도메인 타입 | PascalCase 도메인명 | `Device`, `Prefix`, `IpAddress` |
| 변환 함수 | `to<도메인>(raw)` | `toDevice(raw)`, `toPrefix(raw)` |

## 타입 정의 (`api/types.ts`)

Raw 타입은 NetBox API 응답을 그대로 모델링합니다. 필드명은 snake_case, 중첩 객체는 필요한 속성만 선택적으로 정의합니다.

```typescript
// 도메인 타입 — 앱 내부에서 사용 (camelCase, 평탄화)
export interface Device {
  id: number;
  name: string;
  deviceType: string;
  role: string;
  site: string | null;
  status: string;
}

// Raw 타입 — NetBox API 응답 그대로 (snake_case, 중첩)
export interface NetBoxDeviceRaw {
  id: number;
  name: string | null;
  device_type: { model: string } | null;
  role: { name: string } | null;
  site: { name: string } | null;
  status: { value: string } | string;
}
```

### Choice 필드 (Unity 타입)

NetBox의 ChoiceField(선택형 필드)는 `{ value: string } | string`으로 모델링합니다.
- API가 객체를 반환: `{ value: 'active' }`
- API가 문자열을 반환: `'active'`

```typescript
// Choice 필드 — 런타임 분기로 처리
status: { value: string } | string;
```

## 변환 함수 (`api/service.ts`)

`service.ts` 내부에 `toXxx()` 비공개 함수를 정의합니다. Raw 타입을 도메인 타입으로 변환하며, 이 함수 내에서만 Raw 타입을 참조합니다.

```typescript
function toDevice(raw: NetBoxDeviceRaw): Device {
  return {
    id: raw.id,
    name: raw.name ?? '(unnamed)',
    deviceType: raw.device_type?.model ?? '',
    role: raw.role?.name ?? '',
    site: raw.site?.name ?? null,
    status: typeof raw.status === 'string'
      ? raw.status
      : (raw.status.value ?? ''),
  };
}
```

변환 규칙:
- `??` 연산자로 nullish 기본값 처리
- 중첩 객체는 optional chaining(`?.`)으로 접근
- Choice 필드는 `typeof raw.field === 'string'`으로 분기

## apiClient 사용

`service.ts` 내부에서 `apiClient<T>` 제네릭에 Raw 타입을 전달합니다.

```typescript
// 목록 조회 — Raw 배열
const data = await apiClient<NetBoxDeviceRaw[]>(
  '/api/dcim/devices/'
);

// 단일 조회 — Raw 단일
const data = await apiClient<NetBoxDeviceRaw>(
  `/api/dcim/devices/${id}/`
);

// 변환 후 도메인 타입 반환
export async function getDevices(): Promise<Device[]> {
  const raw = await apiClient<NetBoxDeviceRaw[]>('/api/dcim/devices/');
  return raw.map(toDevice);
}

export async function getDevice(id: number): Promise<Device> {
  const raw = await apiClient<NetBoxDeviceRaw>(`/api/dcim/devices/${id}/`);
  return toDevice(raw);
}
```

## 노출 범위

| 대상 | 접근 가능 | 설명 |
|------|-----------|------|
| `api/service.ts` | NetBoxXxxRaw + 도메인 타입 | 변환 로직 구현 |
| `api/queries.ts` | 도메인 타입만 | queryOptions 반환 타입 |
| `hooks/` | 도메인 타입만 | useSuspenseQuery 반환값 |
| 컴포넌트 | 도메인 타입만 | UI 렌더링 |

Raw 타입은 `service.ts` 외부로 노출하지 않습니다. 컴포넌트와 hooks는 항상 도메인 타입만 사용합니다.

## 전체 예시: IPAM Prefix

```typescript
// types.ts
export interface Prefix {
  id: number;
  prefix: string;
  description: string;
  vlan: string | null;
  site: string | null;
  role: string | null;
}

export interface NetBoxPrefixRaw {
  id: number;
  prefix: string;
  description: string;
  vlan: { name: string } | null;
  site: { name: string } | null;
  role: { name: string } | null;
}
```

```typescript
// service.ts
function toPrefix(raw: NetBoxPrefixRaw): Prefix {
  return {
    id: raw.id,
    prefix: raw.prefix,
    description: raw.description ?? '',
    vlan: raw.vlan?.name ?? null,
    site: raw.site?.name ?? null,
    role: raw.role?.name ?? null,
  };
}

export async function getPrefixes(): Promise<Prefix[]> {
  const raw = await apiClient<NetBoxPrefixRaw[]>('/api/ipam/prefixes/');
  return raw.map(toPrefix);
}
```

## 전체 예시: Cables (중첩 배열)

```typescript
// types.ts
export interface Cable {
  id: number;
  type: string | null;
  status: string;
  label: string;
  aDevice: string;
  aInterface: string;
  bDevice: string;
  bInterface: string;
}

export interface NetBoxCableRaw {
  id: number;
  type: { value: string } | string | null;
  status: { value: string } | string;
  label: string;
  a_terminations: Array<{ device: { name: string }; name: string }>;
  b_terminations: Array<{ device: { name: string }; name: string }>;
}
```

```typescript
// service.ts
function toCable(raw: NetBoxCableRaw): Cable {
  const a = raw.a_terminations?.[0];
  const b = raw.b_terminations?.[0];
  return {
    id: raw.id,
    type: typeof raw.type === 'string'
      ? raw.type
      : (raw.type?.value ?? null),
    status: typeof raw.status === 'string'
      ? raw.status
      : (raw.status.value ?? 'connected'),
    label: raw.label ?? '',
    aDevice: a?.device?.name ?? '',
    aInterface: a?.name ?? '',
    bDevice: b?.device?.name ?? '',
    bInterface: b?.name ?? '',
  };
}
```

## 관련 문서

- [데이터 패턴 — Cheat Sheet](./cheat-sheet.md)
- [데이터 패턴 상세 가이드](./patterns.md)
- [코딩 컨벤션: TypeScript](../core/conventions.md#typescript)
