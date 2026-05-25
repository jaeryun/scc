'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { workspaceByIdOptions, teamMembersQueryOptions } from '../api/queries';
import { updateMemberRoleMutation } from '../api/mutations';
import type { TeamMember } from '../api/types';
import { TeamSkeleton } from './team-skeleton';

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' }
] as const;

function getRoleBadgeVariant(role: TeamMember['role']) {
  if (role === 'owner') return 'default' as const;
  if (role === 'admin') return 'secondary' as const;
  return 'outline' as const;
}

function getRoleLabel(role: TeamMember['role']) {
  if (role === 'owner') return 'Owner';
  if (role === 'admin') return 'Admin';
  return 'Member';
}

export function TeamView({ workspaceId }: { workspaceId: string }) {
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<TeamMember['role']>('member');

  const { data: workspace } = useQuery(workspaceByIdOptions(workspaceId));
  const { data: members, isLoading } = useQuery(teamMembersQueryOptions(workspaceId));

  const roleMutation = useMutation({
    ...updateMemberRoleMutation,
    onSuccess: () => {
      toast.success('역할이 변경되었습니다');
      setEditMember(null);
    },
    onError: () => {
      toast.error('역할 변경에 실패했습니다');
    }
  });

  if (isLoading) return <TeamSkeleton />;

  const handleEditRole = (member: TeamMember) => {
    setEditMember(member);
    setNewRole(member.role);
  };

  const handleSaveRole = () => {
    if (!editMember) return;
    roleMutation.mutate({
      workspaceId,
      memberId: editMember.id,
      role: newRole
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>워크스페이스:</span>
        <span className='text-sm font-medium'>{workspace?.name ?? workspaceId}</span>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground'>
                  팀 멤버가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className='font-medium'>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant='ghost' size='sm' onClick={() => handleEditRole(member)}>
                      <Icons.edit className='mr-1 h-3 w-3' />
                      역할 변경
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editMember}
        onOpenChange={(open) => {
          if (!open) setEditMember(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할 변경</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>멤버</Label>
              <p className='text-sm'>
                {editMember?.name} ({editMember?.email})
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role-select'>역할</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamMember['role'])}>
                <SelectTrigger id='role-select'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditMember(null)}>
              취소
            </Button>
            <Button onClick={handleSaveRole} disabled={roleMutation.isPending}>
              {roleMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
