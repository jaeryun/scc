import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PortStatus } from '../types';

const STATUS_CONFIG: Record<PortStatus, { label: string; className: string }> = {
  up: {
    label: 'Up',
    className:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  down: {
    label: 'Down',
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  },
  degraded: {
    label: 'Degraded',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
  },
  unconnected: {
    label: 'Unconnected',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20'
  }
};

interface SwitchPortStatusBadgeProps {
  status: PortStatus;
}

export function SwitchPortStatusBadge({ status }: SwitchPortStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant='outline' className={cn('rounded-sm text-xs', config.className)}>
      {config.label}
    </Badge>
  );
}
