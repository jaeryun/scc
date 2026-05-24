# ADR-002: NetBox v4.x 데이터 모델 연구 검증

## 날짜

2026-05-20

## 상태

채택됨

## 검증 출처

- NetBox v4.x `main` 브랜치 `choices.py` (전체 InterfaceTypeChoices)
- NetBox v4.x `main` 브랜치 `dcim/models/device_components.py` (Interface, CabledObjectModel, ModuleBay)
- NetBox v4.x `main` 브랜치 `dcim/models/cables.py` (Cable, CableTermination, CablePath)
- NetBox v4.x `main` 브랜치 `dcim/fields.py` (WWNField, MACAddressField)
- NetBox v4.x 공식 문서 — Interface, Cable, Device, Module, DeviceRole, Custom Fields

---

## 1. 검증 통과 항목 (확정)

### 1.1 InfiniBand 타입 9종 — **정확함**

NetBox `InterfaceTypeChoices`에서 InfiniBand 섹션 발췌:

```python
# InfiniBand
TYPE_INFINIBAND_SDR = 'infiniband-sdr'       # SDR (2 Gbps)
TYPE_INFINIBAND_DDR = 'infiniband-ddr'       # DDR (4 Gbps)
TYPE_INFINIBAND_QDR = 'infiniband-qdr'       # QDR (8 Gbps)
TYPE_INFINIBAND_FDR10 = 'infiniband-fdr10'   # FDR10 (10 Gbps)
TYPE_INFINIBAND_FDR = 'infiniband-fdr'       # FDR (13.5 Gbps)
TYPE_INFINIBAND_EDR = 'infiniband-edr'       # EDR (25 Gbps)
TYPE_INFINIBAND_HDR = 'infiniband-hdr'       # HDR (50 Gbps)
TYPE_INFINIBAND_NDR = 'infiniband-ndr'       # NDR (100 Gbps)
TYPE_INFINIBAND_XDR = 'infiniband-xdr'       # XDR (250 Gbps)
```

| 검증항목        | 결과    | 비고                             |
| --------------- | ------- | -------------------------------- |
| FDR10 포함 여부 | ✅ 포함 | `infiniband-fdr10` 존재          |
| XDR 존재 여부   | ✅ 존재 | `infiniband-xdr` 존재 (250 Gbps) |
| 총 9종          | ✅ 정확 | SDR~XDR 모두 존재                |

### 1.2 FibreChannel 타입 11종 — **정확함**

```python
# FibreChannel
TYPE_1GFC_SFP = '1gfc-sfp'                   # SFP (1GFC)
TYPE_2GFC_SFP = '2gfc-sfp'                   # SFP (2GFC)
TYPE_4GFC_SFP = '4gfc-sfp'                   # SFP (4GFC)
TYPE_8GFC_SFP_PLUS = '8gfc-sfpp'             # SFP+ (8GFC)
TYPE_16GFC_SFP_PLUS = '16gfc-sfpp'           # SFP+ (16GFC)
TYPE_32GFC_SFP28 = '32gfc-sfp28'             # SFP28 (32GFC)
TYPE_32GFC_SFP_PLUS = '32gfc-sfpp'           # SFP+ (32GFC)
TYPE_64GFC_QSFP_PLUS = '64gfc-qsfpp'         # QSFP+ (64GFC)
TYPE_64GFC_SFP_DD = '64gfc-sfpdd'            # SFP-DD (64GFC)
TYPE_64GFC_SFP_PLUS = '64gfc-sfpp'           # SFP+ (64GFC)
TYPE_128GFC_QSFP28 = '128gfc-qsfp28'         # QSFP28 (128GFC)
```

| 검증항목                          | 결과    | 비고                              |
| --------------------------------- | ------- | --------------------------------- |
| 64GFC multiple connector variants | ✅ 포함 | QSFP+, SFP-DD, SFP+ 3종 모두 존재 |
| 1GFC~128GFC 범위                  | ✅ 정확 | 전 구간 커버                      |

### 1.3 Interface 기본 구조 — **정확함**

