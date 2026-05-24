'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { SwitchPortStatusBadge } from './switch-port-status-badge';
import type { PortMapping } from '../types';

interface SwitchPortDetailSheetProps {
  port: PortMapping | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className='flex items-center justify-between py-1.5'>
      <span className='text-muted-foreground text-sm'>{label}</span>
      <span className='font-mono text-sm'>{value ?? '-'}</span>
    </div>
  );
}

export function SwitchPortDetailSheet({ port, open, onOpenChange }: SwitchPortDetailSheetProps) {
  if (!port) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>No port selected</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const portAttrs = Object.entries(port.values);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] sm:max-w-[400px]'>
        <SheetHeader>
          <SheetTitle className='font-mono'>{port.switchPortName}</SheetTitle>
          <SheetDescription>
            <SwitchPortStatusBadge status={port.status} />
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-4'>
          <div>
            <h4 className='mb-2 text-sm font-semibold'>Switch</h4>
            <DetailRow label='Switch' value={port.switchName} />
            <DetailRow label='Port' value={port.switchPortName} />
            {portAttrs.map(([key, value]) => (
              <DetailRow key={key} label={key} value={String(value)} />
            ))}
          </div>

          <Separator />

          <div>
            <h4 className='mb-2 text-sm font-semibold'>Connected Host</h4>
            <DetailRow label='Hostname' value={port.hostName} />
            <DetailRow label='Host Port' value={port.hostPortName} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
