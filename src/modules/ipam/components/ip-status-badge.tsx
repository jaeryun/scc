import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IpStatus } from '../types';

const statusMap: Record<IpStatus, { label: string; className: string }> = {
  FREE: { label: '미사용', className: 'bg-green-500/10 text-green-500' },
  ALLOCATED: { label: '할당됨', className: 'bg-blue-500/10 text-blue-500' },
  RESERVED: { label: '예약됨', className: 'bg-yellow-500/10 text-yellow-500' },
  DISABLED: { label: '비활성', className: 'bg-gray-500/10 text-gray-500' }
};

interface IpStatusBadgeProps {
  status: IpStatus;
}

export function IpStatusBadge({ status }: IpStatusBadgeProps) {
  const config = statusMap[status];
  return <Badge className={cn(config.className)}>{config.label}</Badge>;
}