| R1 주장                                 | 실제 NetBox 코드                                                                                                                          | 판정    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `speed` 단위 = Kbps                     | `speed = models.PositiveBigIntegerField(verbose_name=_('speed (Kbps)'))`<br>`InterfaceSpeedChoices`: `1000000 = '1 Gbps'` (=1000000 Kbps) | ✅ 정확 |
| `wwn` 필드 = `macaddr8` PostgreSQL 타입 | `WWNField` with `db_type(connection) -> 'macaddr8'`                                                                                       | ✅ 정확 |
| `module` FK nullable                    | `module = ForeignKey(... null=True, blank=True)` (ModularComponentModel)                                                                  | ✅ 정확 |
| `@@unique([deviceId, name])`            | `UniqueConstraint(fields=('device', 'name'))` (device_components.py ComponentModel.Meta)                                                  | ✅ 정확 |

### 1.4 Device 상태 — **정확함**

```python
class DeviceStatusChoices(ChoiceSet):
    STATUS_OFFLINE = 'offline'
    STATUS_ACTIVE = 'active'
    STATUS_PLANNED = 'planned'
    STATUS_STAGED = 'staged'
    STATUS_FAILED = 'failed'
    STATUS_INVENTORY = 'inventory'
    STATUS_DECOMMISSIONING = 'decommissioning'
```

| R1 주장                                                              | 판정    |
| -------------------------------------------------------------------- | ------- |
| 7종 (offline/active/planned/staged/failed/inventory/decommissioning) | ✅ 정확 |

### 1.5 DeviceRole — **부분 정확**

NetBox 문서 기준 필드: `parent`, `name`, `slug`, `color`, `vm_role`, `config_template`
| R1 주장 | 실제 NetBox | 판정 |
|---------|------------|------|
| MPTT 계층형 | ✅ parent (TreeForeignKey) | ✅ 정확 |
| name, color, vm_role | ✅ 존재 | ✅ 정확 |
| (누락) slug | ✅ 존재 (URL-friendly 식별자) | ⚠️ 누락 |
| (누락) config_template | ✅ 존재 (설정 템플릿 기본값) | ⚠️ 누락 |

### 1.6 Cable 모델 검증 — **정확함**

| R2 주장                                        | 실제 NetBox 코드                                                                                                                                   | 판정    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Cable + CableTermination 2테이블 구조          | `Cable`(PrimaryModel) + `CableTermination`(ChangeLoggedModel)                                                                                      | ✅ 정확 |
| CableTermination이 GenericForeignKey           | `termination = GenericForeignKey(ct_field='termination_type', fk_field='termination_id')`                                                          | ✅ 정확 |
| CabledObjectModel cable/cable_end 캐시         | `cable`, `cable_end`, `cable_connector`, `cable_positions` 필드 + `cable_terminations` GenericRelation                                             | ✅ 정확 |
| CableTermination ↔ 캐시 동기화                 | `CableTermination.save()` → `termination.set_cable_termination(self)`<br>`CableTermination.delete()` → `termination.clear_cable_termination(self)` | ✅ 정확 |
| Cable.a_terminations / b_terminations 프로퍼티 | `@property`로 `self.terminations.all()` 필터링하여 간접 접근                                                                                       | ✅ 정확 |
| CableTermination UniqueConstraint              | `(termination_type, termination_id)` + `(cable, cable_end, connector)`                                                                             | ✅ 정확 |
| CablePath 전체 경로 추적                       | `CablePath` 모델: `path`(JSONField), `is_active`, `is_complete`, `is_split`                                                                        | ✅ 정확 |

### 1.7 Module ↔ ModuleBay — **수정 필요**

| R1 주장                       | 실제 NetBox                                                                | 판정      |
| ----------------------------- | -------------------------------------------------------------------------- | --------- |
| "Module → ModuleBay OneToOne" | Module이 `module_bay = ForeignKey(ModuleBay)` + `installed_module` 역참조. | ⚠️ 부정확 |

**실제 관계**: Module → ModuleBay는 **ForeignKey**이며, 베이당 하나의 모듈만 설치되므로 실질적 OneToOne이나 DB 레벨에서는 FK로 구현됨. ModuleBay 쪽에는 Module을 직접 참조하는 컬럼이 없고, `installed_module`은 Module.module_bay에 대한 related_name을 통해 접근.

---

## 2. 수정/보완 필요 항목

