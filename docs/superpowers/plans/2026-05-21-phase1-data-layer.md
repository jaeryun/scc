# Phase 1: Switch Port Mapping — Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NetBox REST API 연동 데이터 계층 구축 — types → service → queries → hooks → API routes

**Architecture:** `service.ts → apiClient() → /api/switch-mapping/... (Next.js Route) → netboxGet() → NetBox REST API`. NetBox API 패턴을 그대로 미러링 (`/api/switch-mapping/switches/`, `/api/switch-mapping/switches/{id}/`). 데이터 페칭 없는 순수 타입 계층.

**Tech Stack:** Next.js 16, React 19, TypeScript, TanStack Query v5, NetBox REST API (pynetbox for seed only)

---

## File Map

```
Create:
  src/modules/switch-mapping/types.ts               ← 도메인 타입
  src/modules/switch-mapping/api/types.ts            ← NetBox API 응답 타입
  src/modules/switch-mapping/api/netbox.ts           ← NetBox fetch 래퍼 (server-only)
  src/modules/switch-mapping/api/service.ts          ← apiClient()로 API Route 호출
  src/modules/switch-mapping/api/queries.ts          ← React Query queryOptions
  src/modules/switch-mapping/hooks/use-switch-ports.ts ← useQuery 래퍼
  src/modules/switch-mapping/index.ts                ← barrel export
  src/app/api/switch-mapping/switches/route.ts       ← NetBox 프록시 (list)
  src/app/api/switch-mapping/switches/[id]/route.ts  ← NetBox 프록시 (detail)

  scripts/seed-netbox.py                             ← NetBox seed (IB/SAN/UTP 3종)

Modify:
  .env.example                                       ← NETBOX_URL, NETBOX_TOKEN
```

---

### Task 0: NetBox Seed Data

**Files:**
- Create: `scripts/seed-netbox.py`
- Modify: `.env.example`

> **전제조건**: NetBox가 `http://localhost:8000`에 구동 중이며 관리자 계정으로 API 토큰 생성 완료. `pip install pynetbox` 필요.

- [ ] **Step 1: Create seed script skeleton**

```python
#!/usr/bin/env python3
"""NetBox seed script — IB / SAN / UTP rack switch test data.

Usage:
  NETBOX_URL=http://localhost:8000 NETBOX_TOKEN=<token> python scripts/seed-netbox.py
"""
import os
import sys
import pynetbox

NETBOX_URL = os.environ.get("NETBOX_URL", "http://localhost:8000")
NETBOX_TOKEN = os.environ.get("NETBOX_TOKEN", "")

if not NETBOX_TOKEN:
    print("ERROR: NETBOX_TOKEN environment variable is required", file=sys.stderr)
    print("Create a token in NetBox UI: Admin → Users → API Tokens", file=sys.stderr)
    sys.exit(1)

nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)
nb.http_session.verify = False  # 로컬 개발용

print(f"Connected to NetBox at {NETBOX_URL}")
```

- [ ] **Step 2: Create prerequisite objects (Manufacturer, DeviceRole, DeviceType, Site, Rack)**

