import type { NetBoxDevice } from './types';
import type { PortMapping, SwitchPortsData } from '../types';

function generateIbPorts(): PortMapping[] {
  const hostnames = [
    'gpu-cluster-01',
    'gpu-cluster-02',
    'gpu-cluster-03',
    'gpu-cluster-04',
    'gpu-cluster-05',
    'gpu-cluster-06',
    'gpu-cluster-07',
    'gpu-cluster-08',
    'compute-hpc-01',
    'compute-hpc-02',
    'compute-hpc-03',
    'compute-hpc-04',
    'compute-hpc-05',
    'compute-hpc-06',
    'compute-hpc-07',
    'compute-hpc-08',
    'storage-parallel-01',
    'storage-parallel-02',
    'storage-parallel-03',
    'storage-parallel-04',
    'inference-01',
    'inference-02',
    'inference-03',
    'inference-04',
    'ml-training-01',
    'ml-training-02',
    'ml-training-03',
    'ml-training-04'
  ];
  const downIndices = new Set([10, 11, 29, 30]);
  const unconnectedIndices = new Set([33, 34, 35, 36]);

  return Array.from({ length: 36 }, (_, i) => {
    const portNum = i + 1;
    const isDown = downIndices.has(portNum);
    const isUnconnected = unconnectedIndices.has(portNum);
    const status = isDown ? 'down' : isUnconnected ? 'unconnected' : 'up';
    const hostIdx = portNum <= hostnames.length ? portNum - 1 : 0;

    return {
      id: `ib-port-${portNum}`,
      switchName: 'ib-core-01',
      switchPortName: `1/${portNum}`,
      hostName: status === 'up' ? (hostnames[hostIdx] ?? null) : null,
      hostPortName: status === 'up' ? `mlx5_${portNum}` : null,
      status,
      values: {
        speed: portNum <= 4 ? '200Gbps' : '100Gbps',
        mtu: 4096
      }
    } as PortMapping;
  });
}

function generateSanPorts(): PortMapping[] {
  const storageHosts = [
    'storage-ctrl-a',
    'storage-ctrl-b',
    'storage-ctrl-c',
    'storage-ctrl-d',
    'storage-ctrl-e',
    'storage-ctrl-f',
    'san-backup-01',
    'san-backup-02',
    'vault-archive-01',
    'vault-archive-02',
    'nvme-jbod-01',
    'nvme-jbod-02',
    'nas-head-01',
    'nas-head-02',
    'tape-lib-01',
    'tape-lib-02'
  ];
  const downIndices = new Set([7, 8, 9]);
  const unconnectedIndices = new Set([20, 21, 22, 23, 24]);

  return Array.from({ length: 24 }, (_, i) => {
    const portNum = i + 1;
    const isDown = downIndices.has(portNum);
    const isUnconnected = unconnectedIndices.has(portNum);
    const status = isDown ? 'down' : isUnconnected ? 'unconnected' : 'up';
    const hostIdx = portNum <= storageHosts.length ? portNum - 1 : 0;

    const wwnBase = '20:01:00:11:0a:00:0b:';
    const wwnSuffix = (0xc0 + portNum).toString(16).padStart(2, '0');

    return {
      id: `san-port-${portNum}`,
      switchName: 'san-core-01',
      switchPortName: `fc1/${portNum}`,
      hostName: status === 'up' ? (storageHosts[hostIdx] ?? null) : null,
      hostPortName: status === 'up' ? `fc_host${portNum}` : null,
      status,
      values: {
        speed: portNum <= 12 ? '64Gbps' : '32Gbps',
        wwn: `${wwnBase}${wwnSuffix}`
      }
    } as PortMapping;
  });
}

