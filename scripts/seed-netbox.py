#!/usr/bin/env python3
"""NetBox seed script — IB / SAN / UTP rack switch test data.

Usage:
  NETBOX_URL=http://your-netbox:8000 NETBOX_TOKEN=<token> python scripts/seed-netbox.py
"""
import os
import sys

try:
    import pynetbox
except ImportError:
    print("ERROR: pynetbox not installed. Run: pip install pynetbox", file=sys.stderr)
    sys.exit(1)

NETBOX_URL = os.environ.get("NETBOX_URL", "http://localhost:8000")
NETBOX_TOKEN = os.environ.get("NETBOX_TOKEN", "")

if not NETBOX_TOKEN:
    print("ERROR: NETBOX_TOKEN environment variable is required", file=sys.stderr)
    print("Create a token in NetBox UI: Admin → Users → API Tokens", file=sys.stderr)
    print("Then run:", file=sys.stderr)
    print(f"  NETBOX_URL={NETBOX_URL} NETBOX_TOKEN=<your-token> python scripts/seed-netbox.py", file=sys.stderr)
    sys.exit(1)

nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)
nb.http_session.verify = False

print(f"Connected to NetBox at {NETBOX_URL}")

# ── Cleanup existing test data (idempotent re-run) ──
for name in [
    "ib-switch-01", "san-switch-01", "utp-switch-01",
    "gpu-node-01", "gpu-node-02", "gpu-node-03",
    "storage-01", "storage-02", "srv-01", "srv-02",
]:
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

for slug in ["ib-switch", "san-switch", "gpu-node", "server", "storage-node", "access-switch"]:
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
cisco = nb.dcim.manufacturers.create(name="Cisco", slug="cisco")

# ── DeviceRole ──
ib_role = nb.dcim.device_roles.create(name="IB Switch", slug="ib-switch", color="ff9800")
san_role = nb.dcim.device_roles.create(name="SAN Switch", slug="san-switch", color="2196f3")
gpu_role = nb.dcim.device_roles.create(name="GPU Node", slug="gpu-node", color="4caf50")
srv_role = nb.dcim.device_roles.create(name="Server", slug="server", color="9c27b0")
stor_role = nb.dcim.device_roles.create(name="Storage", slug="storage-node", color="f44336")
sw_role = nb.dcim.device_roles.create(name="Access Switch", slug="access-switch", color="607d8b")

# ── DeviceType ──
ib_type = nb.dcim.device_types.create(manufacturer=mellanox.id, model="QM8700", slug="qm8700", u_height=1)
san_type = nb.dcim.device_types.create(manufacturer=broadcom.id, model="G720", slug="g720", u_height=1)
utp_type = nb.dcim.device_types.create(manufacturer=cisco.id, model="Catalyst 9300-48P", slug="cat9300-48p", u_height=1)
gpu_dt = nb.dcim.device_types.create(manufacturer=mellanox.id, model="HGX H100", slug="hgx-h100", u_height=4)
stor_dt = nb.dcim.device_types.create(manufacturer=broadcom.id, model="ASA 4000", slug="asa-4000", u_height=2)

print("Prerequisites created.")

# ── IB Switch + GPU nodes ──
ib_sw = nb.dcim.devices.create(
    name="ib-switch-01", device_type=ib_type.id, role=ib_role.id,
    site=site.id, rack=rack.id, status="active",
)
gpu1 = nb.dcim.devices.create(
    name="gpu-node-01", device_type=gpu_dt.id, role=gpu_role.id,
    site=site.id, rack=rack.id, status="active")
gpu2 = nb.dcim.devices.create(
    name="gpu-node-02", device_type=gpu_dt.id, role=gpu_role.id,
    site=site.id, rack=rack.id, status="active")
gpu3 = nb.dcim.devices.create(
    name="gpu-node-03", device_type=gpu_dt.id, role=gpu_role.id,
    site=site.id, rack=rack.id, status="active")

