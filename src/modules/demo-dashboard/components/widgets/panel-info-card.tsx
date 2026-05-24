'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  inactive: 'secondary',
  warning: 'destructive'
};

const STATUS_LABEL: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  warning: '경고'
};

const BORDER_COLORS: Record<string, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  amber: 'border-l-amber-500',
  red: 'border-l-red-500'
};

interface PanelInfoCardProps {
  options: Record<string, unknown>;
  isEditing: boolean;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

export function PanelInfoCard({ options, isEditing, onOptionsChange }: PanelInfoCardProps) {
  const description = (options.description as string) ?? '';
  const status = (options.status as string) ?? 'active';
  const color = (options.color as string) ?? 'blue';
  const showBorder = (options.showBorder as boolean) ?? true;

  const [draftDescription, setDraftDescription] = useState(description);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftColor, setDraftColor] = useState(color);
  const [draftShowBorder, setDraftShowBorder] = useState(showBorder);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setDraftDescription(description);
    setDraftStatus(status);
    setDraftColor(color);
    setDraftShowBorder(showBorder);
  }, [description, status, color, showBorder]);

  function handleSave() {
    onOptionsChange({
      ...options,
      description: draftDescription,
      status: draftStatus,
      color: draftColor,
      showBorder: draftShowBorder
    });
    setDialogOpen(false);
  }

  return (
    <div
      className={cn(
        'h-full flex flex-col p-4',
        showBorder && `border-l-4 ${BORDER_COLORS[color] ?? 'border-l-blue-500'}`
      )}
    >
      {isEditing && (
        <div className='flex justify-end mb-2'>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='ghost' size='icon' className='size-7'>
                <Icons.settings className='size-4' />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>정보 카드 편집</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-2'>
                <div className='grid gap-2'>
                  <Label>설명</Label>
                  <Textarea
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    placeholder='설명 입력...'
                    rows={3}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label>상태</Label>
                  <Select value={draftStatus} onValueChange={setDraftStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>활성</SelectItem>
                      <SelectItem value='inactive'>비활성</SelectItem>
                      <SelectItem value='warning'>경고</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label>색상</Label>
                  <Select value={draftColor} onValueChange={setDraftColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='blue'>파랑</SelectItem>
                      <SelectItem value='green'>초록</SelectItem>
                      <SelectItem value='amber'>주황</SelectItem>
                      <SelectItem value='red'>빨강</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='show-border'
                    checked={draftShowBorder}
                    onCheckedChange={(checked) => setDraftShowBorder(checked === true)}
                  />
                  <Label htmlFor='show-border'>테두리 표시</Label>
                </div>
              </div>
              <div className='flex justify-end'>
                <Button onClick={handleSave}>
                  <Icons.check className='size-4' />
                  저장
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div className='flex-1'>
        <p className={cn('text-sm', !description && 'text-muted-foreground italic')}>
          {description || '설명 없음'}
        </p>
      </div>
      <div className='mt-auto pt-2'>
        <Badge variant={STATUS_VARIANT[status] ?? 'default'}>
          {STATUS_LABEL[status] ?? status}
        </Badge>
      </div>
    </div>
  );
}
