'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { foldersQueryOptions, demoDashboardsQueryOptions } from '../api/queries';
import {
  createDemoDashboardMutation,
  updateDemoDashboardMutation,
  deleteDemoDashboardMutation,
  createFolderMutation,
  updateFolderMutation,
  deleteFolderMutation,
  batchMoveMutation,
  type BatchMoveItem
} from '../api/mutations';
import type { DemoDashboard, DemoDashboardFolder } from '../api/types';

type BreadcrumbSegment = { id?: string; title: string };

function FolderDialog({
  open,
  onOpenChange,
  onSave,
  isPending,
  error
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => void;
  isPending: boolean;
  error?: string | null;
}) {
  const [title, setTitle] = useState('');

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) setTitle('');
      onOpenChange(open);
    },
    [onOpenChange]
  );

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;
    onSave(title.trim());
  }, [title, onSave]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 폴더</DialogTitle>
          <DialogDescription>생성할 폴더 이름을 입력하세요.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='folder-title'>폴더 이름</Label>
            <Input
              id='folder-title'
              placeholder='폴더 이름'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {error && <p className='text-xs text-destructive'>{error}</p>}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type='submit' disabled={!title.trim() || isPending}>
              {isPending ? '저장 중...' : '만들기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DashboardDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSave,
  isPending,
  error
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initial: { title: string; description: string };
  onSave: (data: { title: string; description: string }) => void;
  isPending: boolean;
  error?: string | null;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setTitle(initial.title);
        setDescription(initial.description);
      }
      onOpenChange(open);
    },
    [initial, onOpenChange]
  );

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  }, [title, description, onSave]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '새 대시보드' : '대시보드 편집'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '대시보드 이름과 설명을 입력하세요.'
              : '대시보드 설정을 수정하세요.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='title'>제목</Label>
            <Input
              id='title'
              placeholder='대시보드 이름'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {error && <p className='text-xs text-destructive'>{error}</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>설명</Label>
            <Input
              id='description'
              placeholder='설명 (선택사항)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type='submit' disabled={!title.trim() || isPending}>
              {isPending ? '저장 중...' : mode === 'create' ? '만들기' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MoveDialog({
  open,
  onOpenChange,
  count,
  folders,
  excludeIds,
  onMove,
  isPending
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  folders: DemoDashboardFolder[];
  excludeIds?: string[];
  onMove: (folderId: string | null) => void;
  isPending: boolean;
}) {
  const [moveSearch, setMoveSearch] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const exclude = new Set(excludeIds ?? []);
    const available = folders.filter((f) => !exclude.has(f.id));
    if (!moveSearch.trim()) return available;
    const q = moveSearch.toLowerCase();
    return available.filter((f) => f.title.toLowerCase().includes(q));
  }, [folders, excludeIds, moveSearch]);

  const folderMap = useMemo(() => {
    const map = new Map<string | null, DemoDashboardFolder[]>();
    for (const f of filtered) {
      const parent = f.parentId ?? null;
      if (!map.has(parent)) map.set(parent, []);
      map.get(parent)!.push(f);
    }
    return map;
  }, [filtered]);

  const getParentPath = useCallback(
    (folder: DemoDashboardFolder): string => {
      const parts: string[] = [];
      let current: DemoDashboardFolder | undefined = folder;
      while (current?.parentId) {
        const parent = folders.find((f) => f.id === current!.parentId);
        if (!parent) break;
        parts.unshift(parent.title);
        current = parent;
      }
      return parts.join(' / ');
    },
    [folders]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectTarget = useCallback((id: string | null) => {
    setSelectedTarget(id);
  }, []);

  const renderFolderRow = useCallback(
    (folder: DemoDashboardFolder, depth: number = 0) => {
      const children = folderMap.get(folder.id) ?? [];
      const hasChildren = children.length > 0;
      const isExpanded = expandedIds.has(folder.id);
      const searchActive = !!moveSearch.trim();

      return (
        <div key={folder.id}>
          <button
            onClick={() => selectTarget(folder.id)}
            className={`flex w-full items-center gap-1.5 px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors ${
              selectedTarget === folder.id ? 'bg-primary/10 text-primary font-medium' : ''
            }`}
          >
            <span
              role='button'
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpand(folder.id);
                }
              }}
              className={`shrink-0 flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-transform ${
                hasChildren ? '' : 'invisible'
              } ${isExpanded ? 'rotate-90' : ''}`}
            >
              <Icons.chevronRight className='h-3.5 w-3.5' />
            </span>
            <Icons.folder className='h-4 w-4 shrink-0 text-primary' />
            <span className='truncate'>{folder.title}</span>
            {searchActive && (
              <span className='ml-auto shrink-0 text-xs text-muted-foreground/60 truncate max-w-[40%]'>
                {getParentPath(folder)}
              </span>
            )}
          </button>
          {isExpanded &&
            children.map((child) => (
              <div key={child.id} style={{ paddingLeft: 20 }}>
                {renderFolderRow(child, depth + 1)}
              </div>
            ))}
        </div>
      );
    },
    [folderMap, expandedIds, selectedTarget, moveSearch, selectTarget, toggleExpand, getParentPath]
  );

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setSelectedTarget(null);
        setMoveSearch('');
        setExpandedIds(new Set());
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      onOpenChange(open);
    },
    [onOpenChange]
  );

  const rootFolders = folderMap.get(null) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>항목 이동</DialogTitle>
          <DialogDescription>{count}개 항목을 이동할 대상 폴더를 선택하세요.</DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='relative'>
            <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <input
              ref={inputRef}
              value={moveSearch}
              onChange={(e) => setMoveSearch(e.target.value)}
              placeholder='폴더 검색...'
              className='flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring'
            />
          </div>
          <div ref={listRef} className='max-h-[300px] overflow-y-auto rounded-md border'>
            <div className='py-1'>
              <button
                onClick={() => selectTarget(null)}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors ${
                  selectedTarget === null ? 'bg-primary/10 text-primary font-medium' : ''
                }`}
              >
                <Icons.home className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span>최상위 (폴더 없음)</span>
              </button>
              {rootFolders.map((f) => renderFolderRow(f))}
              {filtered.length === 0 && moveSearch.trim() && (
                <p className='px-2 py-4 text-sm text-muted-foreground text-center'>
                  검색 결과가 없습니다.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={() => onMove(selectedTarget)} disabled={isPending}>
              {isPending ? '이동 중...' : '이동'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get('folder');

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<'name' | 'updatedAt'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderTitle, setEditFolderTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [dashboardDialog, setDashboardDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    editingId?: string;
    initial: { title: string; description: string };
  }>({ open: false, mode: 'create', initial: { title: '', description: '' } });
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'folder' | 'dashboard';
    id: string;
    title: string;
  } | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const { data: allFolders, isLoading: foldersLoading } = useQuery(foldersQueryOptions());
  const { data: dashboards, isLoading: dashboardsLoading } = useQuery(
    demoDashboardsQueryOptions(currentFolderId || null)
  );

  const currentFolders = useMemo(
    () => (allFolders ?? []).filter((f) => (f.parentId ?? null) === (currentFolderId || null)),
    [allFolders, currentFolderId]
  );

  const breadcrumb = useMemo(() => {
    const path: BreadcrumbSegment[] = [{ title: '홈' }];
    if (!currentFolderId || !allFolders) return path;
    let cursor: string | undefined = currentFolderId;
    const segments: BreadcrumbSegment[] = [];
    while (cursor) {
      const folder = allFolders.find((f) => f.id === cursor);
      if (!folder) break;
      segments.unshift({ id: folder.id, title: folder.title });
      cursor = folder.parentId ?? undefined;
    }
    path.push(...segments);
    return path;
  }, [currentFolderId, allFolders]);

  const allFoldersFlat = useMemo(() => allFolders ?? [], [allFolders]);

  const filteredFolders = useMemo(
    () => currentFolders.filter((f) => f.title.toLowerCase().includes(search.toLowerCase())),
    [currentFolders, search]
  );

  const filteredDashboards = useMemo(() => {
    if (!dashboards) return [];
    if (!search.trim()) return dashboards;
    const q = search.toLowerCase();
    return dashboards.filter(
      (d) => d.title.toLowerCase().includes(q) || (d.description ?? '').toLowerCase().includes(q)
    );
  }, [dashboards, search]);

  const currentFolder = useMemo(() => {
    if (!currentFolderId || !allFolders) return null;
    return allFolders.find((f) => f.id === currentFolderId) ?? null;
  }, [currentFolderId, allFolders]);

  const handleSort = useCallback(
    (key: 'name' | 'updatedAt') => {
      if (sortKey === key) setSortAsc(!sortAsc);
      else {
        setSortKey(key);
        setSortAsc(true);
      }
    },
    [sortKey, sortAsc]
  );

  const sortedFolders = useMemo(() => {
    const items = [...filteredFolders];
    items.sort((a, b) => {
      const cmp =
        sortKey === 'name'
          ? a.title.localeCompare(b.title)
          : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [filteredFolders, sortKey, sortAsc]);

  const sortedDashboards = useMemo(() => {
    const items = [...filteredDashboards];
    items.sort((a, b) => {
      const cmp =
        sortKey === 'name'
          ? a.title.localeCompare(b.title)
          : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [filteredDashboards, sortKey, sortAsc]);

  const selectionCount = selectedIds.size;

  const toggleSelect = useCallback((type: 'd' | 'f', id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = `${type}-${id}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    const keys = [
      ...sortedFolders.map((f) => `f-${f.id}`),
      ...sortedDashboards.map((d) => `d-${d.id}`)
    ];
    setSelectedIds(new Set(keys));
  }, [sortedFolders, sortedDashboards]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const allVisibleSelected = useMemo(
    () =>
      sortedFolders.length + sortedDashboards.length > 0 &&
      sortedFolders.every((f) => selectedIds.has(`f-${f.id}`)) &&
      sortedDashboards.every((d) => selectedIds.has(`d-${d.id}`)),
    [sortedFolders, sortedDashboards, selectedIds]
  );

  const navigateTo = useCallback(
    (folderId: string | null) => {
      clearSelection();
      const params = new URLSearchParams(searchParams.toString());
      if (folderId) params.set('folder', folderId);
      else params.delete('folder');
      router.push(`/demo-logic/grid-dashboard?${params.toString()}`);
    },
    [router, searchParams, clearSelection]
  );

  const createFolder = useMutation({
    ...createFolderMutation,
    onSuccess(data, variables, context, _mutation) {
      createFolderMutation.onSuccess?.(data, variables, context, _mutation);
      setFolderDialogOpen(false);
    }
  });

  const renameFolder = useMutation({
    ...updateFolderMutation,
    onSuccess(data, variables, context, _mutation) {
      updateFolderMutation.onSuccess?.(data, variables, context, _mutation);
      setEditingFolderId(null);
    }
  });

  const deleteFolder = useMutation({
    ...deleteFolderMutation,
    onSuccess(data, variables, context, _mutation) {
      deleteFolderMutation.onSuccess?.(data, variables, context, _mutation);
      setDeleteTarget(null);
      setBatchDeleteOpen(false);
    }
  });

  const createDashboard = useMutation({
    ...createDemoDashboardMutation,
    onSuccess(data, variables, context, _mutation) {
      createDemoDashboardMutation.onSuccess?.(data, variables, context, _mutation);
      setDashboardDialog({ open: false, mode: 'create', initial: { title: '', description: '' } });
    }
  });

  const updateDashboard = useMutation({
    ...updateDemoDashboardMutation,
    onSuccess(data, variables, context, _mutation) {
      updateDemoDashboardMutation.onSuccess?.(data, variables, context, _mutation);
      setDashboardDialog({ open: false, mode: 'create', initial: { title: '', description: '' } });
    }
  });

  const batchMove = useMutation({
    ...batchMoveMutation,
    onSuccess(data, variables, context, _mutation) {
      batchMoveMutation.onSuccess?.(data, variables, context, _mutation);
      setMoveDialogOpen(false);
    }
  });

  const deleteDashboard = useMutation({
    ...deleteDemoDashboardMutation,
    onSuccess(data, variables, context, _mutation) {
      deleteDemoDashboardMutation.onSuccess?.(data, variables, context, _mutation);
      setDeleteTarget(null);
      setBatchDeleteOpen(false);
    }
  });

  const handleFolderSave = useCallback(
    (title: string) => {
      createFolder.mutate({ title, parentId: currentFolderId || null });
    },
    [currentFolderId, createFolder]
  );

  const handleDashboardSave = useCallback(
    (data: { title: string; description: string }) => {
      if (dashboardDialog.mode === 'create') {
        createDashboard.mutate({ ...data, folderId: currentFolderId || null });
      } else if (dashboardDialog.editingId) {
        updateDashboard.mutate({ id: dashboardDialog.editingId, data });
      }
    },
    [dashboardDialog, currentFolderId, createDashboard, updateDashboard]
  );

  const handleBatchMove = useCallback(
    (targetFolderId: string | null) => {
      const moves: BatchMoveItem[] = [
        ...sortedDashboards
          .filter((d) => selectedIds.has(`d-${d.id}`) && d.folderId !== targetFolderId)
          .map((d) => ({ type: 'dashboard' as const, id: d.id, targetFolderId })),
        ...sortedFolders
          .filter(
            (f) =>
              selectedIds.has(`f-${f.id}`) &&
              f.parentId !== (targetFolderId ?? null) &&
              f.id !== targetFolderId
          )
          .map((f) => ({ type: 'folder' as const, id: f.id, targetFolderId }))
      ];
      if (moves.length > 0) {
        batchMove.mutate(moves);
      } else {
        setMoveDialogOpen(false);
      }
      clearSelection();
    },
    [sortedDashboards, sortedFolders, selectedIds, batchMove, clearSelection]
  );

  const handleBatchDelete = useCallback(() => {
    const selectedDashboards = sortedDashboards.filter((d) => selectedIds.has(`d-${d.id}`));
    const selectedFolders = sortedFolders.filter((f) => selectedIds.has(`f-${f.id}`));
    for (const d of selectedDashboards) deleteDashboard.mutate(d.id);
    for (const f of selectedFolders) deleteFolder.mutate(f.id);
    clearSelection();
  }, [sortedDashboards, sortedFolders, selectedIds, deleteDashboard, deleteFolder, clearSelection]);

  const handleSingleDelete = useCallback(() => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'folder') deleteFolder.mutate(deleteTarget.id);
    else deleteDashboard.mutate(deleteTarget.id);
  }, [deleteTarget, deleteFolder, deleteDashboard]);

  const startRename = useCallback((folder: DemoDashboardFolder) => {
    setEditingFolderId(folder.id);
    setEditFolderTitle(folder.title);
    setTimeout(() => editInputRef.current?.focus(), 0);
  }, []);

  const commitRename = useCallback(() => {
    if (!editingFolderId) return;
    const trimmed = editFolderTitle.trim();
    if (!trimmed || trimmed === allFolders?.find((f) => f.id === editingFolderId)?.title) {
      setEditingFolderId(null);
      return;
    }
    renameFolder.mutate({ id: editingFolderId, data: { title: trimmed } });
  }, [editingFolderId, editFolderTitle, allFolders, renameFolder]);

  const cancelRename = useCallback(() => {
    setEditingFolderId(null);
  }, []);

  const sortIcon = (key: 'name' | 'updatedAt') => {
    if (sortKey !== key)
      return <Icons.chevronsUpDown className='ml-1 h-3.5 w-3.5 text-muted-foreground/40' />;
    return sortAsc ? (
      <Icons.chevronDown className='ml-1 h-3.5 w-3.5' />
    ) : (
      <Icons.chevronUp className='ml-1 h-3.5 w-3.5' />
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

  const isLoading = foldersLoading || dashboardsLoading;
  const hasItems = filteredFolders.length > 0 || filteredDashboards.length > 0;
  const showTable = hasItems || !!currentFolderId;

  return (
    <div className='space-y-4'>
      <nav className='flex items-center gap-1 text-sm'>
        {breadcrumb.map((seg, i) => (
          <span key={seg.id ?? 'home'} className='flex items-center gap-1'>
            {i > 0 && <Icons.chevronRight className='h-3.5 w-3.5 text-muted-foreground' />}
            {seg.id ? (
              <button
                onClick={() => navigateTo(seg.id ?? null)}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                {seg.title}
              </button>
            ) : (
              <button
                onClick={() => navigateTo(null)}
                className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors'
              >
                <Icons.home className='h-3.5 w-3.5' />
                {seg.title}
              </button>
            )}
          </span>
        ))}
      </nav>

      <div className='flex items-center gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='대시보드 및 폴더 검색...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        {selectionCount > 0 && (
          <>
            <Button variant='outline' size='sm' onClick={() => setMoveDialogOpen(true)}>
              <Icons.externalLink className='mr-1.5 h-4 w-4' />
              이동 ({selectionCount})
            </Button>
            <Button variant='outline' size='sm' onClick={() => setBatchDeleteOpen(true)}>
              <Icons.trash className='mr-1.5 h-4 w-4' />
              삭제 ({selectionCount})
            </Button>
          </>
        )}
        <Button variant='outline' size='sm' onClick={() => setFolderDialogOpen(true)}>
          <Icons.folderPlus className='mr-1.5 h-4 w-4' />새 폴더
        </Button>
        <Button
          onClick={() =>
            setDashboardDialog({
              open: true,
              mode: 'create',
              initial: { title: '', description: '' }
            })
          }
        >
          <Icons.add className='mr-2 h-4 w-4' />
          새로 만들기
        </Button>
      </div>

      <FolderDialog
        key={`folder-${folderDialogOpen ? 'create' : 'closed'}`}
        open={folderDialogOpen}
        onOpenChange={(open) => {
          if (!open) setFolderDialogOpen(false);
        }}
        onSave={handleFolderSave}
        isPending={createFolder.isPending}
        error={createFolder.error?.message}
      />

      <DashboardDialog
        key={`dashboard-${dashboardDialog.editingId ?? 'create'}`}
        open={dashboardDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setDashboardDialog({
              open: false,
              mode: 'create',
              initial: { title: '', description: '' }
            });
        }}
        mode={dashboardDialog.mode}
        initial={dashboardDialog.initial}
        onSave={handleDashboardSave}
        isPending={createDashboard.isPending || updateDashboard.isPending}
        error={createDashboard.error?.message ?? updateDashboard.error?.message}
      />

      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={(open) => {
          if (!open) setMoveDialogOpen(false);
        }}
        count={selectionCount}
        folders={allFoldersFlat}
        excludeIds={[...selectedIds].filter((k) => k.startsWith('f-')).map((k) => k.slice(2))}
        onMove={handleBatchMove}
        isPending={batchMove.isPending}
      />

      {isLoading && (
        <div className='flex h-32 items-center justify-center'>
          <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          <p className='text-muted-foreground text-sm'>불러오는 중...</p>
        </div>
      )}

      {!isLoading && !showTable && (
        <div className='flex h-48 flex-col items-center justify-center gap-3 rounded-lg border'>
          <Icons.folder className='h-10 w-10 text-muted-foreground/30' />
          <p className='text-muted-foreground text-sm'>
            {search.trim() ? '검색 결과가 없습니다.' : '이 폴더가 비어 있습니다.'}
          </p>
        </div>
      )}

      {!isLoading && showTable && (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(checked) => {
                      if (checked) selectAllVisible();
                      else clearSelection();
                    }}
                    aria-label='전체 선택'
                  />
                </TableHead>
                <TableHead className='w-[320px]'>
                  <button
                    onClick={() => handleSort('name')}
                    className='inline-flex items-center hover:text-foreground transition-colors'
                  >
                    이름{sortIcon('name')}
                  </button>
                </TableHead>
                <TableHead className='hidden md:table-cell'>설명</TableHead>
                <TableHead className='w-[70px] text-center'>위젯</TableHead>
                <TableHead className='hidden sm:table-cell w-[140px]'>
                  <button
                    onClick={() => handleSort('updatedAt')}
                    className='inline-flex items-center hover:text-foreground transition-colors'
                  >
                    수정일{sortIcon('updatedAt')}
                  </button>
                </TableHead>
                <TableHead className='w-[70px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFolderId && (
                <TableRow className='cursor-pointer hover:bg-muted/50'>
                  <TableCell className='p-2' />
                  <TableCell
                    onClick={() =>
                      navigateTo(currentFolder ? (currentFolder.parentId ?? null) : null)
                    }
                    colSpan={3}
                  >
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Icons.folderOpen className='h-4 w-4 shrink-0 text-primary' />
                      <span className='font-medium'>..</span>
                    </div>
                  </TableCell>
                  <TableCell className='hidden sm:table-cell' />
                  <TableCell />
                </TableRow>
              )}
              {sortedFolders.map((folder) => (
                <TableRow key={folder.id} className='cursor-pointer hover:bg-muted/50'>
                  <TableCell className='p-2' onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(`f-${folder.id}`)}
                      onCheckedChange={() => toggleSelect('f', folder.id)}
                      aria-label={`${folder.title} 선택`}
                    />
                  </TableCell>
                  <TableCell onClick={() => navigateTo(folder.id)}>
                    <div className='flex items-center gap-2'>
                      <Icons.folder className='h-4 w-4 shrink-0 text-primary' />
                      {editingFolderId === folder.id ? (
                        <input
                          ref={editInputRef}
                          value={editFolderTitle}
                          onChange={(e) => setEditFolderTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename();
                            if (e.key === 'Escape') cancelRename();
                          }}
                          onBlur={commitRename}
                          onClick={(e) => e.stopPropagation()}
                          className='flex-1 bg-transparent outline-none border-b border-primary'
                        />
                      ) : (
                        <span className='font-medium truncate'>{folder.title}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className='hidden md:table-cell text-muted-foreground'
                    onClick={() => navigateTo(folder.id)}
                  >
                    <span className='text-xs'>폴더</span>
                  </TableCell>
                  <TableCell
                    className='text-center tabular-nums text-muted-foreground'
                    onClick={() => navigateTo(folder.id)}
                  >
                    {'\u2014'}
                  </TableCell>
                  <TableCell
                    className='hidden sm:table-cell text-muted-foreground'
                    onClick={() => navigateTo(folder.id)}
                  >
                    {formatDate(folder.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-0.5'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(folder);
                        }}
                        aria-label='폴더 이름 변경'
                      >
                        <Icons.edit className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 hover:text-destructive'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: 'folder', id: folder.id, title: folder.title });
                        }}
                        aria-label='폴더 삭제'
                      >
                        <Icons.trash className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortedDashboards.map((dashboard) => (
                <TableRow key={dashboard.id} className='cursor-pointer hover:bg-muted/50'>
                  <TableCell className='p-2' onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(`d-${dashboard.id}`)}
                      onCheckedChange={() => toggleSelect('d', dashboard.id)}
                      aria-label={`${dashboard.title} 선택`}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => router.push(`/demo-logic/grid-dashboard/${dashboard.id}`)}
                  >
                    <div className='flex items-center gap-2'>
                      <Icons.dashboard className='h-4 w-4 shrink-0 text-muted-foreground' />
                      <span className='font-medium truncate'>{dashboard.title}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className='hidden md:table-cell text-muted-foreground'
                    onClick={() => router.push(`/demo-logic/grid-dashboard/${dashboard.id}`)}
                  >
                    <span className='truncate block max-w-[200px]'>
                      {dashboard.description || '\u2014'}
                    </span>
                  </TableCell>
                  <TableCell
                    className='text-center tabular-nums'
                    onClick={() => router.push(`/demo-logic/grid-dashboard/${dashboard.id}`)}
                  >
                    {dashboard.panels.length}
                  </TableCell>
                  <TableCell
                    className='hidden sm:table-cell text-muted-foreground'
                    onClick={() => router.push(`/demo-logic/grid-dashboard/${dashboard.id}`)}
                  >
                    {formatDate(dashboard.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-0.5'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDashboardDialog({
                            open: true,
                            mode: 'edit',
                            editingId: dashboard.id,
                            initial: {
                              title: dashboard.title,
                              description: dashboard.description ?? ''
                            }
                          });
                        }}
                        aria-label='대시보드 편집'
                      >
                        <Icons.edit className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 hover:text-destructive'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({
                            type: 'dashboard',
                            id: dashboard.id,
                            title: dashboard.title
                          });
                        }}
                        aria-label='대시보드 삭제'
                      >
                        <Icons.trash className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className='text-muted-foreground text-xs'>
        {sortedFolders.length + sortedDashboards.length}개 항목
        {search.trim() && ` · ${filteredFolders.length + filteredDashboards.length}개 일치`}
      </p>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === 'folder' ? '폴더 삭제' : '대시보드 삭제'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo;
              {deleteTarget?.type === 'folder'
                ? ' 폴더를 삭제하시겠습니까? 폴더 내 모든 대시보드도 함께 삭제됩니다.'
                : ' 대시보드를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSingleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteFolder.isPending || deleteDashboard.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={batchDeleteOpen}
        onOpenChange={(open) => {
          if (!open) setBatchDeleteOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일괄 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectionCount}개 항목을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteFolder.isPending || deleteDashboard.isPending
                ? '삭제 중...'
                : `${selectionCount}개 삭제`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
