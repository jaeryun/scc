'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viewSettingsQueryOptions, viewSettingKeys } from '@/modules/view-settings/api/queries';
import { updateViewSetting } from '@/modules/view-settings/api/service';
import { views } from '@/config/views';
import { Icons } from '@/components/icons';
import IconPicker from './icon-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViewSettingsForm() {
  const queryClient = useQueryClient();
  const { data: viewSettings, isLoading } = useQuery(viewSettingsQueryOptions());

  const mutation = useMutation({
    mutationFn: ({ viewId, icon }: { viewId: string; icon: string }) =>
      updateViewSetting(viewId, { icon }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewSettingKeys.all });
    },
  });

  const viewIconMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (viewSettings) {
      viewSettings.forEach((s) => map.set(s.viewId, s.icon));
    }
    return map;
  }, [viewSettings]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div className='bg-muted h-8 w-48 animate-pulse rounded' />
            <div className='bg-muted h-32 w-full animate-pulse rounded' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>뷰 로고 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {views.map((view) => {
            const currentIcon = viewIconMap.get(view.id) || view.icon;
            const IconComponent = currentIcon
              ? (Icons[currentIcon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
              : null;

            return (
              <div
                key={view.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    {IconComponent && <IconComponent className='size-4' />}
                  </div>
                  <div>
                    <p className='font-medium'>{view.label}</p>
                    <p className='text-muted-foreground text-sm'>{view.id}</p>
                  </div>
                </div>

                <IconPicker
                  value={currentIcon}
                  onChange={(icon) => {
                    mutation.mutate({ viewId: view.id, icon });
                  }}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
