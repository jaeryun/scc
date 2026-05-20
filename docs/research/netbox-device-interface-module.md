# NetBox v4.x — Device / Interface / Module 데이터 모델

> **소스**: `netbox-community/netbox` (main 브랜치, 2026-05-20 기준)
> **조사 범위**: Device, Interface, Module/ModuleBay/ModuleType, DeviceType/Manufacturer

---

## 1. Manufacturer

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | CharField | 하드웨어 제조사 |
| `slug` | SlugField | 슬러그 |
| `description` | CharField | 설명 |

`ordering = ('name',)`. ContactsMixin 상속으로 연락처 관리 지원.

---

## 2. DeviceType

```python
class DeviceType(ImageAttachmentsMixin, PrimaryModel, WeightMixin):
    manufacturer = FK(Manufacturer, PROTECT)     # 제조사
    model = CharField(100)                       # 모델명
    slug = SlugField(100)                        # 슬러그
    default_platform = FK(Platform, SET_NULL)    # 기본 플랫폼
    part_number = CharField(50)                  # 부품 번호
    u_height = DecimalField(4,1)                 # 랙 유닛 높이 (0.5 단위)
    is_full_depth = BooleanField(default=True)   # 전면+후면 모두 차지
    subdevice_role = CharField(50, null=True)    # parent/child
    airflow = CharField(50, null=True)           # 공기 흐름 방향
    front_image = ImageField()                   # 전면 이미지
    rear_image = ImageField()                    # 후면 이미지
    weight = DecimalField()                      # 중량
    weight_unit = CharField()                    # 중량 단위
```

**Unique Constraints**:
- `(manufacturer, model)`
- `(manufacturer, slug)`

**SubdeviceRoleChoices**: `parent`, `child`
**DeviceAirflowChoices**: `front-to-rear`, `rear-to-front`, `left-to-right`, `right-to-left`, `side-to-rear`, `rear-to-side`, `bottom-to-top`, `top-to-bottom`, `passive`, `mixed`

---

## 3. DeviceRole

```python
class DeviceRole(NestedGroupModel):  # MPTT 트리 구조
    name = CharField()
    slug = SlugField()
    parent = TreeFK(self, null=True)        # 계층적 Role
    color = ColorField(default='#9e9e9e')
    vm_role = BooleanField(default=True)    # VM에도 이 Role 사용 가능한지
    config_template = FK(ConfigTemplate, null=True)
```

**Unique**: `(parent, name)` / `(name)` where parent is null

---

## 4. Platform

```python
class Platform(NestedGroupModel):
    name = CharField()
    slug = SlugField()
    manufacturer = FK(Manufacturer, PROTECT, null=True)
    config_template = FK(ConfigTemplate, null=True)
```

---

## 5. Device (핵심 모델)

```python
class Device(ContactsMixin, ImageAttachmentsMixin, RenderConfigMixin,
             ConfigContextModel, TrackingModelMixin, PrimaryModel):
```

