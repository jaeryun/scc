import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Product View'
};

export default function Page() {
  return (
    <PageContainer pageTitle="상품 상세" pageDescription="상품 상세 정보 UI 데모">
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="text-xl font-semibold">상품 상세 데모</h2>
        <p className="text-muted-foreground mt-2">
          이 페이지는 UI 패턴 참고용 데모입니다.
        </p>
      </div>
    </PageContainer>
  );
}
