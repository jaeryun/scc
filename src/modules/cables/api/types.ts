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