| 필드명 | 타입 | Null | Default | 설명 |
|--------|------|------|---------|------|
| `device_type` | FK(DeviceType, PROTECT) | NOT NULL | - | 장비 유형 |
| `role` | FK(DeviceRole, PROTECT) | NOT NULL | - | 역할 (스위치/서버/스토리지 등) |
| `tenant` | FK(Tenant, PROTECT) | NULL | null | 테넌트 |
| `platform` | FK(Platform, SET_NULL) | NULL | null | OS/펌웨어 |
| `name` | CharField(64) | NULL | null | 장비명 |
| `serial` | CharField(50) | blank | "" | 시리얼 번호 |
| `asset_tag` | CharField(50) | **UNIQUE** | null | 자산 태그 (전역 unique) |
| `site` | FK(Site, PROTECT) | NOT NULL | - | 사이트 |
| `location` | FK(Location, PROTECT) | NULL | null | 위치 |
| `rack` | FK(Rack, PROTECT) | NULL | null | 랙 |
| `position` | DecimalField(4,1) | NULL | null | 랙 내 위치 (1~100.5) |
| `face` | CharField(50) | NULL | null | `front`/`rear` |
| `status` | CharField(50) | NOT NULL | `active` | 상태 |
| `airflow` | CharField(50) | NULL | null | 공기 흐름 |
| `primary_ip4` | OneToOneField(IPAddress, SET_NULL) | NULL | null | Primary IPv4 |
| `primary_ip6` | OneToOneField(IPAddress, SET_NULL) | NULL | null | Primary IPv6 |
| `oob_ip` | OneToOneField(IPAddress, SET_NULL) | NULL | null | OOB 관리 IP |
| `cluster` | FK(Cluster, SET_NULL) | NULL | null | 가상화 클러스터 |
| `virtual_chassis` | FK(VirtualChassis, SET_NULL) | NULL | null | Virtual Chassis |
| `vc_position` | PositiveIntegerField | NULL | null | VC 내 포지션 |
| `vc_priority` | PositiveSmallIntegerField | NULL | null | VC 마스터 우선순위 |
| `latitude` | DecimalField(8,6) | NULL | null | GPS 위도 |
| `longitude` | DecimalField(9,6) | NULL | null | GPS 경도 |
| `comments` | CharField | blank | "" | 코멘트 |

### DeviceStatusChoices (7종)

| Key | Label | Color |
|-----|-------|-------|
| `offline` | Offline | gray |
| `active` | Active | green |
| `planned` | Planned | cyan |
| `staged` | Staged | blue |
| `failed` | Failed | red |
| `inventory` | Inventory | purple |
| `decommissioning` | Decommissioning | yellow |

### Unique Constraints

1. `(name, site, tenant)`
2. `(name, site)` where tenant is null
3. `(rack, position, face)` — 같은 랙 같은 위치 금지
4. `(virtual_chassis, vc_position)`

### Counter Cache Fields (비정규화)

`console_port_count`, `console_server_port_count`, `power_port_count`, `power_outlet_count`, `interface_count`, `front_port_count`, `rear_port_count`, `device_bay_count`, `module_bay_count`, `inventory_item_count`

### 관계 요약

```
Device ──FK──> DeviceType ──FK──> Manufacturer
Device ──FK──> DeviceRole
Device ──FK──> Site
Device ──FK──> Location
Device ──FK──> Rack
Device ──FK──> Platform
Device ──FK──> Tenant
Device ──FK──> VirtualChassis
Device ──FK──> Cluster
Device ──1to1──> IPAddress (primary_ip4, primary_ip6, oob_ip)
Device ──hasMany──> Module
Device ──hasMany──> Interface
Device ──hasMany──> ConsolePort, PowerPort, etc.
```

---

## 6. Interface (포트)

### 상속 계층

```
NetBoxModel
  └── ComponentModel (device FK, name, label, description + _site/_location/_rack 캐시)
        └── ModularComponentModel (module FK nullable, inventory_items)
              └── Interface (+ BaseInterface, CabledObjectModel, PathEndpoint, TrackingModelMixin)
```

### 핵심 필드

