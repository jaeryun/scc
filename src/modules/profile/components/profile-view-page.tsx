import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Profile'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Profile' pageDescription='User profile page'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>Profile</h2>
        <p className='text-muted-foreground mt-2'>Authentication is currently disabled.</p>
      </div>
    </PageContainer>
  );
}
