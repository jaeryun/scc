export interface Interface {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
  speed: number | null;
  mtu: number | null;
  deviceName: string;
  cableId: number | null;
  linkPeers: { device: string; name: string }[];
}

export interface NetBoxInterfaceRaw {
  id: number;
  name: string;
  type: { value: string } | string;
  enabled: boolean;
  speed: number | null;
  mtu: number | null;
  device: { name: string };
  cable: number | null;
  link_peers: Array<{ device: { name: string }; name: string }>;
}
