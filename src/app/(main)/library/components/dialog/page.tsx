import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { DialogDemos } from './dialog-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대화상자',
  description: 'Dialog, AlertDialog, Sheet 등 대화상자 UI 데모'
};

const DIALOG_CODE = `import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet, SheetContent, SheetDescription,
  SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';

// Dialog
<Dialog>
  <DialogTrigger asChild>
    <Button variant='outline'>열기</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
      <DialogDescription>설명 텍스트입니다.</DialogDescription>
    </DialogHeader>
    <div>콘텐츠</div>
    <DialogFooter>
      <Button type='submit'>확인</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// AlertDialog (삭제 확인 등)
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant='destructive'>삭제</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
      <AlertDialogDescription>
        이 작업은 되돌릴 수 없습니다.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>취소</AlertDialogCancel>
      <AlertDialogAction>삭제</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// Sheet (측면 패널)
<Sheet>
  <SheetTrigger asChild>
    <Button variant='outline'>열기</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>제목</SheetTitle>
      <SheetDescription>설명 텍스트입니다.</SheetDescription>
    </SheetHeader>
    <div>콘텐츠</div>
    <SheetFooter>
      <Button type='submit'>저장</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>`;

export default function DialogPage() {
  return (
    <PageContainer
      pageTitle='대화상자'
      pageDescription='Dialog, AlertDialog, Sheet 등 대화상자 UI 데모입니다.'
    >
      <DialogDemos />
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle>사용 코드</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={DIALOG_CODE} language='tsx' />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
