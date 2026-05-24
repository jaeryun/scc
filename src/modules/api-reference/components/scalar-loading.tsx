export function ScalarLoadingSkeleton() {
  return (
    <div className='flex w-full min-h-[600px] gap-4 p-4' aria-hidden='true'>
      <div className='hidden w-64 flex-col gap-3 lg:flex'>
        <div className='bg-muted h-6 w-full animate-pulse rounded' />
        <div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
        <div className='bg-muted h-4 w-5/6 animate-pulse rounded' />
        <div className='bg-muted h-4 w-2/3 animate-pulse rounded' />
      </div>
      <div className='flex flex-1 flex-col gap-4'>
        <div className='bg-muted h-8 w-48 animate-pulse rounded' />
        <div className='bg-muted h-4 w-full animate-pulse rounded' />
        <div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
        <div className='bg-muted h-32 w-full animate-pulse rounded' />
      </div>
    </div>
  );
}
