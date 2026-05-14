import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Users'
};

export default function Page() {
  return (
    <PageContainer pageTitle="사용자 목록" pageDescription="사용자 관리 UI 데모">
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="text-xl font-semibold">사용자 목록 데모</h2>
        <p className="text-muted-foreground mt-2">
          이 페이지는 UI 패턴 참고용 데모입니다.
        </p>
      </div>
    </PageContainer>
  );
}
