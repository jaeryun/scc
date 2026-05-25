'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface PanelStatProps {
  options: Record<string, unknown>;
  isEditing: boolean;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

export function PanelStat({ options, isEditing, onOptionsChange }: PanelStatProps) {
  const value = (options.value as string) ?? '0';
  const unit = (options.unit as string) ?? '';
  const title = (options.title as string) ?? '';
  const prefix = (options.prefix as string) ?? '';
  const trend = (options.trend as string | undefined) ?? undefined;
  const trendValue = (options.trendValue as string) ?? '';
  const footer = (options.footer as string) ?? '';

  const [draftValue, setDraftValue] = useState(value);
  const [draftUnit, setDraftUnit] = useState(unit);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftPrefix, setDraftPrefix] = useState(prefix);
  const [draftTrend, setDraftTrend] = useState(trend ?? 'none');
  const [draftTrendValue, setDraftTrendValue] = useState(trendValue);
  const [draftFooter, setDraftFooter] = useState(footer);

  useEffect(() => {
    setDraftValue(value);
    setDraftUnit(unit);
    setDraftTitle(title);
    setDraftPrefix(prefix);
    setDraftTrend(trend ?? 'none');
    setDraftTrendValue(trendValue);
    setDraftFooter(footer);
  }, [value, unit, title, prefix, trend, trendValue, footer]);

  function handleSave() {
    const changed =
      draftValue !== value ||
      draftUnit !== unit ||
      draftTitle !== title ||
      draftPrefix !== prefix ||
      draftTrend !== (trend ?? 'none') ||
      draftTrendValue !== trendValue ||
      draftFooter !== footer;
    if (!changed) return;

    onOptionsChange({
      ...options,
      value: draftValue,
      unit: draftUnit,
      title: draftTitle || undefined,
      prefix: draftPrefix || undefined,
      trend: draftTrend === 'none' ? undefined : draftTrend,
      trendValue: draftTrendValue || undefined,
      footer: draftFooter || undefined
    });
  }

  if (!isEditing) {
    return (
      <div className='h-full flex flex-col bg-primary/5 rounded-xl p-4'>
        {title && <span className='text-xs text-muted-foreground mb-1'>{title}</span>}
        <div className='flex items-baseline gap-0.5'>
          {prefix && <span className='text-sm text-muted-foreground'>{prefix}</span>}
          <span className='text-3xl font-bold'>{value}</span>
          {unit && <span className='text-sm text-muted-foreground ml-1'>{unit}</span>}
        </div>
        {trend && (
          <div className='mt-1'>
            <Badge variant='outline' className='text-xs gap-1'>
              {trend === 'up' ? (
                <Icons.trendingUp className='size-3' />
              ) : (
                <Icons.trendingDown className='size-3' />
              )}
              {trendValue || ''}
            </Badge>
          </div>
        )}
        {footer && <div className='mt-auto pt-2 text-xs text-muted-foreground'>{footer}</div>}
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
      <div className='flex gap-2'>
        <Input
          value={draftPrefix}
          onChange={(e) => setDraftPrefix(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          className='w-16 h-7 text-xs'
          placeholder='접두사'
        />
        <Input
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          className='flex-1 h-7 text-sm font-bold'
          placeholder='0'
        />
        <Input
          value={draftUnit}
          onChange={(e) => setDraftUnit(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          className='w-16 h-7 text-xs'
          placeholder='단위'
        />
      </div>
      <div className='flex gap-2 items-center'>
        <select
          value={draftTrend}
          onChange={(e) => {
            setDraftTrend(e.target.value);
            handleSave();
          }}
          className='h-7 border rounded px-1 text-xs'
        >
          <option value='none'>트렌드 없음</option>
          <option value='up'>상승</option>
          <option value='down'>하락</option>
        </select>
        <Input
          value={draftTrendValue}
          onChange={(e) => setDraftTrendValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          className='flex-1 h-7 text-xs'
          placeholder='트렌드 값 (선택)'
        />
      </div>
      <Input
        value={draftFooter}
        onChange={(e) => setDraftFooter(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className='h-7 text-xs'
        placeholder='하단 텍스트 (선택)'
      />
    </div>
  );
}
