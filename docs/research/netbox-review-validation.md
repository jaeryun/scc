# NetBox 데이터 모델 검증 보고서

> **검증자**: Software Architect persona
> **검증일**: 2026-05-20
> **대상**: R1(Device/Interface/Module), R2(Cable/Connection), R3(Host/switch↔host)

---

## ✅ 통과 (13개)

| # | 항목 | 검증 근거 |
|---|------|----------|
| 1 | InfiniBand 9종 정확 (SDR~XDR, FDR10 포함) | NetBox `choices.py` main 브랜치 확인 |
| 2 | FibreChannel 11종 정확 (64GFC 3개 커넥터 변종 포함) | QSFP+/SFP-DD/SFP+ 변종 존재 확인 |
| 3 | `Interface.speed` = Kbps 단위 | Django 필드 정의: `PositiveBigIntegerField(verbose_name='speed (Kbps)')` |
| 4 | `wwn` = PostgreSQL `macaddr8` 타입 | `WWNField.db_type()` → `'macaddr8'` |
| 5 | `Interface.module` FK nullable | `ModularComponentModel`에서 `null=True, blank=True` |
| 6 | `@@unique([deviceId, name])` | module과 무관하게 device+name unique |
| 7 | Device status 7종 정확 | `DeviceStatusChoices` 7개 값 |
| 8 | Cable + CableTermination 2테이블 | `dcim/models/cables.py` |
| 9 | CableTermination GenericForeignKey | `termination_type` + `termination_id` |
| 10 | CabledObjectModel 캐시 동기화 | `set_cable_termination()` / `clear_cable_termination()` |
| 11 | CablePath 전체 경로 추적 | JSON path |
| 12 | Host 별도 엔티티 없음. Device로 통합 | DeviceRole로 구분 |
| 13 | DeviceRole MPTT 계층형 | `TreeForeignKey('parent')` |

---

## ⚠️ 수정 필요 (4개)

| # | 항목 | 문제 | 설명 |
|---|------|------|------|
| 1 | **InterfaceType 총 개수** | R1: ~190종 → 실제: ~212종 | NetBox v4.x 800G/1.6T/Wi-Fi 7/PON 등 확장분 미반영. Phase 1 영향 없음 |
| 2 | **Module-ModuleBay 관계** | "OneToOne" → 실제는 ForeignKey | Module.moduleBayId FK + `@@unique([moduleBayId])`로 구현. OneToOne 아님 |
| 3 | **DeviceRole** | slug, config_template 누락 | Phase 1에 slug 추가 |
| 4 | **확장 속성 전략** | IB GUID/WWN/LID - JSONB vs 정규 컬럼 | 검색 빈도 높은 건 정규 컬럼, ad-hoc은 JSONB |

---

## 🔍 보고서 간 모순

- **R1 과소 집계**: InterfaceType 190종 → 실제 ~212종 (800G/1.6T 확장, Wi-Fi 7, PON, stacking 등 추가)
- **R1 관계 오기술**: Module-ModuleBay OneToOne → 실제 FK + unique 제약
- **R2/R3**: 실질적 모순 없음

---

## 📦 NetBox 연동 시 고려사항

### 방식 A: NetBox REST API (권장)

```
SE Command Center → REST API → NetBox
```
- `GET /api/dcim/devices/?role=gpu-node` → 서버 목록
- `GET /api/dcim/interfaces/?device_id=X&cable_status=connected` → 연결된 포트
- `GET /api/dcim/cables/?termination_type=dcim.interface` → 케이블 매핑
- API 응답에 `link_peers`, `connected_endpoints` 포함 → JOIN 없이 매핑 정보 획득

### 방식 B: NetBox PostgreSQL 직접 접근

```
SE Command Center → Prisma → NetBox PostgreSQL (직접)
```
- NetBox의 Django ORM이 생성한 테이블을 Prisma로 직접 조회
- 장점: NetBox API 레이턴시 제거, 복잡한 JOIN 쿼리 가능
- 단점: NetBox 스키마 변경 시 깨짐, Django migration 의존성
- 권장 접근 `datasource`: NetBox DB를 읽기 전용 데이터소스로 등록하고, 필요 시 REST API로 쓰기

### 방식 C: NetBox GraphQL (읽기 전용)

```graphql
query {
  device_list(filters: {role: ["gpu-node"]}) {
    name
    device_type { model }
    interfaces {
      name type speed
      cable { id }
      connected_endpoints {
        ... on InterfaceType { device { name } name }
      }
    }
  }
}
```
- 복잡한 중첩 연관 데이터를 단일 요청으로 획득
- 제한: 읽기 전용 (mutations 불가)
