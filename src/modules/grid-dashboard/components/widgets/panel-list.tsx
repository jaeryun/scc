'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PanelListProps {
  options: Record<string, unknown>;
  isEditing: boolean;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

function getColumnDefs(options: Record<string, unknown>) {
  const columns = (options.columns as { key: string; label: string; type: string }[]) ?? [
    { key: 'name', label: '이름', type: 'avatar' },
    { key: 'email', label: '이메일', type: 'text' },
    { key: 'amount', label: '금액', type: 'amount' }
  ];
  const rows = (options.rows as Record<string, string>[]) ?? [];
  return { columns, rows };
}

function renderCell(value: string, type: string) {
  switch (type) {
    case 'avatar':
      return (
        <div className='flex items-center gap-2'>
          <Avatar className='size-6'>
            <AvatarFallback className='text-xs'>
              {value
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm font-medium'>{value}</span>
        </div>
      );
    case 'amount':
      return <span className='text-sm font-medium tabular-nums'>{value}</span>;
    default:
      return <span className='text-sm text-muted-foreground'>{value}</span>;
  }
}

export function PanelList({ options, isEditing, onOptionsChange }: PanelListProps) {
  const { columns, rows } = getColumnDefs(options);
  const title = (options.title as string) ?? '';

  const [draftTitle, setDraftTitle] = useState(title);
  const [draftRows, setDraftRows] = useState(rows);

  useEffect(() => {
    setDraftTitle(title);
    setDraftRows(rows);
  }, [title, rows]);

  function handleSave() {
    onOptionsChange({ ...options, title: draftTitle || undefined, rows: draftRows });
  }

  function updateCell(rowIndex: number, key: string, value: string) {
    const updated = draftRows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row));
    setDraftRows(updated);
  }

  if (!isEditing) {
    if (rows.length === 0) {
      return (
        <div className='h-full flex items-center justify-center text-muted-foreground text-sm'>
          데이터 없음
        </div>
      );
    }
    return (
      <div className='h-full flex flex-col overflow-auto'>
        {title && <div className='text-sm font-semibold px-4 pt-3 pb-2'>{title}</div>}
        <div className='flex-1 overflow-auto'>
          {rows.map((row, i) => (
            <div
              key={i}
              className='flex items-center justify-between px-4 py-2 border-b last:border-b-0'
            >
              {columns.map((col) => (
                <div key={col.key}>{renderCell(row[col.key] ?? '', col.type)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col gap-2 p-3 overflow-auto'>
      <Input
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className='h-7 text-xs'
        placeholder='제목 (선택)'
      />
      <div className='text-xs text-muted-foreground mb-1'>
        행 {draftRows.length}개 / 열 {columns.length}개
      </div>
      {draftRows.map((row, rowIndex) => (
        <div key={rowIndex} className='flex gap-1 items-center'>
          {columns.map((col) => (
            <Input
              key={col.key}
              value={row[col.key] ?? ''}
              onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
              onBlur={handleSave}
              className='flex-1 h-7 text-xs'
              placeholder={col.label}
            />
          ))}
          <Button
            variant='ghost'
            size='icon'
            className='size-7 shrink-0'
            onClick={() => {
              setDraftRows(draftRows.filter((_, i) => i !== rowIndex));
            }}
          >
            <Icons.close className='size-3' />
          </Button>
        </div>
      ))}
      <Button
        variant='outline'
        size='sm'
        className='h-7 text-xs'
        onClick={() => {
          const newRow: Record<string, string> = {};
          columns.forEach((col) => {
            newRow[col.key] = '';
          });
          setDraftRows([...draftRows, newRow]);
        }}
      >
        <Icons.add className='size-3' />행 추가
      </Button>
    </div>
  );
}
