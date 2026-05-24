'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Icons to exclude from logo picker (internal/functional icons)
const EXCLUDED_ICONS = new Set([
  'logo',
  'spinner',
  'toastLoading',
  'toastSuccess',
  'toastInfo',
  'toastWarning',
  'toastError',
  'close',
  'ellipsis',
  'externalLink',
  'slash',
  'moreHorizontal',
  'arrowRight',
  'chevronDown',
  'chevronLeft',
  'chevronRight',
  'chevronUp',
  'chevronsDown',
  'chevronsLeft',
  'chevronsRight',
  'chevronsUpDown',
  'dots'
]);

const AVAILABLE_ICON_KEYS = Object.keys(Icons).filter((key) => !EXCLUDED_ICONS.has(key)) as Array<
  keyof typeof Icons
>;

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredIcons = React.useMemo(() => {
    if (!search.trim()) return AVAILABLE_ICON_KEYS;
    const q = search.toLowerCase();
    return AVAILABLE_ICON_KEYS.filter((key) => key.toLowerCase().includes(q));
  }, [search]);

  const SelectedIcon = value
    ? (Icons[value as keyof typeof Icons] as React.ComponentType<{
        className?: string;
      }>)
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-48 justify-start gap-2' aria-label='아이콘 선택'>
          {SelectedIcon ? <SelectedIcon className='h-4 w-4' /> : <span className='h-4 w-4' />}
          <span className='truncate'>{value || '아이콘 선택'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-3' align='end'>
        <div className='space-y-3'>
          <Input
            placeholder='아이콘 검색...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8'
          />
          <div className='grid max-h-64 grid-cols-6 gap-1 overflow-y-auto p-1'>
            {filteredIcons.map((iconKey) => {
              const Icon = Icons[iconKey] as React.ComponentType<{
                className?: string;
              }>;
              const isSelected = value === iconKey;
              return (
                <button
                  key={iconKey}
                  type='button'
                  onClick={() => {
                    onChange(iconKey);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-md transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                  title={iconKey}
                  aria-label={iconKey}
                >
                  <Icon className='h-5 w-5' />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className='text-muted-foreground py-4 text-center text-sm'>검색 결과가 없습니다.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
