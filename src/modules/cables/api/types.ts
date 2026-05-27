export interface Cable {
  id: number;
  type: string | null;
  status: string;
  label: string;
  aDevice: string;
  aInterface: string;
  bDevice: string;
  bInterface: string;
}

export interface NetBoxCableRaw {
  id: number;
  type: { value: string } | string | null;
  status: { value: string } | string;
  label: string;
  a_terminations: Array<{ device: { name: string }; name: string }>;
  b_terminations: Array<{ device: { name: string }; name: string }>;
}
