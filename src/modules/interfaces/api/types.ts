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
