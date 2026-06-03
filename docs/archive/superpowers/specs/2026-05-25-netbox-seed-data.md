# NetBox Seed Data Specification

> SCC Phase 1 테스트를 위한 NetBox 시드 데이터 명세.  
> 시딩은 NetBox REST API를 통해 수행하며, SCC 코드와 무관하게 독립 실행.

## 의존성 순서

시딩은 아래 순서로 진행해야 한다. FK 참조 무결성 때문.

```
1. Manufacturers     → DeviceType 생성 시 필요
2. DeviceRoles       → Device 생성 시 필요
3. Sites             → Rack, Device 생성 시 필요
4. Platforms         → Device 생성 시 필요 (선택)
5. Racks             → Device 배치 시 필요
6. DeviceTypes       → Device 생성 시 필요
7. Devices           → Interface, IP 할당 시 필요
8. Prefixes          → IP Address 생성 시 필요
9. Interfaces        → Cable 연결 시 필요
10. IP Addresses     → Device primary_ip 할당 시 필요 (선택)
11. Cables           → 두 Interface 간 연결
```

---

## 1. Manufacturers

| # | name | slug |
|---|------|------|
| 1 | NVIDIA Mellanox | nvidia-mellanox |
| 2 | Dell Technologies | dell |
| 3 | NetApp | netapp |
| 4 | Arista Networks | arista |

---

## 2. DeviceRoles

| # | name | slug | color |
|---|------|------|-------|
| 1 | InfiniBand Switch | ib-switch | ff6600 |
| 2 | SAN Switch | san-switch | 0099cc |
| 3 | Ethernet Switch | ethernet-switch | 339900 |
| 4 | GPU Node | gpu-node | cc0000 |
| 5 | Storage Array | storage-array | 9933cc |
| 6 | Management Server | mgmt-server | 666666 |

---

## 3. Sites

| # | name | slug | status |
|---|------|------|--------|
| 1 | Data Center A | dc-a | active |
| 2 | Data Center B | dc-b | active |

---

## 4. Platforms

| # | name | slug | manufacturer |
|---|------|------|-------------|
| 1 | NVIDIA Onyx | onyx | NVIDIA Mellanox |
| 2 | Dell OS10 | dell-os10 | Dell Technologies |
| 3 | EOS | eos | Arista Networks |

---

## 5. Racks

| # | name | site | u_height |
|---|------|------|----------|
| 1 | R01-A01 | dc-a | 42 |
| 2 | R01-A02 | dc-a | 42 |
| 3 | R01-B01 | dc-b | 42 |

---

## 6. DeviceTypes

| # | model | slug | manufacturer | u_height |
|---|-------|------|-------------|----------|
| 1 | MQM9700-NS2R (NDR 64-port) | mqm9700-ns2r | NVIDIA Mellanox | 1 |
| 2 | SN2700 (25GbE 32-port) | sn2700 | NVIDIA Mellanox | 1 |
| 3 | PowerEdge R760xa | r760xa | Dell Technologies | 2 |
| 4 | AFF A800 | aff-a800 | NetApp | 4 |
| 5 | 7280SR3-48YC8 | 7280sr3-48yc8 | Arista Networks | 1 |

---

## 7. Devices

**IB 스위치** (Phase 1-3, 1-7 테스트용):

| # | name | device_type | role | site | rack |
|---|------|------------|------|------|------|
| 1 | ib-switch-dc-a-01 | mqm9700-ns2r | ib-switch | dc-a | R01-A01 |
| 2 | ib-switch-dc-a-02 | mqm9700-ns2r | ib-switch | dc-a | R01-A01 |
| 3 | ib-switch-dc-b-01 | mqm9700-ns2r | ib-switch | dc-b | R01-B01 |

**SAN 스위치** (Phase 1-3, 1-7 테스트용):

| # | name | device_type | role | site | rack |
|---|------|------------|------|------|------|
| 4 | san-switch-dc-a-01 | sn2700 | san-switch | dc-a | R01-A02 |

**이더넷 스위치** (Phase 1-3, 1-7 테스트용):

| # | name | device_type | role | site | rack |
|---|------|------------|------|------|------|
| 5 | eth-switch-dc-a-01 | 7280sr3-48yc8 | ethernet-switch | dc-a | R01-A02 |

**GPU 서버** (Phase 1-3, 1-7 host 역할):

| # | name | device_type | role | site | rack |
|---|------|------------|------|------|------|
| 6 | gpu-node-dc-a-01 | r760xa | gpu-node | dc-a | R01-A01 |
| 7 | gpu-node-dc-a-02 | r760xa | gpu-node | dc-a | R01-A01 |
| 8 | gpu-node-dc-a-03 | r760xa | gpu-node | dc-a | R01-A01 |
| 9 | gpu-node-dc-a-04 | r760xa | gpu-node | dc-a | R01-A02 |
| 10 | gpu-node-dc-b-01 | r760xa | gpu-node | dc-b | R01-B01 |

**스토리지** (Phase 1-3):

| # | name | device_type | role | site | rack |
|---|------|------------|------|------|------|
| 11 | storage-dc-a-01 | aff-a800 | storage-array | dc-a | R01-A02 |

**관리 서버** (Phase 1-3):

| # | name | device_type | role | site | rack |
|---|------|------------|------|------|------|
| 12 | mgmt-dc-a-01 | r760xa | mgmt-server | dc-a | R01-A02 |

---

## 8. Prefixes

| # | prefix | description |
|---|--------|-------------|
| 1 | 10.0.0.0/16 | Management Network |
| 2 | 172.16.0.0/16 | InfiniBand Fabric |
| 3 | 192.168.0.0/24 | SAN Fabric |

---

## 9. Interfaces

### 개수 가이드