function generateUtpPorts(): PortMapping[] {
  const hosts: { name: string; port: string }[] = [
    { name: 'web-prod-01', port: 'eth0' },
    { name: 'web-prod-02', port: 'eth0' },
    { name: 'web-prod-03', port: 'eth0' },
    { name: 'web-prod-04', port: 'eth0' },
    { name: 'api-gateway-01', port: 'ens1f0' },
    { name: 'api-gateway-02', port: 'ens1f0' },
    { name: 'db-primary-01', port: 'bond0' },
    { name: 'db-primary-02', port: 'bond0' },
    { name: 'db-replica-01', port: 'bond0' },
    { name: 'db-replica-02', port: 'bond0' },
    { name: 'cache-redis-01', port: 'eth0' },
    { name: 'cache-redis-02', port: 'eth0' },
    { name: 'cache-redis-03', port: 'eth0' },
    { name: 'kafka-01', port: 'ens2f0' },
    { name: 'kafka-02', port: 'ens2f0' },
    { name: 'kafka-03', port: 'ens2f0' },
    { name: 'elastic-01', port: 'eth0' },
    { name: 'elastic-02', port: 'eth0' },
    { name: 'elastic-03', port: 'eth0' },
    { name: 'monitor-prom-01', port: 'eth0' },
    { name: 'monitor-grafana-01', port: 'eth0' },
    { name: 'ci-runner-01', port: 'ens1f0' },
    { name: 'ci-runner-02', port: 'ens1f0' },
    { name: 'ci-runner-03', port: 'ens1f0' },
    { name: 'ci-runner-04', port: 'ens1f0' },
    { name: 'bastion-01', port: 'eth0' },
    { name: 'vpn-gateway-01', port: 'eth0' },
    { name: 'dns-resolver-01', port: 'eth0' },
    { name: 'dns-resolver-02', port: 'eth0' },
    { name: 'ntp-server-01', port: 'eth0' },
    { name: 'ldap-auth-01', port: 'bond0' },
    { name: 'ldap-auth-02', port: 'bond0' },
    { name: 'artifact-nexus-01', port: 'eth0' },
    { name: 'container-reg-01', port: 'eth0' },
    { name: 'ansible-ctrl-01', port: 'eth0' },
    { name: 'log-shipper-01', port: 'ens1f0' }
  ];
  const downIndices = new Set([19, 20, 21, 37, 38, 39]);
  const unconnectedIndices = new Set([43, 44, 45, 46, 47, 48]);

  return Array.from({ length: 48 }, (_, i) => {
    const portNum = i + 1;
    const isDown = downIndices.has(portNum);
    const isUnconnected = unconnectedIndices.has(portNum);
    const status = isDown ? 'down' : isUnconnected ? 'unconnected' : 'up';
    const hostIdx = portNum <= hosts.length ? portNum - 1 : 0;

    return {
      id: `utp-port-${portNum}`,
      switchName: 'acc-rack-a-01',
      switchPortName: `Ethernet1/${portNum}`,
      hostName: status === 'up' ? (hosts[hostIdx]?.name ?? null) : null,
      hostPortName: status === 'up' ? (hosts[hostIdx]?.port ?? null) : null,
      status,
      values: {
        speed: portNum <= 6 ? '25Gbps' : '10Gbps',
        mtu: portNum <= 12 ? 9216 : 1500
      }
    } as PortMapping;
  });
}

export const MOCK_DEVICES_BY_ROLE: Record<string, NetBoxDevice[]> = {
  'ib-switch': [
    {
      id: 101,
      name: 'ib-core-01',
      device_type: { id: 1, model: 'MQM9700-NS2F', manufacturer: { id: 1, name: 'NVIDIA' } },
      role: { id: 1, name: 'IB Switch', slug: 'ib-switch' },
      site: { id: 1, name: 'Data Center A', slug: 'dc-a' },
      rack: { id: 1, name: 'Rack-A-12' },
      status: { value: 'active', label: 'Active' }
    }
  ],
  'san-switch': [
    {
      id: 102,
      name: 'san-core-01',
      device_type: { id: 2, model: 'Brocade G720', manufacturer: { id: 2, name: 'Broadcom' } },
      role: { id: 2, name: 'SAN Switch', slug: 'san-switch' },
      site: { id: 1, name: 'Data Center A', slug: 'dc-a' },
      rack: { id: 1, name: 'Rack-A-12' },
      status: { value: 'active', label: 'Active' }
    }
  ],
  'access-switch': [
    {
      id: 103,
      name: 'acc-rack-a-01',
      device_type: { id: 3, model: 'Nexus 93180YC-FX3', manufacturer: { id: 3, name: 'Cisco' } },
      role: { id: 3, name: 'Access Switch', slug: 'access-switch' },
      site: { id: 1, name: 'Data Center A', slug: 'dc-a' },
      rack: { id: 1, name: 'Rack-A-12' },
      status: { value: 'active', label: 'Active' }
    }
  ]
};

export const MOCK_SWITCH_PORTS: Record<string, SwitchPortsData> = {
  '101': {
    switchId: '101',
    switchType: 'ib',
    switchName: 'ib-core-01',
    ports: generateIbPorts()
  },
  '102': {
    switchId: '102',
    switchType: 'san',
    switchName: 'san-core-01',
    ports: generateSanPorts()
  },
  '103': {
    switchId: '103',
    switchType: 'utp',
    switchName: 'acc-rack-a-01',
    ports: generateUtpPorts()
  }
};
