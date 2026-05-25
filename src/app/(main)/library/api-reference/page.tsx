import type { Metadata } from 'next';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { getAllSpecs } from '@/modules/api-reference/api/registry';

export const metadata: Metadata = {
  title: 'API Reference',
  description: '외부 시스템 통합을 위한 OpenAPI 스펙 문서 모음입니다.'
};

export default function ApiReferenceIndexPage() {
  const specs = getAllSpecs();

  return (
    <PageContainer
      pageTitle='API Reference'
      pageDescription='외부 시스템 통합을 위한 OpenAPI 스펙 문서 모음입니다.'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {specs.map((spec) => {
          const Icon = Icons[spec.icon as keyof typeof Icons] || Icons.api;
          return (
            <Link href={`/api-reference/${spec.id}`} key={spec.id} className='block group'>
              <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                      <Icon className='h-5 w-5' />
                    </div>
                    {spec.title}
                  </CardTitle>
                  <CardDescription>{spec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    <Badge variant='outline'>{spec.version}</Badge>
                    <Badge variant={spec.status === 'stable' ? 'default' : 'secondary'}>
                      {spec.status}
                    </Badge>
                    {spec.tags.map((tag) => (
                      <Badge key={tag} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
