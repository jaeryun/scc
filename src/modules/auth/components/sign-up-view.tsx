import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Auth : Sign Up'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Sign Up' pageDescription='Create a new account'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>Sign Up</h2>
        <p className='text-muted-foreground mt-2'>Authentication is currently disabled.</p>
      </div>
    </PageContainer>
  );
}