```python
# ── Cleanup existing test data (idempotent re-run) ──
for name in ["ib-switch-01", "san-switch-01", "utp-switch-01",
             "gpu-node-01", "gpu-node-02", "gpu-node-03",
             "storage-01", "storage-02", "srv-01", "srv-02"]:
    existing = nb.dcim.devices.get(name=name)
    if existing:
        print(f"  Deleting existing device: {name}")
        existing.delete()

for slug in ["qm8700", "g720", "cat9300-48p", "hgx-h100", "asa-4000"]:
    existing = nb.dcim.device_types.get(slug=slug)
    if existing:
        existing.delete()

for slug in ["mellanox", "broadcom", "cisco"]:
    existing = nb.dcim.manufacturers.get(slug=slug)
    if existing:
        existing.delete()

for slug in ["ib-switch", "san-switch", "gpu-node", "server", "storage-node"]:
    existing = nb.dcim.device_roles.get(slug=slug)
    if existing:
        existing.delete()

site = nb.dcim.sites.get(slug="dc01")
if not site:
    site = nb.dcim.sites.create(name="DC01", slug="dc01")
rack = nb.dcim.racks.get(name="R01")
if not rack:
    rack = nb.dcim.racks.create(name="R01", site=site.id)

# ── Manufacturer ──
mellanox = nb.dcim.manufacturers.create(name="Mellanox", slug="mellanox")
broadcom = nb.dcim.manufacturers.create(name="Broadcom", slug="broadcom")
cisco    = nb.dcim.manufacturers.create(name="Cisco", slug="cisco")

# ── DeviceRole ──
ib_role   = nb.dcim.device_roles.create(name="IB Switch",  slug="ib-switch",  color="ff9800")
san_role  = nb.dcim.device_roles.create(name="SAN Switch", slug="san-switch", color="2196f3")
gpu_role  = nb.dcim.device_roles.create(name="GPU Node",   slug="gpu-node",   color="4caf50")
srv_role  = nb.dcim.device_roles.create(name="Server",     slug="server",     color="9c27b0")
stor_role = nb.dcim.device_roles.create(name="Storage",    slug="storage-node", color="f44336")

# Note: UTP switch re-uses the ib_role or we create a generic switch role
sw_role = nb.dcim.device_roles.get(slug="access-switch")
if not sw_role:
    sw_role = nb.dcim.device_roles.create(name="Access Switch", slug="access-switch", color="607d8b")

# ── DeviceType ──
ib_type  = nb.dcim.device_types.create(manufacturer=mellanox.id, model="QM8700", slug="qm8700", u_height=1)
san_type = nb.dcim.device_types.create(manufacturer=broadcom.id, model="G720", slug="g720", u_height=1)
utp_type = nb.dcim.device_types.create(manufacturer=cisco.id, model="Catalyst 9300-48P", slug="cat9300-48p", u_height=1)
gpu_dt   = nb.dcim.device_types.create(manufacturer=mellanox.id, model="HGX H100", slug="hgx-h100", u_height=4)
stor_dt  = nb.dcim.device_types.create(manufacturer=broadcom.id, model="ASA 4000", slug="asa-4000", u_height=2)

print("Prerequisites created.")
```

- [ ] **Step 3: Create IB Switch + GPU nodes**

```python
# ── IB Switch ──
ib_sw = nb.dcim.devices.create(
    name="ib-switch-01", device_type=ib_type.id, role=ib_role.id,
    site=site.id, rack=rack.id, status="active",
)

# ── GPU nodes ──
gpu1 = nb.dcim.devices.create(
    name="gpu-node-01", device_type=gpu_dt.id, role=gpu_role.id,
    site=site.id, rack=rack.id, status="active")
gpu2 = nb.dcim.devices.create(
    name="gpu-node-02", device_type=gpu_dt.id, role=gpu_role.id,
    site=site.id, rack=rack.id, status="active")
gpu3 = nb.dcim.devices.create(
    name="gpu-node-03", device_type=gpu_dt.id, role=gpu_role.id,
    site=site.id, rack=rack.id, status="active")

# ── IB ports (12 ports, 일부 down/unconnected) ──
ib_port_map = [
    (1,  gpu1, "mlx5_0", True),
    (2,  gpu2, "mlx5_0", True),
    (3,  None,  None,     False),
    (4,  gpu3, "mlx5_0", True),
    (5,  None,  None,     False),
    (6,  None,  None,     False),
    (7,  None,  None,     False),
    (8,  None,  None,     False),
    (9,  None,  None,     False),
    (10, None,  None,     False),
    (11, None,  None,     False),
    (12, None,  None,     False),
]

for port_num, host, host_iface, _up in ib_port_map:
    sw_iface = nb.dcim.interfaces.create(
        device=ib_sw.id,
        name=f"1/{port_num}",
        type="infiniband-ndr",
        speed=100_000_000,
        enabled=True,
    )
    if host and host_iface:
        host_iface_obj = nb.dcim.interfaces.create(
            device=host.id,
            name=host_iface,
            type="infiniband-ndr",
            speed=100_000_000,
            enabled=True,
        )
        nb.dcim.cables.create(
            a_terminations=[{"object_type": "dcim.interface", "object_id": sw_iface.id}],
            b_terminations=[{"object_type": "dcim.interface", "object_id": host_iface_obj.id}],
            status="connected",
        )

print(f"IB Switch: {ib_sw.id} — 12 ports, 3 connected")
```

- [ ] **Step 4: Create SAN Switch + storage hosts**

