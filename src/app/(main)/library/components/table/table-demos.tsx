'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type ServerStatus = '정상' | '경고' | '장애';

interface Server {
  hostname: string;
  ip: string;
  cpu: string;
  memory: string;
  status: ServerStatus;
}

const servers: Server[] = [
  {
    hostname: 'web-prod-01',
    ip: '10.0.1.11',
    cpu: 'Intel Xeon E5-2680',
    memory: '64GB',
    status: '정상'
  },
  {
    hostname: 'web-prod-02',
    ip: '10.0.1.12',
    cpu: 'Intel Xeon E5-2680',
    memory: '64GB',
    status: '정상'
  },
  {
    hostname: 'api-prod-01',
    ip: '10.0.2.21',
    cpu: 'AMD EPYC 7543',
    memory: '128GB',
    status: '경고'
  },
  {
    hostname: 'db-prod-01',
    ip: '10.0.3.31',
    cpu: 'Intel Xeon Gold 6348',
    memory: '256GB',
    status: '정상'
  },
  {
    hostname: 'cache-prod-01',
    ip: '10.0.4.41',
    cpu: 'Intel Xeon E5-2660',
    memory: '32GB',
    status: '장애'
  }
];

type SortKey = keyof Server;
type SortDir = 'asc' | 'desc';

function compareServer(a: Server, b: Server, key: SortKey): number {
  const aVal = a[key];
  const bVal = b[key];
  if (aVal < bVal) return -1;
  if (aVal > bVal) return 1;
  return 0;
}

function statusVariant(status: ServerStatus) {
  switch (status) {
    case '정상':
      return 'outline' as const;
    case '경고':
      return 'destructive' as const;
    case '장애':
      return 'destructive' as const;
  }
}

function getStatusBadgeStyle(status: ServerStatus) {
  if (status === '경고') return 'outline';
  return undefined;
}

function SortArrow({
  column,
  sortKey,
  sortDir
}: {
  column: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
}) {
  if (sortKey !== column) return null;
  return sortDir === 'asc' ? (
    <Icons.arrowUp className='ml-1 inline h-3 w-3' />
  ) : (
    <Icons.arrowDown className='ml-1 inline h-3 w-3' />
  );
}

function BasicTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 테이블</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>인프라 서버 목록</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>호스트명</TableHead>
              <TableHead>IP 주소</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>메모리</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((s) => (
              <TableRow key={s.hostname}>
                <TableCell className='font-medium'>{s.hostname}</TableCell>
                <TableCell className='font-mono text-xs'>{s.ip}</TableCell>
                <TableCell>{s.cpu}</TableCell>
                <TableCell>{s.memory}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(s.status)}
                    className={
                      s.status === '경고'
                        ? 'border-destructive text-destructive bg-destructive/10'
                        : undefined
                    }
                  >
                    {s.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SortableTable() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...servers].sort((a, b) => {
    if (!sortKey) return 0;
    const result = compareServer(a, b, sortKey);
    return sortDir === 'asc' ? result : -result;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>정렬 가능 테이블</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>인프라 서버 목록</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className={sortKey === 'hostname' ? 'text-primary' : ''}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto p-0 font-medium'
                  onClick={() => handleSort('hostname')}
                >
                  호스트명
                  <SortArrow column='hostname' sortKey={sortKey} sortDir={sortDir} />
                </Button>
              </TableHead>
              <TableHead className={sortKey === 'ip' ? 'text-primary' : ''}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto p-0 font-medium'
                  onClick={() => handleSort('ip')}
                >
                  IP 주소
                  <SortArrow column='ip' sortKey={sortKey} sortDir={sortDir} />
                </Button>
              </TableHead>
              <TableHead className={sortKey === 'cpu' ? 'text-primary' : ''}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto p-0 font-medium'
                  onClick={() => handleSort('cpu')}
                >
                  CPU
                  <SortArrow column='cpu' sortKey={sortKey} sortDir={sortDir} />
                </Button>
              </TableHead>
              <TableHead className={sortKey === 'memory' ? 'text-primary' : ''}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto p-0 font-medium'
                  onClick={() => handleSort('memory')}
                >
                  메모리
                  <SortArrow column='memory' sortKey={sortKey} sortDir={sortDir} />
                </Button>
              </TableHead>
              <TableHead className={sortKey === 'status' ? 'text-primary' : ''}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-auto p-0 font-medium'
                  onClick={() => handleSort('status')}
                >
                  상태
                  <SortArrow column='status' sortKey={sortKey} sortDir={sortDir} />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <TableRow key={s.hostname}>
                <TableCell className='font-medium'>{s.hostname}</TableCell>
                <TableCell className='font-mono text-xs'>{s.ip}</TableCell>
                <TableCell>{s.cpu}</TableCell>
                <TableCell>{s.memory}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(s.status)}
                    className={
                      s.status === '경고'
                        ? 'border-destructive text-destructive bg-destructive/10'
                        : undefined
                    }
                  >
                    {s.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SelectableTable() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(hostname: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(hostname)) {
        next.delete(hostname);
      } else {
        next.add(hostname);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === servers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(servers.map((s) => s.hostname)));
    }
  }

  const allSelected = selected.size === servers.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>선택 가능 테이블</CardTitle>
      </CardHeader>
      <CardContent>
        {selected.size > 0 && (
          <p className='mb-3 text-sm text-muted-foreground'>{selected.size}개 선택됨</p>
        )}
        <Table>
          <TableCaption>인프라 서버 목록</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>호스트명</TableHead>
              <TableHead>IP 주소</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>메모리</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((s) => {
              const isSelected = selected.has(s.hostname);
              return (
                <TableRow key={s.hostname} className={isSelected ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggle(s.hostname)} />
                  </TableCell>
                  <TableCell className='font-medium'>{s.hostname}</TableCell>
                  <TableCell className='font-mono text-xs'>{s.ip}</TableCell>
                  <TableCell>{s.cpu}</TableCell>
                  <TableCell>{s.memory}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant(s.status)}
                      className={
                        s.status === '경고'
                          ? 'border-destructive text-destructive bg-destructive/10'
                          : undefined
                      }
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function TableDemos() {
  return (
    <div className='flex flex-col gap-8'>
      <BasicTable />
      <SortableTable />
      <SelectableTable />
    </div>
  );
}
