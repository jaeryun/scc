import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function WorkspaceSkeleton() {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='mb-1 h-5 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-6'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-4 w-28' />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className='h-8 w-24' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
