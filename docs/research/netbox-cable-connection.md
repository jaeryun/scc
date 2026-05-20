# NetBox v4.x — Cable / Connection 모델

> **소스**: `netbox-community/netbox` (main 브랜치, 2026-05-20 기준)
> **조사 범위**: Cable, CableTermination, CablePath, CabledObjectModel

---

## 1. 전체 아키텍처

NetBox 케이블 관리 시스템은 **4가지 핵심 요소**로 구성:

| 요소 | 역할 | 테이블 존재 |
|------|------|------------|
| **Cable** | 물리적 케이블 엔티티 | ✅ 별도 테이블 |
| **CableTermination** | Cable과 종단점 간 N:M 연결 조인 테이블 | ✅ 별도 테이블 |
| **CablePath** | A→Z 전체 경로 denormalized 캐시 | ✅ 별도 테이블 |
| **CabledObjectModel** | 종단점에 cable/cable_end 직접 캐싱 | ❌ Django abstract mixin |

### 핵심 설계 원리: 이중 표현 (Dual Representation)

```
CableTermination (Source of Truth - 정규화된 조인 테이블)
       ↕  동기화
CabledObjectModel 필드 (Denormalized Cache - 조회 최적화)
```

Cable ↔ Interface 연결은 실제로 CableTermination 테이블에 저장되지만, Interface 자체에도 `cable`, `cable_end` 필드를 캐싱하여 단일 쿼리로 빠르게 접근 가능.

---

## 2. Cable 모델

```python
class Cable(PrimaryModel):
    type = CharField(max_length=50, choices=CableTypeChoices)
    status = CharField(max_length=50, choices=LinkStatusChoices, default='connected')
    profile = CharField(max_length=50, choices=CableProfileChoices, blank=True)  # v4.5+
    tenant = FK('tenancy.Tenant', PROTECT)
    label = CharField(max_length=100, blank=True)
    color = ColorField(blank=True)
    length = DecimalField(max_digits=8, decimal_places=2)
    length_unit = CharField(choices=CableLengthUnitChoices)   # m, cm, ft, in
    _abs_length = DecimalField(max_digits=10, decimal_places=4)  # 미터 정규화
    bundle = FK('dcim.CableBundle', SET_NULL)  # v4.5+ 케이블 번들
```

### Cable ↔ CableTermination 관계

Cable은 termination 객체를 **직접 소유하지 않습니다.** 프로퍼티로 간접 접근:

```python
# Cable.a_terminations — getter
def _get_x_terminations(self, side):
    return [ct.termination for ct in self.terminations.all() if ct.cable_end == side]

# Cable.a_terminations — setter
def _set_x_terminations(self, side, value):
    setattr(self, f'_{side.lower()}_terminations', value)
    self._terminations_modified = True
```

### Cable.save() 동기화 로직

1. 새 Cable → `super().save()` (PK 생성)
2. `update_terminations()` 호출 → stale CableTermination 삭제, 새 CableTermination 생성
3. `super().save()` 재호출
4. `trace_paths` 시그널 발송 → CablePath 재추적

```python
def update_terminations(self, force=False):
    a_terminations, b_terminations = self.get_terminations()
    # Stale 삭제
    # 새 CableTermination 생성 → CableTermination.save()
    # → termination.set_cable_termination(self) → Interface.cable 등 캐싱
```

---

## 3. CableTermination 모델

### 필드

```python
class CableTermination(ChangeLoggedModel):
    cable = FK('dcim.Cable', CASCADE, related_name='terminations')
    cable_end = CharField(max_length=1, choices=[('A','A'), ('B','B')])

    # GenericForeignKey — 어떤 종단점이든 연결 가능
    termination_type = FK(ContentType, PROTECT)
    termination_id = PositiveBigIntegerField()
    termination = GenericForeignKey(
        ct_field='termination_type',
        fk_field='termination_id'
    )

    # Breakout/Shuffle 케이블 지원
    connector = PositiveSmallIntegerField(1~256)
    positions = ArrayField(PositiveSmallIntegerField)

    # 필터링 최적화용 denormalized 캐시
    _device = FK('dcim.Device', CASCADE, null=True)
    _rack = FK('dcim.Rack', CASCADE, null=True)
    _location = FK('dcim.Location', CASCADE, null=True)
    _site = FK('dcim.Site', CASCADE, null=True)
```

### Unique Constraints

```python
# 하나의 종단점은 하나의 Cable에만
UniqueConstraint(fields=('termination_type', 'termination_id'), name='unique_termination')
# 하나의 Cable + end + connector 조합은 유일
UniqueConstraint(fields=('cable', 'cable_end', 'connector'), name='unique_connector')
```

### GenericForeignKey 작동 예시

```python
# Interface(id=5)의 A-end를 Cable에 연결
CableTermination.objects.create(
    cable=cable_obj,
    cable_end='A',
    termination_type=ContentType.objects.get(app_label='dcim', model='interface'),
    termination_id=5,
)
# ct.termination → Interface.objects.get(pk=5)  (lazy resolve)
```

