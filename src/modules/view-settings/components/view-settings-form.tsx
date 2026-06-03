'use client';

import React from 'react';
import { useViewSettings } from '@/modules/view-settings/hooks/use-view-settings';
import { useMutation } from '@tanstack/react-query';
import { updateViewSettingMutation as updateViewMut } from '../api/mutations';
import { views } from '@/config/views';
import { Icons } from '@/components/icons';
import IconPicker from './icon-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViewSettingsForm() {
  const { data: viewSettings, isLoading } = useViewSettings();
  const updateMutation = useMutation({ ...updateViewMut });

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
              ? (Icons[currentIcon as keyof typeof Icons] as React.ComponentType<{
                  className?: string;
                }>)
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
                    updateMutation.mutate({ viewId: view.id, icon });
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