ib_port_map = [
    (1, gpu1, "mlx5_0", True), (2, gpu2, "mlx5_0", True),
    (3, None, None, False), (4, gpu3, "mlx5_0", True),
    (5, None, None, False), (6, None, None, False),
    (7, None, None, False), (8, None, None, False),
    (9, None, None, False), (10, None, None, False),
    (11, None, None, False), (12, None, None, False),
]
for port_num, host, host_iface, _up in ib_port_map:
    sw_iface = nb.dcim.interfaces.create(
        device=ib_sw.id, name=f"1/{port_num}",
        type="infiniband-ndr", speed=100_000_000, enabled=True)
    if host and host_iface:
        host_iface_obj = nb.dcim.interfaces.create(
            device=host.id, name=host_iface,
            type="infiniband-ndr", speed=100_000_000, enabled=True)
        nb.dcim.cables.create(
            a_terminations=[{"object_type": "dcim.interface", "object_id": sw_iface.id}],
            b_terminations=[{"object_type": "dcim.interface", "object_id": host_iface_obj.id}],
            status="connected")

print(f"IB Switch: {ib_sw.id} — 12 ports, 3 connected")

# ── SAN Switch + storage hosts ──
san_sw = nb.dcim.devices.create(
    name="san-switch-01", device_type=san_type.id, role=san_role.id,
    site=site.id, rack=rack.id, status="active")
stor1 = nb.dcim.devices.create(
    name="storage-01", device_type=stor_dt.id, role=stor_role.id,
    site=site.id, rack=rack.id, status="active")
stor2 = nb.dcim.devices.create(
    name="storage-02", device_type=stor_dt.id, role=stor_role.id,
    site=site.id, rack=rack.id, status="active")

san_port_map = [
    (1, stor1, "fc0", True), (2, stor2, "fc0", True),
    (3, None, None, False), (4, None, None, False),
    (5, None, None, False), (6, None, None, False),
    (7, None, None, False), (8, None, None, False),
]
for port_num, host, host_iface, _up in san_port_map:
    sw_iface = nb.dcim.interfaces.create(
        device=san_sw.id, name=f"0/{port_num}",
        type="32gfc-sfp28", speed=32_000_000, enabled=True)
    if host and host_iface:
        host_iface_obj = nb.dcim.interfaces.create(
            device=host.id, name=host_iface,
            type="32gfc-sfp28", speed=32_000_000, enabled=True)
        nb.dcim.cables.create(
            a_terminations=[{"object_type": "dcim.interface", "object_id": sw_iface.id}],
            b_terminations=[{"object_type": "dcim.interface", "object_id": host_iface_obj.id}],
            status="connected")

print(f"SAN Switch: {san_sw.id} — 8 ports, 2 connected")

# ── UTP Rack Switch + servers ──
utp_sw = nb.dcim.devices.create(
    name="utp-switch-01", device_type=utp_type.id, role=sw_role.id,
    site=site.id, rack=rack.id, status="active")
srv1 = nb.dcim.devices.create(
    name="srv-01", device_type=gpu_dt.id, role=srv_role.id,
    site=site.id, rack=rack.id, status="active")
srv2 = nb.dcim.devices.create(
    name="srv-02", device_type=gpu_dt.id, role=srv_role.id,
    site=site.id, rack=rack.id, status="active")

utp_port_map = [
    (1, srv1, "eth0", True), (2, srv2, "eth0", True),
    (3, None, None, False), (4, None, None, False),
    (5, None, None, False), (6, None, None, False),
]
for port_num, host, host_iface, _up in utp_port_map:
    sw_iface = nb.dcim.interfaces.create(
        device=utp_sw.id, name=f"Gi1/0/{port_num}",
        type="1000base-t", speed=1_000_000, enabled=True)
    if host and host_iface:
        host_iface_obj = nb.dcim.interfaces.create(
            device=host.id, name=host_iface,
            type="1000base-t", speed=1_000_000, enabled=True)
        nb.dcim.cables.create(
            a_terminations=[{"object_type": "dcim.interface", "object_id": sw_iface.id}],
            b_terminations=[{"object_type": "dcim.interface", "object_id": host_iface_obj.id}],
            status="connected")

print(f"UTP Switch: {utp_sw.id} — 6 ports, 2 connected")
print()
print("=" * 50)
print("SEED COMPLETE")
print(f"  NetBox UI: {NETBOX_URL}")
print(f"  IB Switch:  {NETBOX_URL}/dcim/devices/{ib_sw.id}/")
print(f"  SAN Switch: {NETBOX_URL}/dcim/devices/{san_sw.id}/")
print(f"  UTP Switch: {NETBOX_URL}/dcim/devices/{utp_sw.id}/")