| 필드 | 타입 | Null | Default | 설명 |
|------|------|------|---------|------|
| `device` | FK(Device, CASCADE) | NOT NULL | - | 소속 장비 |
| `module` | FK(Module, CASCADE) | **NULL** | null | 모듈 (null=Device 직속) |
| `name` | CharField(64) | NOT NULL | - | 인터페이스명 |
| `label` | CharField(64) | blank | "" | 물리 라벨 |
| `type` | CharField(50) | **NOT NULL** | - | 인터페이스 타입 (190종+) |
| `enabled` | BooleanField | NOT NULL | true | 활성화 |
| `mgmt_only` | BooleanField | NOT NULL | false | 관리 전용 |
| `mtu` | PositiveIntegerField | NULL | null | MTU (1~65536) |
| `speed` | PositiveBigIntegerField | NULL | null | 속도 (**Kbps**) |
| `duplex` | CharField(50) | NULL | null | half / full / auto |
| `wwn` | **WWNField** (64-bit) | NULL | null | World Wide Name (FC) |
| `mode` | CharField(50) | NULL | null | 802.1Q 모드 |
| `parent` | FK(self, RESTRICT) | NULL | null | 부모 인터페이스 |
| `bridge` | FK(self, SET_NULL) | NULL | null | 브리지 |
| `lag` | FK(self, SET_NULL) | NULL | null | LAG 부모 |
| `untagged_vlan` | FK(VLAN) | NULL | null | Untagged VLAN |
| `tagged_vlans` | M2M(VLAN) | - | - | Tagged VLANs |
| `vrf` | FK(VRF, SET_NULL) | NULL | null | VRF |
| `poe_mode` | CharField(50) | NULL | null | pd / pse |
| `poe_type` | CharField(50) | NULL | null | PoE 타입 |
| `rf_role` | CharField(30) | NULL | null | 무선 역할 |
| `rf_channel` | CharField(50) | NULL | null | 무선 채널 |
| `rf_channel_frequency` | DecimalField(8,3) | NULL | null | 주파수 (MHz) |
| `rf_channel_width` | DecimalField(7,3) | NULL | null | 채널 폭 (MHz) |
| `tx_power` | SmallIntegerField | NULL | null | 송신 전력 (dBm) |
| `wireless_link` | FK(WirelessLink) | NULL | null | 무선 링크 |
| `wireless_lans` | M2M(WirelessLAN) | - | - | 무선 LAN |
| `qinq_svlan` | FK(VLAN) | NULL | null | Q-in-Q SVLAN |
| `vlan_translation_policy` | FK | NULL | null | VLAN 변환 정책 |
| `primary_mac_address` | OneToOneField(MACAddress) | NULL | null | Primary MAC |
| `vdcs` | M2M(VirtualDeviceContext) | - | - | VDC |

### CabledObjectModel mixin (Interface가 상속받는 케이블 관련 필드)

| 필드 | 타입 | 설명 |
|------|------|------|
| `cable` | FK(Cable, SET_NULL) | 연결된 케이블 (denormalized cache) |
| `cable_end` | CharField(1) | 'A' or 'B' |
| `cable_connector` | PositiveSmallIntegerField | 1-256 |
| `cable_positions` | ArrayField(PositiveSmallInteger) | 1-1024 |
| `mark_connected` | BooleanField(default=False) | 가상 연결 표시 |
| `_path` | FK(CablePath, SET_NULL) | 케이블 경로 (PathEndpoint) |

### Key Constraint

```python
UniqueConstraint(fields=('device', 'name'), name='unique_device_name')
```

**중요**: module 필드와 무관하게 `(device, name)` unique입니다.

### InterfaceTypeChoices — InfiniBand (9종)

| Key | Label | 속도 |
|-----|-------|------|
| `infiniband-sdr` | SDR | 2 Gbps |
| `infiniband-ddr` | DDR | 4 Gbps |
| `infiniband-qdr` | QDR | 8 Gbps |
| `infiniband-fdr10` | FDR10 | 10 Gbps |
| `infiniband-fdr` | FDR | 13.64 Gbps |
| `infiniband-edr` | EDR | 25 Gbps |
| `infiniband-hdr` | HDR | 50 Gbps |
| `infiniband-ndr` | NDR | 100 Gbps |
| `infiniband-xdr` | XDR | 250 Gbps |

### InterfaceTypeChoices — FibreChannel (11종)

