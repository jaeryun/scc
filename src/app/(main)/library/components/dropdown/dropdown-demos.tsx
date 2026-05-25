'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut
} from '@/components/ui/context-menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut
} from '@/components/ui/menubar';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

export function DropdownDemos() {
  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>DropdownMenu</CardTitle>
          <CardDescription>
            Radix 기반의 드롭다운 메뉴입니다. 다양한 아이템 타입과 서브메뉴를 지원합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <BasicDropdown />
          <CheckboxDropdown />
          <RadioDropdown />
          <SubmenuDropdown />
          <ShortcutDropdown />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ContextMenu</CardTitle>
          <CardDescription>
            마우스 우클릭 시 표시되는 컨텍스트 메뉴입니다. 영역을 우클릭하여 메뉴를 열 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContextMenuDemo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menubar</CardTitle>
          <CardDescription>
            애플리케이션 상단에 배치되는 전통적인 메뉴바입니다. 파일, 편집, 보기 등 표준 메뉴 구조를
            제공합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenubarDemo />
        </CardContent>
      </Card>
    </div>
  );
}

function BasicDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>기본 드롭다운</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-48'>
        <DropdownMenuLabel>서버 작업</DropdownMenuLabel>
        <DropdownMenuItem>
          <Icons.add className='mr-2 h-4 w-4 shrink-0' />
          서버 추가
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.edit className='mr-2 h-4 w-4 shrink-0' />
          편집
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.trash className='mr-2 h-4 w-4 shrink-0' />
          삭제
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.settings className='mr-2 h-4 w-4 shrink-0' />
          설정
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CheckboxDropdown() {
  const [statusFilter, setStatusFilter] = useState<string[]>(['전체']);

  const handleCheckedChange = (value: string) => {
    if (value === '전체') {
      setStatusFilter(['전체']);
    } else {
      const next = statusFilter.filter((s) => s !== '전체');
      if (next.includes(value)) {
        const removed = next.filter((s) => s !== value);
        setStatusFilter(removed.length === 0 ? ['전체'] : removed);
      } else {
        setStatusFilter([...next, value]);
      }
    }
  };

  const statusItems = ['전체', '정상', '경고', '장애'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>상태 필터</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40'>
        <DropdownMenuLabel>상태 필터</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusItems.map((item) => (
          <DropdownMenuCheckboxItem
            key={item}
            checked={statusFilter.includes(item)}
            onCheckedChange={() => handleCheckedChange(item)}
          >
            {item}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RadioDropdown() {
  const [sortBy, setSortBy] = useState('호스트명');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>정렬: {sortBy}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40'>
        <DropdownMenuLabel>정렬 방식</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          <DropdownMenuRadioItem value='호스트명'>호스트명</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='IP'>IP</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='상태'>상태</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SubmenuDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>작업 메뉴</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40'>
        <DropdownMenuLabel>작업</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icons.server className='mr-2 h-4 w-4 shrink-0' />
            서버
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className='w-40'>
            <DropdownMenuItem>서버 추가</DropdownMenuItem>
            <DropdownMenuItem>서버 검색</DropdownMenuItem>
            <DropdownMenuItem>상태 확인</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icons.network className='mr-2 h-4 w-4 shrink-0' />
            네트워크
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className='w-44'>
            <DropdownMenuItem>IP 할당</DropdownMenuItem>
            <DropdownMenuItem>서브넷 관리</DropdownMenuItem>
            <DropdownMenuItem>트래픽 모니터링</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ShortcutDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>단축키 메뉴</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-52'>
        <DropdownMenuLabel>작업</DropdownMenuLabel>
        <DropdownMenuItem>
          <Icons.add className='mr-2 h-4 w-4 shrink-0' />새 작업
          <DropdownMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>N</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.edit className='mr-2 h-4 w-4 shrink-0' />
          편집
          <DropdownMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>E</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.clipboardCopy className='mr-2 h-4 w-4 shrink-0' />
          복제
          <DropdownMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>D</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.trash className='mr-2 h-4 w-4 shrink-0' />
          삭제
          <DropdownMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>⌫</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.settings className='mr-2 h-4 w-4 shrink-0' />
          설정
          <DropdownMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>,</Kbd>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card className='flex h-48 cursor-default items-center justify-center border-2 border-dashed border-muted-foreground/25 bg-muted/50 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/80'>
          <div className='flex flex-col items-center gap-2'>
            <Icons.ellipsis className='h-8 w-8' />
            <p className='text-sm'>우클릭하여 메뉴 열기</p>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className='w-48'>
        <ContextMenuItem onClick={() => toast.info('서버 상세 정보를 확인합니다.')}>
          상세 보기
          <ContextMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>I</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toast.info('서버 정보를 편집합니다.')}>
          편집
          <ContextMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>E</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => toast.success('서버가 복제되었습니다.')}>
          복제
          <ContextMenuShortcut>
            <Kbd>⌘</Kbd>
            <Kbd>D</Kbd>
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => toast.error('서버가 삭제되었습니다.')}
        >
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MenubarDemo() {
  return (
    <Menubar className='w-fit'>
      <MenubarMenu>
        <MenubarTrigger>파일</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            새 작업
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>N</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            열기
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>O</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            저장
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>종료</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>편집</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            실행 취소
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>Z</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            다시 실행
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>Z</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            잘라내기
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>X</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            복사
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>C</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            붙여넣기
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>V</Kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>보기</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            전체 화면
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>F</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            확대
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>+</Kbd>
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            축소
            <MenubarShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>-</Kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>도움말</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>문서 보기</MenubarItem>
          <MenubarItem>단축키 목록</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>SCC 정보</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
