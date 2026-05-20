# NetBox v4.x — Host 범위 및 switch↔host 관계

> **소스**: `netbox-community/netbox` (main 브랜치, 2026-05-20 기준)
> **조사 범위**: DeviceRole, VirtualMachine, CustomField, ConfigContext, Cluster

---

## 1. "Host"는 NetBox에서 무엇인가?

### 핵심 철학: Device가 곧 Host

NetBox에는 **별도의 "Host" 엔티티가 존재하지 않습니다.** `dcim.Device`가 스위치, 서버, 라우터, 스토리지, GPU 노드 등 모든 물리 장비를 포괄합니다.

```
Device + DeviceRole(name="GPU Node") → GPU 서버
Device + DeviceRole(name="InfiniBand Switch") → IB 스위치
Device + DeviceRole(name="Storage Array") → 스토리지
```

구분은 오직 `DeviceRole`로만 이루어집니다.

### DeviceRole 트리 구조

```python
class DeviceRole(NestedGroupModel):  # MPTT
    name = CharField()
    slug = SlugField()
    parent = TreeFK(self, null=True)
    color = ColorField()
    vm_role = BooleanField(default=True)  # VM에도 이 Role 사용 가능한지
    config_template = FK(ConfigTemplate, null=True)
```

`vm_role=True` → 동일 Role을 물리 Device와 VirtualMachine 모두에 할당 가능.

### 확장 속성 저장 전략 (3레벨)

| 레이어 | 메커니즘 | 용도 예시 |
|--------|----------|-----------|
| **표준 필드** | Device 기본 컬럼 | serial, asset_tag, platform(OS), status |
| **Custom Field** | JSONB (`custom_field_data`) | IB GUID, GPU 모델명, 포트 GUID 등 검색/필터링 필요한 속성 |
| **ConfigContext** | 계층적 JSON 병합 | CPU, RAM, GPU 구성, Ansible 인벤토리 변수 |

---

## 2. 물리 Device vs VirtualMachine

| 특성 | Device (물리) | VirtualMachine (가상) |
|------|---------------|----------------------|
| 모델 | `dcim.Device` | `virtualization.VirtualMachine` |
| 위치 | Site → Rack → Position | Site / Cluster / Device |
| 인터페이스 | `dcim.Interface` (물리+가상) | `virtualization.VMInterface` (가상만) |
| 케이블 연결 | 가능 (Cable로) | **불가능** |
| CPU/RAM | 없음 (ConfigContext로) | `vcpus`, `memory`, `disk` 기본 필드 |
| OS | platform FK | platform FK |

### VirtualMachine 모델

```python
class VirtualMachine(ConfigContextModel, PrimaryModel):
    virtual_machine_type = FK('VirtualMachineType', ...)
    site = FK('dcim.Site', ...)
    cluster = FK('Cluster', ...)           # VM 클러스터
    device = FK('dcim.Device', ...)        # 특정 물리 호스트 (선택)
    tenant = FK('tenancy.Tenant', ...)
    platform = FK('dcim.Platform', ...)
    name = CharField(...)
    status = CharField(choices=VirtualMachineStatusChoices)
    role = FK('dcim.DeviceRole', ...)      # 물리와 동일한 Role 사용
    primary_ip4 / primary_ip6
    vcpus = DecimalField(...)   # 소수 가능 (1.5 vCPU)
    memory = PositiveIntegerField(...)  # MB
    disk = PositiveIntegerField(...)    # MB
    serial = CharField(...)    # unique 아님
```

### VMInterface

VMInterface는 **CabledObjectModel을 상속하지 않음** → Cable 연결 불가. `type`, `speed`, `duplex`, `wwn` 등 물리적 속성 없음.

---

## 3. Custom Field 시스템

### 구조

```python
class CustomField(BaseModel):
    name = CharField(50)        # DB 컬럼명처럼 사용
    label = CharField(50)       # UI 표시 레이블
    type = CharField(50)        # text, integer, decimal, boolean, date, url, json, select, ...
    required = BooleanField(default=False)
    weight = IntField(default=100)
    filter_logic = CharField(50)  # loose | exact | disabled
    ui_visible = CharField(50)   # always | if-set | hidden
    content_types = M2M(ContentType)  # 대상 모델 지정
```

저장은 대상 모델의 `custom_field_data` (JSONB) 컬럼에:

```python
# Interface 인스턴스
interface.custom_field_data = {
    "ib_guid": "0x506b4b0300112233",
    "ib_lid": 47
}
interface.save()
```

### Custom Field 타입 매핑 (IB/SAN)

| 속성 | 타입 | 설명 |
|------|------|------|
| IB GUID | text (regex: `^0x[0-9a-fA-F]{16}$`) | 64비트 16진수 |
| IB Port GUID | text | 64비트 16진수 |
| IB LID | integer (min=1, max=49152) | 16비트 |
| Partition Key | text | PKey |
| GPU Model | select | "NVIDIA H100", "A100", ... |
| GPU Count | integer | |
| CPU Model | text | |
| RAM GB | integer | |