```python
# ── SAN Switch ──
san_sw = nb.dcim.devices.create(
    name="san-switch-01", device_type=san_type.id, role=san_role.id,
    site=site.id, rack=rack.id, status="active",
)

# ── Storage hosts ──
stor1 = nb.dcim.devices.create(
    name="storage-01", device_type=stor_dt.id, role=stor_role.id,
    site=site.id, rack=rack.id, status="active")
stor2 = nb.dcim.devices.create(
    name="storage-02", device_type=stor_dt.id, role=stor_role.id,
    site=site.id, rack=rack.id, status="active")

# ── SAN ports (8 ports) ──
san_port_map = [
    (1, stor1, "fc0", True),
    (2, stor2, "fc0", True),
    (3, None,  None,  False),
    (4, None,  None,  False),
    (5, None,  None,  False),
    (6, None,  None,  False),
    (7, None,  None,  False),
    (8, None,  None,  False),
]

for port_num, host, host_iface, _up in san_port_map:
    sw_iface = nb.dcim.interfaces.create(
        device=san_sw.id,
        name=f"0/{port_num}",
        type="32gfc-sfp28",
        speed=32_000_000,
        enabled=True,
    )
    if host and host_iface:
        host_iface_obj = nb.dcim.interfaces.create(
            device=host.id,
            name=host_iface,
            type="32gfc-sfp28",
            speed=32_000_000,
            enabled=True,
        )
        nb.dcim.cables.create(
            a_terminations=[{"object_type": "dcim.interface", "object_id": sw_iface.id}],
            b_terminations=[{"object_type": "dcim.interface", "object_id": host_iface_obj.id}],
            status="connected",
        )

print(f"SAN Switch: {san_sw.id} — 8 ports, 2 connected")
```

- [ ] **Step 5: Create UTP Rack Switch + servers**

```python
# ── UTP Switch ──
utp_sw = nb.dcim.devices.create(
    name="utp-switch-01", device_type=utp_type.id, role=sw_role.id,
    site=site.id, rack=rack.id, status="active",
)

# ── Servers ──
srv1 = nb.dcim.devices.create(
    name="srv-01", device_type=gpu_dt.id, role=srv_role.id,
    site=site.id, rack=rack.id, status="active")
srv2 = nb.dcim.devices.create(
    name="srv-02", device_type=gpu_dt.id, role=srv_role.id,
    site=site.id, rack=rack.id, status="active")

# ── UTP ports (6 ports sample) ──
utp_port_map = [
    (1, srv1, "eth0", True),
    (2, srv2, "eth0", True),
    (3, None,  None,   False),
    (4, None,  None,   False),
    (5, None,  None,   False),
    (6, None,  None,   False),
]

for port_num, host, host_iface, _up in utp_port_map:
    sw_iface = nb.dcim.interfaces.create(
        device=utp_sw.id,
        name=f"Gi1/0/{port_num}",
        type="1000base-t",
        speed=1_000_000,
        enabled=True,
    )
    if host and host_iface:
        host_iface_obj = nb.dcim.interfaces.create(
            device=host.id,
            name=host_iface,
            type="1000base-t",
            speed=1_000_000,
            enabled=True,
        )
        nb.dcim.cables.create(
            a_terminations=[{"object_type": "dcim.interface", "object_id": sw_iface.id}],
            b_terminations=[{"object_type": "dcim.interface", "object_id": host_iface_obj.id}],
            status="connected",
        )

print(f"UTP Switch: {utp_sw.id} — 6 ports, 2 connected")
print()
print("=" * 50)
print("SEED COMPLETE")
print(f"  NetBox UI: {NETBOX_URL}")
print(f"  IB Switch:  {NETBOX_URL}/dcim/devices/{ib_sw.id}/")
print(f"  SAN Switch: {NETBOX_URL}/dcim/devices/{san_sw.id}/")
print(f"  UTP Switch: {NETBOX_URL}/dcim/devices/{utp_sw.id}/")
```

- [ ] **Step 6: Add NetBox env vars to .env.example**

Read `.env.example`, append:

```env
# NetBox (Phase 1: switch port mapping data source)
NETBOX_URL=http://localhost:8000
NETBOX_TOKEN=your-netbox-api-token-here
```

- [ ] **Step 7: Execute seed and verify**

Run:
```bash
pip install pynetbox
python scripts/seed-netbox.py
```

Expected output: "SEED COMPLETE" with 3 switch URLs. Visit NetBox UI to verify devices/interfaces/cables exist.

---

### Task 1: Domain Types

**Files:**
- Create: `src/modules/switch-mapping/types.ts`

- [ ] **Step 1: Define domain types**