SCC Phase 1-7 switch-mapping이 포트 테이블을 표시하므로, 현실적인 포트 수가 필요하다.

- **IB 스위치** (MQM9700-NS2R): 각 16개 포트 → 3대 × 16 = 48개
- **SAN 스위치** (SN2700): 각 24개 포트 → 1대 × 24 = 24개
- **이더넷 스위치** (7280SR3): 각 48개 포트 → 1대 × 48 = 48개
- **GPU 서버**: 각 2개 포트 (IB 연결용) → 5대 × 2 = 10개
- **스토리지/관리 서버**: 각 4개 → 2대 × 4 = 8개

**총 약 138개 Interface**

### IB 스위치 Interface 예시 (ib-switch-dc-a-01)

| # | name | type | speed (Kbps) |
|---|------|------|-------------|
| 1 | Ethernet1/1 | infiniband-ndr | 100000000 |
| 2 | Ethernet1/2 | infiniband-ndr | 100000000 |
| ... | ... | ... | ... |
| 16 | Ethernet1/16 | infiniband-ndr | 100000000 |

포트 네이밍 컨벤션은 장비 유형에 따라 달라진다:
- Mellanox: `Ethernet1/1` ~ `Ethernet1/16`
- Arista: `Ethernet1` ~ `Ethernet48`
- Dell: `Ethernet1/1/1` ~ `Ethernet1/1/24`

### GPU 서버 Interface 예시 (gpu-node-dc-a-01)

| # | name | type | speed (Kbps) |
|---|------|------|-------------|
| 1 | mlx5_0 | infiniband-ndr | 100000000 |
| 2 | mlx5_1 | infiniband-ndr | 100000000 |

---

## 10. IP Addresses

Prefix별로 몇 개의 IP만 할당하면 된다. 전량 할당은 불필요.

### 10.0.0.0/16 (Management) — 4개 할당

| address | dns_name | assigned device (interface) |
|---------|----------|---------------------------|
| 10.0.0.10/16 | mgmt-dc-a-01 | mgmt-dc-a-01 (Ethernet1/1) |
| 10.0.0.11/16 | eth-switch-dc-a-01 | eth-switch-dc-a-01 (Management1) |
| 10.0.0.20/16 | gpu-node-dc-a-01 | gpu-node-dc-a-01 (iDRAC) |
| 10.0.0.21/16 | gpu-node-dc-a-02 | gpu-node-dc-a-02 (iDRAC) |

### 172.16.0.0/16 (InfiniBand) — 2개 할당

| address | dns_name | assigned device (interface) |
|---------|----------|---------------------------|
| 172.16.0.1/16 | ib-switch-dc-a-01 | ib-switch-dc-a-01 (Ethernet1/1) |
| 172.16.0.10/16 | gpu-node-dc-a-01 | gpu-node-dc-a-01 (mlx5_0) |

---

## 11. Cables

switch ↔ host 연결을 검증할 최소한의 케이블만 생성. Phase 1-6 테스트용.

| # | A device | A interface | B device | B interface | type |
|---|----------|------------|----------|------------|------|
| 1 | ib-switch-dc-a-01 | Ethernet1/1 | gpu-node-dc-a-01 | mlx5_0 | mmf-om4 |
| 2 | ib-switch-dc-a-01 | Ethernet1/2 | gpu-node-dc-a-01 | mlx5_1 | mmf-om4 |
| 3 | ib-switch-dc-a-01 | Ethernet1/3 | gpu-node-dc-a-02 | mlx5_0 | mmf-om4 |
| 4 | ib-switch-dc-a-02 | Ethernet1/1 | gpu-node-dc-a-03 | mlx5_0 | mmf-om4 |
| 5 | ib-switch-dc-a-02 | Ethernet1/2 | gpu-node-dc-a-04 | mlx5_0 | mmf-om4 |

NetBox의 Cable 생성은 termination 방식(GenericForeignKey)을 사용한다. 종단은 `dcim.interface` 타입으로 지정.

---

## 12. 각 Phase별 검증 체크리스트

| Phase | 어떻게 검증하는가 |
|-------|-----------------|
| **1-2** | `GET /api/sites` → 2개 Site. `GET /api/sites/roles` → 6개 Role. SiteSelector 드롭다운 동작 |
| **1-3** | `GET /api/devices` → 12개 Device. `GET /api/devices?role=ib-switch` → 3개 IB 스위치. DeviceTable 정상 렌더링 |
| **1-4** | `GET /api/interfaces?device_id=1` → `ib-switch-dc-a-01`의 16개 Interface. link_peers에 연결 정보 표시 |
| **1-5** | `GET /api/ipam/prefixes` → 3개 Prefix. `GET /api/ipam/ip-addresses?prefix=10.0.0.0/16` → 4개 IP. `POST assign` → 새 IP 할당 |
| **1-6** | `GET /api/cables` → 5개 Cable. `POST /api/cables` → 새 Cable 생성. `DELETE` → Cable 제거 |
| **1-7** | switch-mapping 페이지에서 IB/SAN/UTP 탭 각각 Device + 포트 테이블 표시. link_peers 기반 hostName/hostPortName 채워짐 |

---

## 13. 시딩 실행 방법

`curl` 또는 `pynetbox` (Python) 으로 NetBox REST API를 순차 호출. 의존성 순서(위 1→11)를 따라야 한다.

인증은 `Authorization: Token <NETBOX_API_TOKEN>` 헤더.

각 리소스 생성은 `POST /api/<app>/<entity>/` 엔드포인트로 수행하며, 생성된 객체의 `id`를 후속 요청에 사용한다.

예: Device 생성 시 DeviceType의 `id`, Role의 `id`, Site의 `id` 필요 → 해당 리소스를 먼저 생성하고 응답에서 `id` 수집.
