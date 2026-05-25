import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ApiReferenceNotFound() {
  return (
    <div className='flex flex-col items-center justify-center p-12'>
      <h2 className='text-xl font-semibold mb-2'>API Reference를 찾을 수 없습니다</h2>
      <p className='text-muted-foreground mb-4 text-sm'>
        요청하신 API 레퍼런스가 존재하지 않거나 이동되었습니다.
      </p>
      <Button asChild>
        <Link href='/library/api-reference'>전체 목록 보기</Link>
      </Button>
    </div>
  );
}