```typescript
// src/modules/switch-mapping/types.ts

export type SwitchType = 'ib' | 'san' | 'utp'

export type PortStatus = 'up' | 'down' | 'degraded' | 'unconnected'

export interface PortAttribute {
  key: string
  label: string
  value: string | number
  hidden?: boolean
}

export interface PortMapping {
  id: string
  switchName: string
  switchPortName: string
  hostName: string | null
  hostPortName: string | null
  status: PortStatus
  values: Record<string, string | number>
}

export interface SwitchPortsData {
  switchId: string
  switchType: SwitchType
  switchName: string
  ports: PortMapping[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/switch-mapping/types.ts
git commit -m "feat(switch-mapping): add domain types"
```

---

### Task 2: NetBox API Types

**Files:**
- Create: `src/modules/switch-mapping/api/types.ts`

- [ ] **Step 1: Define NetBox response types**

```typescript
// src/modules/switch-mapping/api/types.ts

export interface NetBoxDevice {
  id: number
  name: string | null
  device_type: { id: number; model: string; manufacturer: { id: number; name: string } }
  role: { id: number; name: string; slug: string }
  site: { id: number; name: string; slug: string } | null
  rack: { id: number; name: string } | null
  status: { value: string; label: string }
}

export interface NetBoxInterface {
  id: number
  device: { id: number; name: string | null }
  name: string
  label: string
  type: { value: string; label: string }
  speed: number | null
  wwn: string | null
  mtu: number | null
  enabled: boolean
  mgmt_only: boolean
  cable: number | null
  cable_end: string | null
  link_peers: NetBoxInterfaceLinkPeer[]
  connected_endpoints: NetBoxInterfaceLinkPeer[] | null
  connected_endpoints_type: string | null
  connected_endpoints_reachable: boolean | null
}

export interface NetBoxInterfaceLinkPeer {
  id: number
  device: { id: number; name: string | null }
  name: string
}

export interface NetBoxCable {
  id: number
  type: { value: string; label: string } | null
  status: { value: string; label: string }
  label: string
  a_terminations: NetBoxTerminationRef[]
  b_terminations: NetBoxTerminationRef[]
}

export interface NetBoxTerminationRef {
  object_type: string
  object_id: number
}

export interface NetBoxPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/switch-mapping/api/types.ts
git commit -m "feat(switch-mapping): add NetBox API response types"
```

---

### Task 3: NetBox Fetch Helper (Server-Only)

**Files:**
- Create: `src/modules/switch-mapping/api/netbox.ts`

> **중요**: 이 파일은 API Route handler에서만 import 합니다. 클라이언트 사이드에서 import 불가 (`process.env` 사용).

- [ ] **Step 1: Create server-only NetBox fetch wrapper**

```typescript
// src/modules/switch-mapping/api/netbox.ts

const NETBOX_URL = process.env.NETBOX_URL ?? 'http://localhost:8000'
const NETBOX_TOKEN = process.env.NETBOX_TOKEN ?? ''

export async function netboxGet<T>(path: string): Promise<T> {
  const url = `${NETBOX_URL}/api${path}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${NETBOX_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json; indent=4',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NetBox API ${res.status}: ${text.slice(0, 500)}`)
  }
  return res.json()
}

