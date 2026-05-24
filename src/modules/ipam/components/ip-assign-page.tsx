'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { getSubnets, assignIp, searchIpByHostname, releaseIp } from '../api/service';
import { subnetKeys, ipAddressKeys } from '../api/queries';
import { Subnet } from '../types';

type SubnetWithCount = Subnet & { _count?: { ipAddresses: number } };
type IpWithSubnet = {
  id: string;
  ip: string;
  hostname?: string | null;
  status: string;
  subnet?: Subnet;
  subnetId: string;
};

function IpAssignPage() {
  const queryClient = useQueryClient();

  const { data: subnets, isLoading: subnetsLoading } = useQuery({
    queryKey: subnetKeys.lists(),
    queryFn: () => getSubnets()
  });
  const subnetList = (subnets as SubnetWithCount[]) ?? [];

  const [selectedSubnet, setSelectedSubnet] = useState<string>('');
  const [assignHostname, setAssignHostname] = useState('');
  const [assignedIp, setAssignedIp] = useState<string | null>(null);

  const [searchHostname, setSearchHostname] = useState('');
  const [searchResults, setSearchResults] = useState<IpWithSubnet[]>([]);
  const [selectedIpId, setSelectedIpId] = useState<string | null>(null);

  const assignMutation = useMutation({
    mutationFn: (data: { subnetId: string; hostname?: string }) => assignIp(data),
    onSuccess: (data) => {
      toast.success(`IP 할당 완료: ${data.ip}`);
      setAssignedIp(data.ip);
      setAssignHostname('');
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
      queryClient.invalidateQueries({ queryKey: ipAddressKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'IP 할당 실패');
    }
  });

  const searchMutation = useMutation({
    mutationFn: (hostname: string) => searchIpByHostname({ hostname }),
    onSuccess: (data) => {
      setSearchResults(data as unknown as IpWithSubnet[]);
      setSelectedIpId(null);
    }
  });

  const releaseMutation = useMutation({
    mutationFn: (id: string) => releaseIp(id),
    onSuccess: () => {
      toast.success('IP 반납 완료');
      setSearchResults([]);
      setSelectedIpId(null);
      setSearchHostname('');
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
      queryClient.invalidateQueries({ queryKey: ipAddressKeys.all });
    },
    onError: () => toast.error('IP 반납 실패')
  });

  const handleAssign = () => {
    if (!selectedSubnet) {
      toast.error('서브넷을 선택해주세요');
      return;
    }
    assignMutation.mutate({
      subnetId: selectedSubnet,
      hostname: assignHostname || undefined
    });
  };

  const handleSearch = () => {
    if (!searchHostname.trim()) {
      toast.error('호스트네임을 입력해주세요');
      return;
    }
    searchMutation.mutate(searchHostname.trim());
  };

  const handleRelease = () => {
    if (!selectedIpId) {
      toast.error('반납할 IP를 선택해주세요');
      return;
    }
    releaseMutation.mutate(selectedIpId);
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardDescription>서브넷 선택 → 자동할당</CardDescription>
            <CardTitle>IP 할당</CardTitle>
          </CardHeader>
          <div className='px-6 pb-6 space-y-4'>
            <div>
              <Label>대상 서브넷</Label>
              <Select value={selectedSubnet} onValueChange={setSelectedSubnet}>
                <SelectTrigger className='mt-1.5'>
                  <SelectValue placeholder='서브넷 선택...' />
                </SelectTrigger>
                <SelectContent>
                  {subnetList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.network}
                      {s.purpose ? ` (${s.purpose})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>호스트네임</Label>
              <Input
                className='mt-1.5'
                placeholder='예: web-server-03'
                value={assignHostname}
                onChange={(e) => setAssignHostname(e.target.value)}
              />
            </div>

            {assignedIp && (
              <div className='bg-muted/50 flex items-center gap-2 rounded-lg p-3'>
                <Icons.server className='text-muted-foreground h-4 w-4' />
                <span className='text-sm text-muted-foreground'>할당된 IP:</span>
                <span className='font-mono font-semibold'>{assignedIp}</span>
              </div>
            )}

            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || !selectedSubnet}
              isLoading={assignMutation.isPending}
              className='w-full'
            >
              <Icons.add /> IP 할당하기
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>호스트네임 검색 → 선택 → 반납</CardDescription>
            <CardTitle>IP 반납</CardTitle>
          </CardHeader>
          <div className='px-6 pb-6 space-y-4'>
            <div>
              <Label>호스트네임으로 검색</Label>
              <div className='mt-1.5 flex gap-2'>
                <Input
                  placeholder='호스트네임 입력...'
                  value={searchHostname}
                  onChange={(e) => setSearchHostname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant='secondary'
                  onClick={handleSearch}
                  isLoading={searchMutation.isPending}
                >
                  <Icons.search className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className='space-y-2'>
                <p className='text-muted-foreground text-xs'>검색 결과: {searchResults.length}건</p>
                <div className='max-h-64 overflow-auto rounded-lg border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-8'></TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>호스트네임</TableHead>
                        <TableHead>서브넷</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((ip) => (
                        <TableRow
                          key={ip.id}
                          className='cursor-pointer'
                          onClick={() => setSelectedIpId(ip.id)}
                          data-state={selectedIpId === ip.id ? 'selected' : undefined}
                        >
                          <TableCell>
                            <input
                              type='radio'
                              name='release-ip'
                              checked={selectedIpId === ip.id}
                              onChange={() => setSelectedIpId(ip.id)}
                            />
                          </TableCell>
                          <TableCell className='font-mono'>{ip.ip}</TableCell>
                          <TableCell className='font-medium'>{ip.hostname || '-'}</TableCell>
                          <TableCell className='text-muted-foreground text-xs'>
                            {(ip as any).subnet?.network || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  variant='destructive'
                  onClick={handleRelease}
                  disabled={!selectedIpId || releaseMutation.isPending}
                  isLoading={releaseMutation.isPending}
                  className='w-full'
                >
                  <Icons.trash /> 선택 IP 반납
                </Button>
              </div>
            )}

            {searchMutation.isSuccess && searchResults.length === 0 && (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function IpAssignReturnPage() {
  return <IpAssignPage />;
}
