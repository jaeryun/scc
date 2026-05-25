import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: React Query'
};

export default function Page() {
  return (
    <PageContainer pageTitle='React Query' pageDescription='데이터 페칭 패턴 데모'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>React Query 데모</h2>
        <p className='text-muted-foreground mt-2'>이 페이지는 UI 패턴 참고용 데모입니다.</p>
      </div>
    </PageContainer>
  );
}
