'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import { workspacesQueryOptions } from '../api/queries';
import { createWorkspaceMutation } from '../api/mutations';
import type { Workspace } from '../api/types';
import { WorkspaceSkeleton } from './workspace-skeleton';

export function WorkspaceView() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: workspaces, isLoading } = useQuery(workspacesQueryOptions());

  const createMutation = useMutation({
    ...createWorkspaceMutation,
    onSuccess: () => {
      toast.success('워크스페이스가 생성되었습니다');
      setCreateOpen(false);
      setName('');
      setDescription('');
    },
    onError: () => {
      toast.error('워크스페이스 생성에 실패했습니다');
    }
  });

  if (isLoading) return <WorkspaceSkeleton />;

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() });
  };

  return (
    <>
      <div className='mb-4 flex justify-end'>
        <Button onClick={() => setCreateOpen(true)} size='sm'>
          <Icons.add className='mr-1 h-4 w-4' />새 워크스페이스
        </Button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {workspaces?.map((ws: Workspace) => (
          <Card key={ws.id} className='transition-shadow hover:shadow-md'>
            <CardHeader>
              <CardTitle>{ws.name}</CardTitle>
              <CardDescription>{ws.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-6 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <Icons.user className='h-4 w-4' />
                  <span>{ws.memberCount}명</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Icons.calendar className='h-4 w-4' />
                  <span>{formatDate(ws.createdAt)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push(`/library/modules/workspaces/team/${ws.id}`)}
              >
                <Icons.teams className='mr-1 h-4 w-4' />팀 관리
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 워크스페이스</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='ws-name'>워크스페이스 이름</Label>
              <Input
                id='ws-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='워크스페이스 이름을 입력하세요'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='ws-desc'>설명</Label>
              <Textarea
                id='ws-desc'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='워크스페이스 설명을 입력하세요'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
