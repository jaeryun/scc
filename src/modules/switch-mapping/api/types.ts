export interface NetBoxDevice {
  id: number
  name: string | null
  device_type: { id: number; model: string; manufacturer: { id: number; name: string } }
  role: { id: number; name: string; slug: string }
  site: { id: number; name: string; slug: string } | null
  rack: { id: number; name: string } | null
  status: { value: string; label: string }
}

export interface NetBoxInterface {
  id: number
  device: { id: number; name: string | null }
  name: string
  label: string
  type: { value: string; label: string }
  speed: number | null
  wwn: string | null
  mtu: number | null
  enabled: boolean
  mgmt_only: boolean
  cable: number | null
  cable_end: string | null
  link_peers: NetBoxInterfaceLinkPeer[]
  connected_endpoints: NetBoxInterfaceLinkPeer[] | null
  connected_endpoints_type: string | null
  connected_endpoints_reachable: boolean | null
}

export interface NetBoxInterfaceLinkPeer {
  id: number
  device: { id: number; name: string | null }
  name: string
}

export interface NetBoxCable {
  id: number
  type: { value: string; label: string } | null
  status: { value: string; label: string }
  label: string
  a_terminations: NetBoxTerminationRef[]
  b_terminations: NetBoxTerminationRef[]
}

export interface NetBoxTerminationRef {
  object_type: string
  object_id: number
}

export interface NetBoxPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
