import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Teams'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Teams' pageDescription='Manage your teams'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>Teams</h2>
        <p className='text-muted-foreground mt-2'>Organization features are currently disabled.</p>
      </div>
    </PageContainer>
  );
}