### 2.1 InterfaceTypeChoices 총 개수 불일치

**R1 보고**: "전체 190종"
**실제 NetBox v4.x**: **약 212종**

추가된 주요 카테고리 (NetBox v4.x에서 확장):

| 카테고리          | 추가 타입                                                                                    | 개수 |
| ----------------- | -------------------------------------------------------------------------------------------- | ---- |
| 200 Gbps Ethernet | `200gbase-vr2`                                                                               | +1   |
| 400 Gbps Ethernet | `400gbase-vr4`, `400gbase-zr`, `400gbase-sr4_2`                                              | +3   |
| 800 Gbps Ethernet | 전체 (`800gbase-cr8/dr8/sr8/vr8`)                                                            | +4   |
| 1.6 Tbps Ethernet | 전체 (`1.6tbase-cr8/dr8/dr8-2`)                                                              | +3   |
| PON               | `25g-pon`, `50g-pon`                                                                         | +2   |
| Wireless          | `ieee802.11be` (Wi-Fi 7)                                                                     | +1   |
| Stacking          | `cisco-stackwise-320/480/1t`, `extreme-summitstack-128/256/512`                              | +6   |
| Pluggable         | `400gbase-x-cfp8`, `400gbase-x-osfp-rhs`, `1.6tbase-x-osfp1600-rhs`, `1.6tbase-x-qsfpdd1600` | +4   |

**Phase 1 권고**: InfiniBand 9종 + FibreChannel 11종 + 주요 Ethernet(10/25/40/50/100/200/400G)만 포함. 800G/1.6T/PON/Stacking은 Phase 2로 유보.

### 2.2 Cable 모델 Phase 1 단순화 권고

**R2 연구 제안**: CableTermination through table (GenericForeignKey 기반)

**검증 결론**: CableTermination through table은 NetBox의 **범용 종단 연결**(Interface, ConsolePort, PowerPort, FrontPort, RearPort, CircuitTermination, PowerFeed 등 7종 이상)을 위해 설계되었음.

**Phase 1 유스케이스**: switch↔host 직결만 필요 → Nautobot 스타일 직접 FK가 더 실용적.

| 접근 방식                                                                             | 장점                                | 단점                                                         |
| ------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| **Nautobot 스타일**<br>`Cable.aInterfaceId` / `Cable.bInterfaceId`                    | 단순 쿼리, 명확한 관계, JOIN 최소화 | Interface 외 다른 종단 연결 불가 (Phase 2 마이그레이션 필요) |
| **NetBox 스타일**<br>`CableTermination(cable, end, termination_type, termination_id)` | 확장성, 모든 종단 타입 지원         | Generic FK로 인한 복잡한 쿼리, TypeScript 타입 추론 어려움   |

**권고**: Phase 1은 Nautobot 스타일 채택. Phase 2에서 CableTermination through table 도입 시 Cable → Cable.aInterfaceId/bInterfaceId 제거 마이그레이션.

### 2.3 Device 통합 모델 검증

**R3 주장**: "NetBox에 별도 Host 엔티티 없음. Device로 통합 (role로 구분)"

**검증**: ✅ NetBox 공식 문서 확인 — Device는 role로 구분하며, Host 엔티티는 없고 VM은 `VirtualMachine` 별도 모델.

**Phase 1 권고**: Device 통합 유지. 단, host-specific 속성은 다음과 같이 처리:

| 속성                          | 처리 방식                              | 근거                                             |
| ----------------------------- | -------------------------------------- | ------------------------------------------------ |
| CPU, Memory, Disk             | `HostDetail` 1:1 확장 테이블 (Phase 1) | VM과 Host가 다른 구조; 정규화된 쿼리 가능        |
| IB GUID, WWN, LID             | Interface 정규 컬럼 (Phase 1)          | 강타입. 빈번한 검색/필터링 대상                  |
| OS, Firmware 버전             | `HostDetail` 정규 컬럼 (Phase 1)       | 장비 목록 필터링에 필요                          |
| ad-hoc 확장 속성              | `Device.metadata` JSONB (Phase 1)      | Custom Fields 대체; 스키마 외 속성 저장          |
| NetBox Custom Field 전체 기능 | Phase 2                                | CF type system, validation, grouping 필요시 도입 |

