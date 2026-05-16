import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Exclusive'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Exclusive' pageDescription='Pro plan exclusive features'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>Exclusive</h2>
        <p className='text-muted-foreground mt-2'>Pro plan features are currently disabled.</p>
      </div>
    </PageContainer>
  );
}
