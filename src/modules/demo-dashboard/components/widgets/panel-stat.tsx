'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface PanelStatProps {
  options: Record<string, unknown>;
  isEditing: boolean;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

export function PanelStat({ options, isEditing, onOptionsChange }: PanelStatProps) {
  const value = (options.value as string) ?? '0';
  const unit = (options.unit as string) ?? '';
  const [draftValue, setDraftValue] = useState(value);
  const [draftUnit, setDraftUnit] = useState(unit);

  useEffect(() => {
    setDraftValue(value);
    setDraftUnit(unit);
  }, [value, unit]);

  function handleSave() {
    if (draftValue !== value || draftUnit !== unit) {
      onOptionsChange({ ...options, value: draftValue, unit: draftUnit });
    }
  }

  if (!isEditing) {
    return (
      <div className='h-full flex flex-col items-center justify-center bg-primary/5 rounded-xl p-4'>
        <span className='text-4xl font-bold'>{value}</span>
        {unit && <span className='text-sm text-muted-foreground mt-1'>{unit}</span>}
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col items-center justify-center gap-3 p-4'>
      <Input
        value={draftValue}
        onChange={(e) => setDraftValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className='w-24 text-center text-2xl font-bold h-auto py-1'
        placeholder='0'
      />
      <Input
        value={draftUnit}
        onChange={(e) => setDraftUnit(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className='w-20 text-center text-sm h-auto py-1'
        placeholder='단위'
      />
    </div>
  );
}
