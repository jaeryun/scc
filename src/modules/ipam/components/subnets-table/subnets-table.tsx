'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubnets } from '../../hooks/use-subnets';
import { CellAction } from './cell-action';
import { Subnet } from '../../types';

type SubnetWithCount = Subnet & { _count?: { ipAddresses: number } };

export function SubnetsTable() {
  const { data: subnets, isLoading } = useSubnets();
  const subnetList = (subnets as SubnetWithCount[]) ?? [];

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!subnetList.length) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed'>
        <p className='text-muted-foreground font-medium'>등록된 서브넷이 없습니다</p>
        <p className='text-muted-foreground text-sm mt-1'>
          우측 상단의 추가 버튼을 클릭하세요.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>서브넷</TableHead>
            <TableHead>용도</TableHead>
            <TableHead>센터</TableHead>
            <TableHead>VLAN</TableHead>
            <TableHead className='text-right'>전체 IP</TableHead>
            <TableHead>사용률</TableHead>
            <TableHead className='w-[50px]'>
              <span className='sr-only'>작업</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subnetList.map((subnet) => {
            const count = subnet._count?.ipAddresses ?? 0;
            const max = subnet.network.includes('/24')
              ? 256
              : subnet.network.includes('/23')
                ? 512
                : count || 1;
            const pct = Math.min(100, (count / max) * 100);
            const barColor = pct > 75 ? 'bg-amber-500' : pct > 50 ? 'bg-chart-2' : 'bg-chart-1';
            return (
              <TableRow key={subnet.id}>
                <TableCell>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{subnet.network}</span>
                    {subnet.description && (
                      <span className='text-muted-foreground text-xs'>{subnet.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {subnet.purpose ? (
                    <Badge variant='outline'>{subnet.purpose}</Badge>
                  ) : (
                    <span className='text-muted-foreground'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  {subnet.centers?.length ? (
                    <div className='flex flex-wrap gap-1'>
                      {subnet.centers.map((c) => (
                        <Badge key={c} variant='secondary' className='text-xs'>
                          {c}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>-</span>
                  )}
                </TableCell>
                <TableCell>{subnet.vlanId || '-'}</TableCell>
                <TableCell className='text-right tabular-nums'>{count}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className='bg-muted h-2 w-16 overflow-hidden rounded'>
                      <div className={`h-full rounded ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className='text-muted-foreground text-xs tabular-nums'>{pct.toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <CellAction data={subnet} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
