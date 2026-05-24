export type SwitchType = 'ib' | 'san' | 'utp';

export type PortStatus = 'up' | 'down' | 'degraded' | 'unconnected';

export interface PortAttribute {
  key: string;
  label: string;
  value: string | number;
  hidden?: boolean;
}

export interface PortMapping {
  id: string;
  switchName: string;
  switchPortName: string;
  hostName: string | null;
  hostPortName: string | null;
  status: PortStatus;
  values: Record<string, string | number>;
}

export interface SwitchPortsData {
  switchId: string;
  switchType: SwitchType;
  switchName: string;
  ports: PortMapping[];
}
