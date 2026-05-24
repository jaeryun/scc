import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSpecMeta } from '@/modules/api-reference/api/types';

interface QuickStartGuideProps {
  spec: ApiSpecMeta;
}

export default function QuickStartGuide({ spec }: QuickStartGuideProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='text-lg'>Quick Start</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <h3 className='text-sm font-semibold mb-1'>첫 API 호출</h3>
          <pre className='bg-muted p-3 rounded-md text-sm overflow-x-auto'>
            <code>
              {`curl ${spec.officialDocsUrl || 'https://semaphore.example.com/api'}/projects`}
            </code>
          </pre>
        </div>
        <p className='text-sm text-muted-foreground'>
          Phase 2에서 인증 가이드, 다중 언어 예제(TS/Python), 에러 코드 테이블이 추가됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
