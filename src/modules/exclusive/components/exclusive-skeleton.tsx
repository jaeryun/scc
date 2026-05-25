import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ExclusiveSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-muted/30 animate-pulse rounded-xl border p-8'>
        <div className='bg-muted mx-auto mb-3 h-8 w-64 rounded' />
        <div className='bg-muted mx-auto h-4 w-96 rounded' />
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader>
              <div className='bg-muted mb-2 h-8 w-8 rounded' />
              <div className='bg-muted h-5 w-24 rounded' />
              <div className='bg-muted mt-2 h-4 w-full rounded' />
              <div className='bg-muted mt-1 h-4 w-3/4 rounded' />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className='animate-pulse'>
        <CardContent className='py-6'>
          <div className='bg-muted mb-3 h-5 w-32 rounded' />
          <div className='bg-muted h-2 w-full rounded' />
          <div className='bg-muted mt-3 h-3 w-48 rounded' />
        </CardContent>
      </Card>
    </div>
  );
}