### REST API로 필터링

```
GET /api/dcim/interfaces/?cf_ib_lid=47
GET /api/dcim/devices/?cf_gpu_model=NVIDIA+H100
```

---

## 4. ConfigContext

### 메커니즘

ConfigContext는 Device/VM에 계층적으로 JSON 데이터를 병합 주입:

```
Global ConfigContext (weight=1000)
  └─ Site "DC01" ConfigContext (weight=2000)
       └─ Role "GPU Node" ConfigContext (weight=3000)
            └─ Device Local ConfigContext (항상 최우선)
```

### 용도 예시

```json
// "GPU Node" Role ConfigContext
{
    "hardware": {
        "cpu": {"model": "AMD EPYC 9654", "cores": 96},
        "ram_gb": 2048,
        "gpu": [{"model": "NVIDIA H100", "count": 8, "vram_gb": 80}]
    },
    "network": {
        "ib_interfaces": ["mlx5_0", "mlx5_1"],
        "ib_partition_key": "0x8001"
    },
    "ansible": {
        "groups": ["gpu_nodes", "h100_nodes"],
        "vars": {"ib_mode": "connected"}
    }
}
```

---

## 5. Cluster / VirtualChassis

### Cluster (가상화 클러스터)

여러 물리 서버를 VM 호스트 그룹으로 묶음:

```python
class Cluster(ContactsMixin, CachedScopeMixin, PrimaryModel):
    name = CharField()
    type = FK('ClusterType')     # "VMware vSphere", "Proxmox" 등
    group = FK('ClusterGroup')
    status = CharField()
    tenant = FK('tenancy.Tenant')
```

### VirtualChassis (스위치 스택)

여러 물리 스위치가 하나의 제어 평면을 공유 (Cisco StackWise, Juniper VC):

```python
class VirtualChassis(PrimaryModel):
    master = OneToOneField(Device, PROTECT)
    name = CharField(64)
    domain = CharField(30)
```

Device는 `virtual_chassis` FK + `vc_position` + `vc_priority`로 VC에 참여.

---

## 6. 스위치↔호스트 연결 패턴 (구체적 예시)

### Django ORM 코드

```python
# Mellanox IB Switch ↔ GPU Server 연결

# 1. 스위치 Device
ib_switch = Device.objects.create(
    device_type=switch_type,
    role=DeviceRole.objects.get(name="InfiniBand Switch"),
    site=dc_site, rack=rack_a,
    name="ib-switch-01", status="active",
)

# 2. 서버 Device
gpu_server = Device.objects.create(
    device_type=server_type,
    role=DeviceRole.objects.get(name="GPU Node"),
    site=dc_site, rack=rack_b,
    name="gpu-node-01", status="active",
)
# 서버 확장 속성 (Custom Fields)
gpu_server.custom_field_data = {"gpu_model": "H100", "gpu_count": 8}
gpu_server.save()

# 3. 스위치 측 Interface
switch_port = Interface.objects.create(
    device=ib_switch, name="1/1/1",
    type="infiniband-ndr", speed=100_000_000,  # 100Gbps (Kbps)
)
switch_port.custom_field_data = {"ib_guid": "0x506b4b0300abcdef"}
switch_port.save()

# 4. 서버 측 Interface
server_port = Interface.objects.create(
    device=gpu_server, name="mlx5_0",
    type="infiniband-ndr", speed=100_000_000,
)
server_port.custom_field_data = {"ib_guid": "0x506b4b0300112233"}
server_port.save()

# 5. Cable 연결
cable = Cable(
    type="mmf-om4", status="connected",
    label="IB-PATCH-0042", length=5.0, length_unit="m",
    a_terminations=[switch_port],
    b_terminations=[server_port],
)
cable.save()
```

### 연결 조회

```python
# 특정 스위치의 모든 연결 조회 (link_peers 활용)
for iface in Interface.objects.filter(device=ib_switch):
    for peer in iface.link_peers:
        print(f"  {iface.name} → {peer.device.name}/{peer.name}")
        # 출력: 1/1/1 → gpu-node-01/mlx5_0
```

---

## 7. 결론

| 질문 | 답변 |
|------|------|
| NetBox의 "Host"는 무엇인가? | Device + DeviceRole(name="GPU Node"/"Server") |
| Host 확장 속성 저장은? | Custom Field (검색 필요) / ConfigContext (설정 데이터) |
| VM은 어떻게 구분되는가? | 별도 VirtualMachine 모델 (vcpus/memory/disk 기본 필드) |
| switch↔host 연결 방식 | Device의 Interface ↔ Cable ↔ 다른 Device의 Interface |
| IB GUID/LID, WWN 등 저장 | Interface Custom Field (JSONB) |
