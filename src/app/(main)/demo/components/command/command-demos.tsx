'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';
import { Icons } from '@/components/icons';

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Command Palette 열기
        <Kbd className='ml-2'>⌘K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title='커맨드 팔레트'
        description='명령어를 검색하고 실행하세요.'
      >
        <CommandInput placeholder='명령어 검색...' />
        <CommandList>
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
          <CommandGroup heading='서버'>
            <CommandItem>
              <Icons.server />
              <span>서버 목록</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>S</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.server2 />
              <span>서버 추가</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>N</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.serverBolt />
              <span>서버 상태</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>⇧</Kbd>
                <Kbd>S</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.serverCog />
              <span>서버 설정</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='네트워크'>
            <CommandItem>
              <Icons.network />
              <span>네트워크 토폴로지</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>T</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.router />
              <span>라우터 관리</span>
            </CommandItem>
            <CommandItem>
              <Icons.switch />
              <span>스위치 관리</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>W</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.firewall />
              <span>방화벽 규칙</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='설정'>
            <CommandItem>
              <Icons.settings />
              <span>일반 설정</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>,</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.palette />
              <span>테마 변경</span>
            </CommandItem>
            <CommandItem>
              <Icons.user />
              <span>프로필</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>P</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.dashboard />
              <span>대시보드</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>D</Kbd>
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='최근'>
            <CommandItem>
              <Icons.clock />
              <span>서브넷 관리</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>1</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.clock />
              <span>IP 할당 내역</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>2</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Icons.clock />
              <span>사용자 관리</span>
              <CommandShortcut>
                <Kbd>⌘</Kbd>
                <Kbd>3</Kbd>
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function InlineCommandDemo() {
  return (
    <Command className='rounded-lg border shadow-md'>
      <CommandInput placeholder='작업 검색...' />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading='최근 검색'>
          <CommandItem>
            <Icons.clock />
            <span>서브넷 10.0.0.0/24</span>
            <CommandShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>1</Kbd>
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.clock />
            <span>방화벽 정책 업데이트</span>
          </CommandItem>
          <CommandItem>
            <Icons.clock />
            <span>사용자 권한 변경</span>
            <CommandShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>2</Kbd>
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='추천 작업'>
          <CommandItem>
            <Icons.search />
            <span>서버 검색</span>
          </CommandItem>
          <CommandItem>
            <Icons.database />
            <span>데이터베이스 백업</span>
            <CommandShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>B</Kbd>
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.fileText />
            <span>보고서 생성</span>
            <CommandShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>R</Kbd>
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function CommandDemos() {
  return (
    <div className='flex flex-col gap-8'>
      <Card>
        <CardHeader>
          <CardTitle>Command Palette</CardTitle>
          <CardDescription>
            Cmd+K 스타일의 명령어 팔레트입니다. CommandDialog를 사용하여 모달 형태로 제공됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommandPaletteDemo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inline Command</CardTitle>
          <CardDescription>
            다이얼로그 없이 인라인으로 표시되는 Command 컴포넌트입니다. 검색/자동완성 UI로 사용할 수
            있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InlineCommandDemo />
        </CardContent>
      </Card>
    </div>
  );
}
