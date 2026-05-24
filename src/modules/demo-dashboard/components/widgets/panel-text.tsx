'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PanelTextProps {
  options: Record<string, unknown>;
  isEditing: boolean;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

export function PanelText({ options, isEditing, onOptionsChange }: PanelTextProps) {
  const content = (options.content as string) ?? '';
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  if (!isEditing) {
    return (
      <div className={cn('h-full p-4', !content && 'text-muted-foreground italic')}>
        {content || '내용 없음'}
      </div>
    );
  }

  return (
    <div className='h-full p-2'>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== content) {
            onOptionsChange({ ...options, content: draft });
          }
        }}
        className='h-full resize-none'
        placeholder='텍스트 입력...'
      />
    </div>
  );
}