export function netboxUrl(): string {
  return NETBOX_URL
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/switch-mapping/api/netbox.ts
git commit -m "feat(switch-mapping): add server-only NetBox fetch helper"
```

---

### Task 4: API Routes (Next.js → NetBox Proxy)

**Files:**
- Create: `src/app/api/switch-mapping/switches/route.ts`
- Create: `src/app/api/switch-mapping/switches/[id]/route.ts`

> **설계 근거**: NetBox의 `/api/dcim/devices/` 및 `/api/dcim/devices/{id}/` 패턴을 미러링.

- [ ] **Step 1: Create list route (GET /api/switch-mapping/switches?role=...)**

```typescript
// src/app/api/switch-mapping/switches/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { success, failure } from '@/lib/api-response'
import { netboxGet } from '@/modules/switch-mapping/api/netbox'
import type { NetBoxDevice, NetBoxPaginatedResponse } from '@/modules/switch-mapping/api/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let path = '/dcim/devices/?limit=0&status=active'
    if (role) {
      path += `&role=${encodeURIComponent(role)}`
    }
    path += '&brief=true'

    const data = await netboxGet<NetBoxPaginatedResponse<NetBoxDevice>>(path)

    return NextResponse.json(success(data.results))
  } catch (error) {
    return NextResponse.json(
      failure(error instanceof Error ? error.message : 'NetBox fetch failed'),
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create detail route (GET /api/switch-mapping/switches/:id)**

```typescript
// src/app/api/switch-mapping/switches/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { success, failure } from '@/lib/api-response'
import { netboxGet } from '@/modules/switch-mapping/api/netbox'
import type {
  NetBoxDevice,
  NetBoxInterface,
  NetBoxPaginatedResponse,
} from '@/modules/switch-mapping/api/types'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const device = await netboxGet<NetBoxDevice>(`/dcim/devices/${id}/`)

    const interfaces = await netboxGet<NetBoxPaginatedResponse<NetBoxInterface>>(
      `/dcim/interfaces/?device_id=${id}&limit=0`
    )

    return NextResponse.json(success({ device, interfaces: interfaces.results }))
  } catch (error) {
    return NextResponse.json(
      failure(error instanceof Error ? error.message : 'NetBox fetch failed'),
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/switch-mapping/switches/route.ts
git add src/app/api/switch-mapping/switches/[id]/route.ts
git commit -m "feat(switch-mapping): add API routes (NetBox proxy)"
```

---

### Task 5: Service Layer

**Files:**
- Create: `src/modules/switch-mapping/api/service.ts`

> **설계**: `service.ts`는 `apiClient()`로 Next.js API Route를 호출합니다. NetBox 직접 호출은 하지 않습니다.

- [ ] **Step 1: Create service functions**

```typescript
// src/modules/switch-mapping/api/service.ts

import { apiClient } from '@/lib/api-client'
import type { NetBoxDevice, NetBoxInterface } from './types'
import type { PortMapping, PortStatus, SwitchType, SwitchPortsData } from '../types'

function inferSwitchType(roleSlug: string): SwitchType {
  if (roleSlug.includes('ib')) return 'ib'
  if (roleSlug.includes('san')) return 'san'
  return 'utp'
}

function inferPortStatus(iface: NetBoxInterface): PortStatus {
  if (!iface.enabled) return 'down'
  if (
    iface.connected_endpoints &&
    iface.connected_endpoints.length > 0 &&
    iface.connected_endpoints_reachable
  ) {
    return 'up'
  }
  return 'unconnected'
}

function buildPortMapping(
  switchDevice: NetBoxDevice,
  iface: NetBoxInterface
): PortMapping {
  const peer = iface.link_peers?.[0]
  const values: Record<string, string | number> = {}

  if (iface.speed != null) {
    const gbps = iface.speed / 1_000_000
    values['speed'] = gbps >= 1 ? `${gbps}Gbps` : `${iface.speed / 1_000}Mbps`
  }
  if (iface.wwn) values['wwn'] = iface.wwn
  if (iface.mtu != null) values['mtu'] = iface.mtu

  return {
    id: String(iface.id),
    switchName: switchDevice.name ?? `Device#${switchDevice.id}`,
    switchPortName: iface.name,
    hostName: peer?.device?.name ?? null,
    hostPortName: peer?.name ?? null,
    status: inferPortStatus(iface),
    values,
  }
}

const VIRTUAL_IFACE_PREFIXES = ['virtual', 'bridge', 'lag']

function isPhysicalInterface(iface: NetBoxInterface): boolean {
  if (iface.mgmt_only) return false
  const typeValue = iface.type.value
  return !VIRTUAL_IFACE_PREFIXES.some((pfx) => typeValue.startsWith(pfx))
}

export async function getSwitchesByRole(role: string): Promise<NetBoxDevice[]> {
  return apiClient<NetBoxDevice[]>(`/api/switch-mapping/switches?role=${encodeURIComponent(role)}`)
}