### 2.4 Prisma 스키마 평가

현재 `prisma/schema.prisma`는 Subnet, IpAddress, ViewSetting만 존재. Device/Interface/Cable 모델 전무.

**R1이 제안한 Prisma 스키마** (연구 보고서 참조)에 대한 평가:

| R1 제안 항목                   | 평가                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `InterfaceType` enum           | Enum이 아닌 String 권장 — Prisma enum은 DB enum 생성으로 마이그레이션 비용 높음. enum 값이 200종 가까이 되어 관리 부담. |
| `Interface.module FK` nullable | ✅ 적절                                                                                                                 |
| `Interface.speed` Int (Kbps)   | ✅ 적절. `BigInt`로 충분.                                                                                               |
| `Module.moduleBay FK` 명시     | ✅ 필요 (R1 설명은 OneToOne이라 했으나 FK로 구현)                                                                       |
| `Device.role` → DeviceRole FK  | ✅ 적절                                                                                                                 |
| `Device.status` → enum         | String 권장 (Prisma enum 마이그레이션 이슈와 동일)                                                                      |

### 2.5 보고서 간 모순점

| 항목                  | R1          | R2                             | R3               | 실제                         | 판정           |
| --------------------- | ----------- | ------------------------------ | ---------------- | ---------------------------- | -------------- |
| InterfaceType 총 개수 | 190종       | -                              | -                | ~212종                       | R1 과소 집계   |
| Module-ModuleBay 관계 | OneToOne    | -                              | -                | FK (실질적 1:1)              | R1 설명 부정확 |
| Cable 종단 방식       | -           | CableTermination through table | -                | CableTermination (GenericFK) | R2 정확        |
| Host 모델             | Device 통합 | -                              | Device 통합 권고 | Device 통합                  | R3 정확        |

### 2.6 빠진 중요 모델

연구 보고서에서 누락되었으나 NetBox v4.x에 존재하는 주요 DCIM 모델:

| 모델                     | 용도                                 | Phase 1 필요성                                  |
| ------------------------ | ------------------------------------ | ----------------------------------------------- |
| **Manufacturer**         | 제조사 (Mellanox, Cisco, Juniper...) | ✅ 필수 — DeviceType FK                         |
| **DeviceType**           | 기종/모델 (SN2700, QM8700...)        | ✅ 필수 — Device FK                             |
| **Platform**             | OS (Onyx, SONiC, EOS...)             | ✅ 필수 — Device FK                             |
| **Site / Location**      | 물리 위치 (데이터센터→랙)            | ✅ Phase 1 — Rack, Device에 필요                |
| **Rack**                 | 랙                                   | ✅ Phase 1                                      |
| **VirtualChassis**       | 스택 스위치 (MLAG/VPC)               | ⚠️ Phase 2                                      |
| **MACAddress**           | MAC 주소 별도 관리 (v4.2+)           | ⚠️ Phase 2 — Interface.primaryMacAddress로 충분 |
| **FrontPort / RearPort** | 패치패널 패스스루                    | ❌ Phase 2+                                     |
| **InventoryItem**        | 장비 내 부품 (PSU, Fan, Optics)      | ❌ Phase 2+                                     |
| **CablePath**            | 케이블 경로 추적                     | ❌ Phase 2+                                     |
| **IPAddress**            | IP 주소                              | ✅ Phase 1 — 기존 Subnet/IpAddress 확장         |
| **VLAN**                 | VLAN 정의                            | ⚠️ Phase 2                                      |
| **VRF**                  | VRF 인스턴스                         | ⚠️ Phase 2                                      |

---

## 3. Phase 1 Prisma 스키마 최종 권고안

