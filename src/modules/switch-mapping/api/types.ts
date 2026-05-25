export interface NetBoxDevice {
  id: number;
  name: string | null;
  device_type: { id: number; model: string; manufacturer: { id: number; name: string } };
  role: { id: number; name: string; slug: string };
  site: { id: number; name: string; slug: string } | null;
  rack: { id: number; name: string } | null;
  status: { value: string; label: string };
}

export interface NetBoxInterface {
  id: number;
  device: { id: number; name: string | null };
  name: string;
  label: string;
  type: { value: string; label: string };
  speed: number | null;
  enabled: boolean;
  link_peers: NetBoxInterfaceLinkPeer[];
}

export interface NetBoxInterfaceLinkPeer {
  id: number;
  device: { id: number; name: string | null };
  name: string;
}