### Denormalized Cache (`_device`, `_rack`, `_location`, `_site`)

```python
def cache_related_objects(self):
    if self.termination.device:
        self._device = self.termination.device
        self._rack = self.termination.device.rack
        self._location = self.termination.device.location
        self._site = self.termination.device.site
```

목적: "Site X에 있는 모든 케이블 연결" 필터링을 JOIN 없이 수행.

---

## 4. CabledObjectModel Mixin

이 mixin을 상속받는 모델들에 케이블 연결 캐시 제공:

### 제공 필드

```python
class CabledObjectModel(models.Model):
    cable = FK('dcim.Cable', SET_NULL)       # 연결된 케이블 (denormalized)
    cable_end = CharField(max_length=1)      # 'A' | 'B'
    cable_connector = PositiveSmallIntegerField(1~256)
    cable_positions = ArrayField(PositiveSmallIntegerField)
    mark_connected = BooleanField(default=False)  # 가상 연결 플래그
    _path = FK(CablePath, SET_NULL)          # 전체 경로 (PathEndpoint)
```

### 적용 대상

| 모델 | Cable | WirelessLink | PathEndpoint |
|------|-------|-------------|-------------|
| **Interface** | ✅ | ✅ | ✅ |
| ConsolePort | ✅ | ❌ | ✅ |
| ConsoleServerPort | ✅ | ❌ | ✅ |
| PowerPort | ✅ | ❌ | ✅ |
| PowerOutlet | ✅ | ❌ | ✅ |
| FrontPort | ✅ | ❌ | ❌ |
| RearPort | ✅ | ❌ | ❌ |

### CabledObjectModel ↔ CableTermination 동기화

```python
# CableTermination.save() → 종단점에 cable 정보 캐싱
def save(self, *args, **kwargs):
    self.cache_related_objects()
    super().save()
    termination = self.termination._meta.model.objects.get(pk=self.termination_id)
    termination.snapshot()
    termination.set_cable_termination(self)  # cable, cable_end 등 설정
    termination.save()

# CableTermination.delete() → 종단점에서 cable 정보 제거
def delete(self, *args, **kwargs):
    termination = self.termination._meta.model.objects.get(pk=self.termination_id)
    termination.snapshot()
    termination.clear_cable_termination(self)
    termination.save()
    super().delete()
```

---

## 5. CablePath

### CablePath 모델

```python
class CablePath(models.Model):
    path = JSONField         # [[Interface A], [Cable], [Interface B], [Cable], ...]
    is_active = BooleanField
    is_complete = BooleanField
    is_split = BooleanField
    _nodes = PathField       # flattened list for GIN index
```

### from_origin() 추적 알고리즘

```python
@classmethod
def from_origin(cls, terminations):
    path = []
    while terminations:
        # Step 1: 현재 terminations 기록
        path.append([object_to_path_node(t) for t in terminations])
        # Step 2: 연결된 Cable/WirelessLink 찾기
        links = [t.link for t in terminations if t.link]
        # Step 3: link 기록
        path.append([object_to_path_node(link) for link in links])
        # Step 4: far-end termination 찾기
        # Step 5: far-end 기록
        # Step 6: Next hop 결정 (FrontPort→RearPort 통과 등)
        if FrontPort:
            terminations = rear_ports
        elif 일반 종단점:
            is_complete = True
            break
    return CablePath(path=path, ...)
```

---

## 6. 연결 쿼리 패턴

### "Interface X는 무엇과 연결되어 있는가?"

#### Immediate Peer (`link_peers`)
```python
interface.link_peers  # 같은 Cable의 반대편 termination
```
**SQL**: `SELECT * FROM dcim_cabletermination WHERE cable_id={cable_id} AND cable_end != '{end}'`

#### End-to-End Destination (`connected_endpoints`)
```python
interface.connected_endpoints  # CablePath.path_objects[-1]
```

### API 응답 예시

```json
{
  "id": 100,
  "device": { "id": 10, "name": "switch01" },
  "name": "GigabitEthernet1/0/1",
  "type": { "value": "1000base-t", "label": "1000BASE-T (1GE)" },
  "cable": 42,
  "cable_end": "A",
  "link_peers": [
    {
      "id": 200,
      "device": { "id": 20, "name": "server01" },
      "name": "eth0"
    }
  ],
  "connected_endpoints_reachable": true
}
```

## 7. Nautobot vs NetBox Cable 비교 (참고)

| 측면 | NetBox (v4.x) | Nautobot |
|------|--------------|----------|
| Cable-to-Termination 관계 | 1:N (through CableTermination) | 1:1 per side (직접 GFK) |
| Through table | `CableTermination` 모델 존재 | 없음 |
| Breakout/trunk 케이블 | 지원 (profile + connector/positions) | 지원 안 함 |
| Terminating object가 cable 참조 | `CabledObjectModel` mixin | `CableTermination` mixin |
