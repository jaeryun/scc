'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

export function DialogDemos() {
  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>Radix 기반의 기본 모달 대화상자입니다.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <BasicDialog />
          <FormDialog />
          <ScrollableDialog />
          <WideDialog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AlertDialog</CardTitle>
          <CardDescription>
            삭제 확인, 되돌릴 수 없는 작업 등에 사용하는 경고 대화상자입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <DeleteConfirmDialog />
          <BulkActionDialog />
          <LogoutConfirmDialog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sheet (측면 패널)</CardTitle>
          <CardDescription>
            화면 측면에서 슬라이드되는 패널입니다. 네비게이션, 필터, 상세 정보 등에 사용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <RightSheet />
          <LeftSheet />
          <DetailsSheet />
        </CardContent>
      </Card>
    </div>
  );
}

function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>기본 Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
          <DialogDescription>
            프로필 정보를 수정합니다. 완료 후 저장 버튼을 클릭하세요.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>이름</Label>
            <Input id='name' defaultValue='홍길동' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email'>이메일</Label>
            <Input id='email' defaultValue='hong@example.com' />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>취소</Button>
          </DialogClose>
          <Button onClick={() => toast.success('프로필이 저장되었습니다.')}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>새 항목 추가</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 작업 추가</DialogTitle>
          <DialogDescription>
            새로운 작업을 등록합니다. 필수 항목을 모두 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label htmlFor='task-name'>
              작업명 <span className='text-destructive'>*</span>
            </Label>
            <Input id='task-name' placeholder='작업 이름을 입력하세요' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='task-desc'>설명</Label>
            <Textarea id='task-desc' placeholder='작업에 대한 설명' />
          </div>
          <div className='grid gap-2'>
            <Label>우선순위</Label>
            <div className='flex gap-2'>
              <Badge variant='outline' className='cursor-pointer hover:bg-primary/10'>
                낮음
              </Badge>
              <Badge variant='outline' className='cursor-pointer hover:bg-primary/10'>
                중간
              </Badge>
              <Badge variant='outline' className='cursor-pointer hover:bg-primary/10'>
                높음
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>취소</Button>
          </DialogClose>
          <Button
            onClick={() => {
              toast.success('작업이 추가되었습니다.');
              setOpen(false);
            }}
          >
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScrollableDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>스크롤 가능</Button>
      </DialogTrigger>
      <DialogContent className='flex max-h-[85vh] flex-col'>
        <DialogHeader className='shrink-0'>
          <DialogTitle>이용약관</DialogTitle>
          <DialogDescription>서비스 이용을 위해 아래 약관에 동의해주세요.</DialogDescription>
        </DialogHeader>
        <div className='-mx-6 flex-1 overflow-y-auto border-y px-6 py-4 text-sm text-muted-foreground'>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className='mb-5'>
              <h4 className='mb-2 font-semibold text-foreground'>제 {i + 1}조 (목적 및 정의)</h4>
              <p className='mb-2'>
                본 약관은 SE Command Center(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 회원과
                회사 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
              </p>
              <p className='mb-2'>
                이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있으며, 약관에 명시되지 않은
                사항에 대해서는 전기통신사업법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등
                관련 법령을 따릅니다.
              </p>
              <p>
                회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해
                사전 고지합니다. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수
                있습니다.
              </p>
            </div>
          ))}
        </div>
        <DialogFooter className='shrink-0 pt-4'>
          <DialogClose asChild>
            <Button variant='outline'>취소</Button>
          </DialogClose>
          <Button onClick={() => toast.success('약관에 동의하였습니다.')}>동의</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>넓은 Dialog</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>서버 상세 정보</DialogTitle>
          <DialogDescription>선택한 서버의 상세 스펙과 상태 정보입니다.</DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='rounded-lg border p-4'>
            <p className='text-xs text-muted-foreground'>호스트명</p>
            <p className='font-semibold'>web-prod-01</p>
          </div>
          <div className='rounded-lg border p-4'>
            <p className='text-xs text-muted-foreground'>IP 주소</p>
            <p className='font-mono font-semibold'>10.0.1.24</p>
          </div>
          <div className='rounded-lg border p-4'>
            <p className='text-xs text-muted-foreground'>CPU</p>
            <p className='font-semibold'>Intel Xeon 8-core</p>
          </div>
          <div className='rounded-lg border p-4'>
            <p className='text-xs text-muted-foreground'>메모리</p>
            <p className='font-semibold'>32 GB DDR4</p>
          </div>
          <div className='rounded-lg border p-4'>
            <p className='text-xs text-muted-foreground'>디스크</p>
            <p className='font-semibold'>512 GB NVMe SSD</p>
          </div>
          <div className='rounded-lg border p-4'>
            <p className='text-xs text-muted-foreground'>상태</p>
            <Badge variant='secondary' className='bg-emerald-500/10 text-emerald-400'>
              정상
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline'>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>삭제 확인</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;web-prod-01&quot; 서버 정보가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => toast.success('삭제되었습니다.')}>
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BulkActionDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline'>일괄 작업</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>일괄 재시작</AlertDialogTitle>
          <AlertDialogDescription>
            선택한 12개의 서버를 모두 재시작합니다. 진행 중인 서비스가 중단될 수 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='rounded-lg border p-3 text-sm text-muted-foreground'>
          <p className='font-medium text-foreground'>대상 서버 (12)</p>
          <p className='mt-1 font-mono text-xs'>web-01 ~ web-06, api-01 ~ api-04, db-01, db-02</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => toast.success('12개 서버가 재시작됩니다.')}>
            재시작
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LogoutConfirmDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline'>로그아웃 확인</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>로그아웃 하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            저장되지 않은 변경사항이 있을 수 있습니다. 계속 진행하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>머무르기</AlertDialogCancel>
          <AlertDialogAction onClick={() => toast.info('로그아웃 되었습니다.')}>
            로그아웃
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RightSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>우측 Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>필터</SheetTitle>
          <SheetDescription>원하는 조건으로 목록을 필터링하세요.</SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>상태</Label>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary'>전체</Badge>
              <Badge variant='outline'>정상</Badge>
              <Badge variant='outline'>경고</Badge>
              <Badge variant='outline'>장애</Badge>
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>데이터센터</Label>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary'>전체</Badge>
              <Badge variant='outline'>강남</Badge>
              <Badge variant='outline'>판교</Badge>
            </div>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='search-filter'>검색</Label>
            <Input id='search-filter' placeholder='호스트명 또는 IP 검색' />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>초기화</Button>
          </SheetClose>
          <Button onClick={() => toast.success('필터가 적용되었습니다.')}>적용</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function LeftSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>좌측 Sheet</Button>
      </SheetTrigger>
      <SheetContent side='left'>
        <SheetHeader>
          <SheetTitle>네비게이션</SheetTitle>
          <SheetDescription>빠른 메뉴 이동</SheetDescription>
        </SheetHeader>
        <div className='grid gap-2 py-4'>
          {['대시보드', '서버 목록', '네트워크', '설정', '로그'].map((item) => (
            <Button key={item} variant='ghost' className='justify-start'>
              {item}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>상세 정보</Button>
      </SheetTrigger>
      <SheetContent className='sm:max-w-xl'>
        <SheetHeader>
          <SheetTitle>서버 상세</SheetTitle>
          <SheetDescription>web-prod-01 서버의 상세 정보입니다.</SheetDescription>
        </SheetHeader>
        <div className='grid gap-6 py-4'>
          <div>
            <h4 className='mb-3 text-sm font-semibold'>기본 정보</h4>
            <div className='grid grid-cols-2 gap-3'>
              <InfoBlock label='호스트명' value='web-prod-01' />
              <InfoBlock label='IP' value='10.0.1.24' />
              <InfoBlock label='OS' value='Ubuntu 24.04' />
              <InfoBlock label='상태' value='정상' />
            </div>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-semibold'>하드웨어</h4>
            <div className='grid grid-cols-2 gap-3'>
              <InfoBlock label='CPU' value='8 Core' />
              <InfoBlock label='메모리' value='32 GB' />
              <InfoBlock label='디스크' value='512 GB' />
              <InfoBlock label='네트워크' value='10 Gbps' />
            </div>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-semibold'>최근 이벤트</h4>
            <div className='space-y-2'>
              {[
                { time: '10:32', msg: '헬스체크 성공' },
                { time: '09:15', msg: '패키지 업데이트 완료' },
                { time: '08:00', msg: '서버 재시작' }
              ].map((e, i) => (
                <div key={i} className='flex items-center gap-3 rounded-lg border p-2 text-sm'>
                  <span className='font-mono text-xs text-muted-foreground'>{e.time}</span>
                  <span>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border p-3'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='font-semibold text-sm'>{value}</p>
    </div>
  );
}
