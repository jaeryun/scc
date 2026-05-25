export default function BillingSkeleton() {
  return (
    <div className='space-y-6' aria-hidden='true'>
      <div className='bg-card flex flex-col gap-6 rounded-xl border py-6 shadow-sm'>
        <div className='px-6'>
          <div className='bg-muted h-5 w-28 animate-pulse rounded' />
        </div>
        <div className='space-y-3 px-6'>
          <div className='bg-muted h-6 w-40 animate-pulse rounded' />
          <div className='bg-muted h-4 w-48 animate-pulse rounded' />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='bg-muted h-6 w-20 animate-pulse rounded' />
        <div className='grid gap-4 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='bg-card flex flex-col gap-6 rounded-xl border py-6 shadow-sm'>
              <div className='space-y-3 px-6'>
                <div className='bg-muted h-5 w-20 animate-pulse rounded' />
                <div className='bg-muted h-8 w-24 animate-pulse rounded' />
                <div className='space-y-2'>
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className='bg-muted h-3 w-full animate-pulse rounded' />
                  ))}
                </div>
                <div className='bg-muted h-9 w-full animate-pulse rounded' />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-card flex flex-col gap-6 rounded-xl border py-6 shadow-sm'>
        <div className='px-6'>
          <div className='bg-muted h-5 w-24 animate-pulse rounded' />
        </div>
        <div className='space-y-3 px-6'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='bg-muted h-4 w-32 animate-pulse rounded' />
              <div className='bg-muted h-4 w-20 animate-pulse rounded' />
              <div className='bg-muted h-4 w-16 animate-pulse rounded' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