| Key | Label | 속도 |
|-----|-------|------|
| `1gfc-sfp` | SFP (1GFC) | 1 Gbps |
| `2gfc-sfp` | SFP (2GFC) | 2 Gbps |
| `4gfc-sfp` | SFP (4GFC) | 4 Gbps |
| `8gfc-sfpp` | SFP+ (8GFC) | 8 Gbps |
| `16gfc-sfpp` | SFP+ (16GFC) | 16 Gbps |
| `32gfc-sfp28` | SFP28 (32GFC) | 32 Gbps |
| `32gfc-sfpp` | SFP+ (32GFC) | 32 Gbps |
| `64gfc-qsfpp` | QSFP+ (64GFC) | 64 Gbps |
| `64gfc-sfpdd` | SFP-DD (64GFC) | 64 Gbps |
| `64gfc-sfpp` | SFP+ (64GFC) | 64 Gbps |
| `128gfc-qsfp28` | QSFP28 (128GFC) | 128 Gbps |

### InterfaceDuplexChoices: `half`, `full`, `auto`
### InterfaceModeChoices: `access`, `tagged`, `tagged-all`, `q-in-q`
### InterfacePoEModeChoices: `pd`, `pse`

### WWN 필드 상세

```python
# dcim/fields.py
class WWNField(models.Field):
    """World Wide Name — 64-bit EUI identifier
    DB type: macaddr8 (PostgreSQL)
    Python type: netaddr.EUI(version=64, dialect=eui64_unix_expanded_uppercase)
    Format: XX-XX-XX-XX-XX-XX-XX-XX
    """
```

---

## 7. Module / ModuleBay / ModuleType 계층

### ModuleType

```python
class ModuleType(ImageAttachmentsMixin, PrimaryModel, WeightMixin):
    profile = FK(ModuleTypeProfile, PROTECT, null=True)
    manufacturer = FK(Manufacturer, PROTECT)
    model = CharField(100)
    part_number = CharField(50)
    airflow = CharField(50)
    attribute_data = JSONField(null=True)    # JSON Schema 검증
    weight / weight_unit
```

**Unique**: `(manufacturer, model)`

### ModuleBay

```python
class ModuleBay(ModularComponentModel, TrackingModelMixin, MPTTModel):
    device = FK(Device, CASCADE)
    module = FK(Module, CASCADE, null=True)   # 상위 module (nullable)
    name = CharField(64)
    parent = TreeFK(self, CASCADE, null=True) # MPTT 트리
    position = CharField(30)
    enabled = BooleanField(default=True)
```

**Unique**: `(device, module, name)`

### Module

```python
class Module(TrackingModelMixin, PrimaryModel, ConfigContextModel):
    device = FK(Device, CASCADE)
    module_bay = FK(ModuleBay, CASCADE)    # 설치된 bay (UNIQUE 제약)
    module_type = FK(ModuleType, PROTECT)
    status = CharField(50, default='active')  # 7종 (Device와 동일)
    serial = CharField(50)
    asset_tag = CharField(50, unique=True)
```

### chassis → module → port 계층

```
Device (chassis)
  └── ModuleBay (device=device, module=null)
        └── Module (module_bay=1to1)
              ├── ModuleBay (device=device, module=module)
              │     └── Module (재귀적)
              ├── Interface (device=device, module=module)
              ├── ConsolePort
              └── PowerPort
```

`Interface.module` FK는 nullable — null이면 Device 직속, 값이 있으면 특정 Module에 속함.

---

## 8. VirtualChassis

```python
class VirtualChassis(PrimaryModel):
    master = OneToOneField(Device, PROTECT)
    name = CharField(64)
    domain = CharField(30)
```

---

## 9. DeviceType / ModuleType Component Template 시스템

Device/Module 생성 시 해당 타입의 Component Template들이 자동 인스턴스화됩니다:

- `ConsolePortTemplate`, `ConsoleServerPortTemplate`
- `PowerPortTemplate`, `PowerOutletTemplate`
- `InterfaceTemplate`, `FrontPortTemplate`, `RearPortTemplate`
- `ModuleBayTemplate`, `DeviceBayTemplate`
- `InventoryItemTemplate`
