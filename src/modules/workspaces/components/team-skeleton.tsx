import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export function TeamSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-4 w-48' />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className='h-4 w-10' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-16' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-10' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-4 w-10' />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-40' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-8 w-20' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
