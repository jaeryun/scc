'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { dashboardsQueryOptions } from '../api/queries';
import { createDashboardMutation } from '../api/mutations';

export function DashboardList() {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const { data: dashboards, isLoading } = useQuery(dashboardsQueryOptions());
  const createMutation = useMutation({
    ...createDashboardMutation,
    onSuccess: (data) => {
      router.push(`/san/${data.id}`);
    }
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim() });
    setNewName('');
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Input
          placeholder='New dashboard name...'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className='max-w-sm'
        />
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <Icons.add className='mr-2 h-4 w-4' />
          New Dashboard
        </Button>
      </div>

      {isLoading && <p className='text-muted-foreground'>Loading...</p>}

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {dashboards?.map((dashboard) => (
          <Card
            key={dashboard.id}
            className='cursor-pointer hover:bg-muted/50'
            onClick={() => router.push(`/san/${dashboard.id}`)}
          >
            <CardHeader>
              <CardTitle className='text-lg'>{dashboard.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>{dashboard.items.length} widgets</p>
              <p className='text-muted-foreground text-xs'>
                Updated {new Date(dashboard.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