```prisma
// ============================================================
// Phase 1: Core DCIM Models (InfiniBand/Ethernet Fabric)
// ============================================================

// ---- Enums (String-backed for migration safety) ----

// Device Status (NetBox DeviceStatusChoices)
// offline | active | planned | staged | failed | inventory | decommissioning

// ---- Organization ----

model Manufacturer {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  description String?
  devices     Device[]
  deviceTypes DeviceType[]
  platforms   Platform[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model DeviceType {
  id              String       @id @default(cuid())
  model           String
  slug            String
  manufacturerId  String
  manufacturer    Manufacturer @relation(fields: [manufacturerId], references: [id])
  uHeight         Int          @default(1)     // 0=PDU, 1=1U, 2=2U...
  isFullDepth     Boolean      @default(true)
  description     String?
  devices         Device[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@unique([manufacturerId, slug])
}

model Platform {
  id             String       @id @default(cuid())
  name           String       @unique
  slug           String       @unique
  manufacturerId String?
  manufacturer   Manufacturer? @relation(fields: [manufacturerId], references: [id])
  description    String?
  devices        Device[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ---- Location Hierarchy ----

model Site {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  status      String     @default("active") // planned|staging|active|decommissioning|retired
  description String?
  locations   Location[]
  racks       Rack[]
  devices     Device[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Location {
  id          String   @id @default(cuid())
  name        String
  slug        String
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  parentId    String?
  parent      Location? @relation("LocationHierarchy", fields: [parentId], references: [id])
  children    Location[] @relation("LocationHierarchy")
  status      String   @default("active")
  description String?
  racks       Rack[]
  devices     Device[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([siteId, slug])
}

model Rack {
  id          String   @id @default(cuid())
  name        String
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  locationId  String?
  location    Location? @relation(fields: [locationId], references: [id])
  status      String   @default("active") // reserved|available|planned|active|deprecated
  uHeight     Int      @default(42)        // 42U standard
  description String?
  devices     Device[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([siteId, name])
}

// ---- Device & Roles ----

model DeviceRole {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  color       String     @default("607d8b") // hex color
  vmRole      Boolean    @default(false)
  description String?
  devices     Device[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Device {
  id                String        @id @default(cuid())
  name              String?
  roleId            String
  role              DeviceRole    @relation(fields: [roleId], references: [id])
  deviceTypeId      String
  deviceType        DeviceType    @relation(fields: [deviceTypeId], references: [id])
  platformId        String?
  platform          Platform?     @relation(fields: [platformId], references: [id])
  siteId            String?
  site              Site?         @relation(fields: [siteId], references: [id])
  locationId        String?
  location          Location?     @relation(fields: [locationId], references: [id])
  rackId            String?
  rack              Rack?         @relation(fields: [rackId], references: [id])
  rackFace          String?       @default("front") // front|rear
  position          Int?          // lowest rack unit occupied
  status            String        @default("active") // offline|active|planned|staged|failed|inventory|decommissioning
  serialNumber      String?
  assetTag          String?
  description       String?

  // Denormalized: primary IP (IPAM 연계시 FK로 전환)
  primaryIpv4       String?
  primaryIpv6       String?

  // Phase 1: JSONB for ad-hoc extensibility (NetBox Custom Fields 대체)
  metadata          Json          @default("{}")

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Relations
  interfaces        Interface[]
  hostDetail        HostDetail?
  moduleBays        ModuleBay[]
  modules           Module[]

  @@unique([siteId, name])
  @@index([roleId])
  @@index([siteId])
  @@index([rackId])
  @@index([status])
}

// Host-specific detail (1:1 with Device, role=server/host인 경우만)
model HostDetail {
  id          String   @id @default(cuid())
  deviceId    String   @unique
  device      Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  cpuCores    Int?
  cpuModel    String?
  memoryGb    Int?
  diskGb      Int?
  osVersion   String?
  firmwareVer String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ---- Module System ----

model Module {
  id             String      @id @default(cuid())
  deviceId       String
  device         Device      @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  moduleBayId    String      @unique        // One module per bay
  moduleBay      ModuleBay   @relation(fields: [moduleBayId], references: [id])
  moduleTypeId   String
  moduleType     ModuleType  @relation(fields: [moduleTypeId], references: [id])
  status         String      @default("active") // offline|active|planned|staged|failed|decommissioning
  serialNumber   String?
  assetTag       String?
  description    String?
  interfaces     Interface[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model ModuleType {
  id             String       @id @default(cuid())
  model          String
  manufacturerId String
  manufacturer   Manufacturer @relation(fields: [manufacturerId], references: [id])
  description    String?
  modules        Module[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([manufacturerId, model])
}

model ModuleBay {
  id          String    @id @default(cuid())
  deviceId    String
  device      Device    @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  name        String
  position    String?   // slot identifier
  parentId    String?
  parent      ModuleBay? @relation("ModuleBayHierarchy", fields: [parentId], references: [id])
  children    ModuleBay[] @relation("ModuleBayHierarchy")
  module      Module?   // installed module (1:1 via Module.moduleBayId)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([deviceId, name])
}

// ---- Interfaces ----

model Interface {
  id              String      @id @default(cuid())
  deviceId        String
  device          Device      @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  moduleId        String?
  module          Module?     @relation(fields: [moduleId], references: [id], onDelete: SetNull)
  name            String
  label           String?     // physical label (e.g. "Port 1")
  type            String      // InterfaceTypeChoices value (212종)
  kind            String      @default("physical") // physical|virtual|wireless (InterfaceKindChoices)
  enabled         Boolean     @default(true)
  speed           BigInt?     // Kbps
  duplex          String?     // half|full|auto
  mtu             Int?
  wwn             String?     // WWN (64-bit, PostgreSQL macaddr8 형식)
  macAddress      String?     // primary MAC (v4.2+ 별도 MACAddress 모델에서 마이그레이션)

  // InfiniBand-specific (정규 컬럼 — 빈번한 검색 대상)
  ibGuid          String?     // IB GUID (64-bit hex)
  ibLid           Int?        // IB LID (16-bit)
  ibPartitionKey  String?     // IB PKey

  // Status / management flags
  mgmtOnly        Boolean     @default(false)
  markConnected   Boolean     @default(false)
  description     String?

  // LAG / Bridge / Parent
  lagId           String?
  lag             Interface?  @relation("LAGMembers", fields: [lagId], references: [id])
  memberIfaces    Interface[] @relation("LAGMembers")
  bridgeId        String?
  bridge          Interface?  @relation("BridgeMembers", fields: [bridgeId], references: [id])
  bridgedIfaces   Interface[] @relation("BridgeMembers")
  parentId        String?
  parent          Interface?  @relation("SubInterfaces", fields: [parentId], references: [id])
  childIfaces     Interface[] @relation("SubInterfaces")

  // Denormalized cable cache (CabledObjectModel)
  cableId         String?
  cable           Cable?      @relation(fields: [cableId], references: [id], onDelete: SetNull)
  cableEnd        String?     // 'A' | 'B'

  // IP addresses
  ipAddresses     IpAddress[]
  vrfId           String?
  vrf             VRF?        @relation(fields: [vrfId], references: [id])

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@unique([deviceId, name])
  @@index([deviceId])
  @@index([type])
  @@index([ibGuid])
}

// ---- Cables (Nautobot-style direct FK for Phase 1) ----

model Cable {
  id              String      @id @default(cuid())
  type            String?     // CableTypeChoices: cat5e|cat6|mmf-om4|smf-os2|dac|aoc|...
  status          String      @default("active") // active|planned|decommissioning
  label           String?
  color           String?     // hex color
  length          Decimal?    @db.Decimal(8, 2)
  lengthUnit      String?     // m|cm|ft|in
  description     String?

  // Nautobot-style direct endpoints (switch↔host 직결)
  aInterfaceId    String
  aInterface      Interface   @relation("CableA", fields: [aInterfaceId], references: [id])
  bInterfaceId    String
  bInterface      Interface   @relation("CableB", fields: [bInterfaceId], references: [id])

  // Ensure no self-connection
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@unique([aInterfaceId, bInterfaceId])
  @@index([aInterfaceId])
  @@index([bInterfaceId])
}

// ---- IPAM ----

model VRF {
  id          String      @id @default(cuid())
  name        String      @unique
  description String?
  interfaces  Interface[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

// 기존 Subnet/IpAddress 모델 확장

model Subnet {
  id          String      @id @default(cuid())
  network     String      @unique
  description String?
  vlanId      String?
  purpose     String?
  vrfId       String?
  vrf         VRF?        @relation(fields: [vrfId], references: [id])
  centers     String[]    @default([])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  ipAddresses IpAddress[]
  @@index([network])
}

model IpAddress {
  id          String    @id @default(cuid())
  ip          String
  status      IpStatus  @default(FREE)
  hostname    String?
  description String?
  subnetId    String
  subnet      Subnet    @relation(fields: [subnetId], references: [id], onDelete: Cascade)
  interfaceId String?
  interface   Interface? @relation(fields: [interfaceId], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@unique([ip, subnetId])
}

enum IpStatus {
  FREE
  ALLOCATED
  RESERVED
  DISABLED
}

// 기존 ViewSetting 유지
model ViewSetting {
  id        String   @id @default(cuid())
  viewId    String   @unique
  icon      String   @default("dashboard")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 4. Phase 2 유보 항목

| 항목                               | 유보 사유                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| **CableTermination through table** | Phase 1은 Interface 간 직결만 지원. ConsolePort, PowerPort, 패치패널 등 타 종단 필요시 도입  |
| **CablePath (path tracing)**       | 케이블 경로 추적은 switch↔host 직결 환경에서 불필요. 복잡한 패치패널 토폴로지 필요시 도입    |
| **FrontPort / RearPort**           | 패치패널 모델링. Phase 2                                                                     |
| **InventoryItem**                  | 트랜시버, PSU, Fan 등 장비 내 부품 관리. Phase 2                                             |
| **MACAddress (v4.2+ 별도 모델)**   | Interface.macAddress로 우선 충분. 다중 MAC 필요시 Phase 2                                    |
| **VirtualChassis**                 | 스위치 스택/MLAG 모델링. Phase 2                                                             |
| **VLAN / 802.1Q**                  | Phase 1은 단순 L3 인터페이스. VLAN Tagging 필요시 Phase 2                                    |
| **WirelessLink / WirelessLAN**     | 무선 인프라. Phase 2                                                                         |
| **NetBox Custom Fields 전체 기능** | 타입 시스템, 유효성 검사, 선택 필드. Phase 2                                                 |
| **ConfigContext (계층 JSON 병합)** | Phase 1은 단일 Device.metadata JSONB. 멀티 레벨 병합(Region→Site→Role→Device) 필요시 Phase 2 |
| **800G / 1.6T Interface Types**    | 현재 InfiniBand/FC/기본 Ethernet 커버. 초고속 이더넷 필요시 추가                             |

---

## 5. InterfaceType 열거 (InfiniBand + FibreChannel 발췌)

Prisma schema에 String으로 저장하므로, 애플리케이션 레벨에서 상수로 관리. Phase 1 기준 최소 포함 목록:

**InfiniBand (9종)**:

```
infiniband-sdr, infiniband-ddr, infiniband-qdr,
infiniband-fdr10, infiniband-fdr, infiniband-edr,
infiniband-hdr, infiniband-ndr, infiniband-xdr
```

**FibreChannel (11종)**:

```
1gfc-sfp, 2gfc-sfp, 4gfc-sfp, 8gfc-sfpp,
16gfc-sfpp, 32gfc-sfp28, 32gfc-sfpp,
64gfc-qsfpp, 64gfc-sfpdd, 64gfc-sfpp, 128gfc-qsfp28
```

**Ethernet (Phase 1 주요)**:

```
10gbase-sr/lr/er/cr/t, 25gbase-sr/lr/er/cr,
40gbase-sr4/lr4/cr4, 50gbase-sr/lr/fr/cr,
100gbase-sr4/lr4/cr4/dr, 200gbase-sr4/fr4/dr4,
400gbase-sr8/dr4/fr4/lr4
```

---

## 결론

3명 연구원의 NetBox v4.x 분석은 **전반적으로 높은 정확도**를 보이나, 다음 3가지 핵심 수정이 필요합니다:

1. **InterfaceType 총 개수**: 190종 → ~212종 (NetBox v4.x 확장분 미반영). Phase 1에 지장 없음.
2. **Cable 모델**: CableTermination through table 대신 **Nautobot-style 직접 FK**로 Phase 1 단순화.
3. **Module-ModuleBay 관계**: OneToOne이 아닌 **ForeignKey** (Module → ModuleBay).

Phase 1 Prisma 스키마 권고안은 위 검증 결과를 반영하여 작성되었으며, 기존 Subnet/IpAddress/ViewSetting 모델과 호환됩니다.