export async function getSwitchPorts(deviceId: string): Promise<SwitchPortsData> {
  const data = await apiClient<{
    device: NetBoxDevice
    interfaces: NetBoxInterface[]
  }>(`/api/switch-mapping/switches/${deviceId}`)

  const switchType = inferSwitchType(data.device.role.slug)
  const ports = data.interfaces
    .filter(isPhysicalInterface)
    .map((iface) => buildPortMapping(data.device, iface))

  return {
    switchId: String(data.device.id),
    switchType,
    switchName: data.device.name ?? `Device#${data.device.id}`,
    ports,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/switch-mapping/api/service.ts
git commit -m "feat(switch-mapping): add service layer (NetBox API proxy)"
```

---

### Task 6: React Query Layer + Hooks

**Files:**
- Create: `src/modules/switch-mapping/api/queries.ts`
- Create: `src/modules/switch-mapping/hooks/use-switch-ports.ts`

- [ ] **Step 1: Create query options**

```typescript
// src/modules/switch-mapping/api/queries.ts

import { queryOptions } from '@tanstack/react-query'
import { getSwitchesByRole, getSwitchPorts } from './service'

export const switchKeys = {
  all: ['switches'] as const,
  byRole: (role: string) => [...switchKeys.all, 'byRole', role] as const,
  detail: (id: string) => [...switchKeys.all, 'detail', id] as const,
}

export const switchesByRoleOptions = (role: string) =>
  queryOptions({
    queryKey: switchKeys.byRole(role),
    queryFn: () => getSwitchesByRole(role),
    enabled: !!role,
    staleTime: 30 * 1000,
  })

export const switchDetailOptions = (deviceId: string) =>
  queryOptions({
    queryKey: switchKeys.detail(deviceId),
    queryFn: () => getSwitchPorts(deviceId),
    enabled: !!deviceId,
    staleTime: 30 * 1000,
  })
```

- [ ] **Step 2: Create hooks**

```typescript
// src/modules/switch-mapping/hooks/use-switch-ports.ts

'use client'

import { useQuery } from '@tanstack/react-query'
import { switchDetailOptions, switchesByRoleOptions } from '../api/queries'

export function useSwitchPorts(deviceId: string) {
  return useQuery(switchDetailOptions(deviceId))
}

export function useSwitchesByRole(role: string) {
  return useQuery(switchesByRoleOptions(role))
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/switch-mapping/api/queries.ts
git add src/modules/switch-mapping/hooks/use-switch-ports.ts
git commit -m "feat(switch-mapping): add React Query layer + hooks"
```

---

### Task 7: Barrel Export

**Files:**
- Create: `src/modules/switch-mapping/index.ts`

- [ ] **Step 1: Create barrel export**

```typescript
// src/modules/switch-mapping/index.ts

export { useSwitchPorts, useSwitchesByRole } from './hooks/use-switch-ports'
export { switchDetailOptions, switchesByRoleOptions } from './api/queries'
export { getSwitchesByRole, getSwitchPorts } from './api/service'

export type { PortMapping, PortStatus, SwitchType, SwitchPortsData } from './types'
export type { NetBoxDevice, NetBoxInterface, NetBoxCable } from './api/types'
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/switch-mapping/index.ts
git commit -m "feat(switch-mapping): add barrel export"
```

---

### Task 8: Build Verification

- [ ] **Step 1: Run lint**

Run:
```bash
bun run lint
```

Expected: No errors from `src/modules/switch-mapping/` or `src/app/api/switch-mapping/`.

If lint errors about unused imports or missing modules, fix them.

- [ ] **Step 2: Run format check**

Run:
```bash
bun run format:check
```

Expected: No formatting issues. If issues, run `bun run format:fix`.

- [ ] **Step 3: Run build**

Run:
```bash
bun run build
```

Expected: Build succeeds. TypeScript compilation without errors.

- [ ] **Step 4: Run seed and dev server smoke test**

```bash
python scripts/seed-netbox.py
bun run dev
```

In another terminal, test the API:

```bash
curl http://localhost:3000/api/switch-mapping/switches?role=ib-switch
```

Expected: JSON array of devices including "ib-switch-01".

```bash
# GET the switch ID from above, then:
curl http://localhost:3000/api/switch-mapping/switches/<id>
```

Expected: JSON with `{ success: true, data: { device: {...}, interfaces: [...] } }`.

- [ ] **Step 5: Commit (if any fixes)**

```bash
git add -A
git commit -m "fix(switch-mapping): build verification fixes"
```

---

## Phase 1 Completion Checklist

- [ ] `scripts/seed-netbox.py` 실행 시 3개 스위치 + 7개 호스트 + 케이블 생성
- [ ] `bun run build` 성공
- [ ] `GET /api/switch-mapping/switches?role=ib-switch` → 장치 목록
- [ ] `GET /api/switch-mapping/switches/{id}` → 장치 + 인터페이스 + `link_peers` 포함
- [ ] `useSwitchPorts(id)` 훅이 정상 동작
- [ ] 모든 import가 `@/modules/switch-mapping` → `@/components/` 방향 (금지 방향 위반 없음)
