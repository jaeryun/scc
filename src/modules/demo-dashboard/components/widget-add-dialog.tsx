'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { PANEL_TYPES } from './widgets/panel-registry';
import type { PanelType } from '../api/types';

interface WidgetAddDialogProps {
  onAdd: (panelType: PanelType) => void;
}

export function WidgetAddDialog({ onAdd }: WidgetAddDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Icons.add className='mr-2 h-4 w-4' />
          위젯 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>위젯 추가</DialogTitle>
        </DialogHeader>
        <div className='grid gap-2'>
          {PANEL_TYPES.map((pt) => (
            <Button
              key={pt.type}
              variant='outline'
              className='justify-start'
              onClick={() => {
                onAdd(pt);
                setOpen(false);
              }}
            >
              <span className='font-medium'>{pt.label}</span>
              <span className='text-muted-foreground ml-2 text-xs'>
                {pt.defaultGridPos.w}&times;{pt.defaultGridPos.h}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
