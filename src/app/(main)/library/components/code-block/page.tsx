import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { CodeEditor } from './code-editor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '코드 블록',
  description: '코드 하이라이팅 뷰어 + CodeMirror 에디터'
};

const CODE_BLOCK_DEMO = `import PageContainer from '@/components/layout/page-container';
import { CodeBlock } from '@/components/ui/code-block';

export default function MyPage() {
  return (
    <PageContainer pageTitle='API Reference'>
      <div className='space-y-6'>
        <h2>사용 예제</h2>
        <CodeBlock
          language='typescript'
          code={\`import { apiClient } from '@/lib/api-client';

const data = await apiClient.get('/api/users');
console.log(data);\`}
        />
      </div>
    </PageContainer>
  );
}`;

export default function CodeBlockPage() {
  return (
    <PageContainer
      pageTitle='코드 블록'
      pageDescription='코드 하이라이팅 뷰어(CodeBlock) + CodeMirror 기반 코드 에디터'
    >
      <div className='space-y-8'>
        <Card>
          <CardHeader>
            <CardTitle>CodeBlock — 서버사이드 하이라이팅 뷰어</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4 text-sm text-muted-foreground'>
              shiki(github-dark-default 테마) 기반의 서버 컴포넌트입니다. IDE 스타일의 macOS 창
              컨트롤과 함께 제공됩니다.
            </p>
            <CodeBlock code={CODE_BLOCK_DEMO} language='tsx' />
          </CardContent>
        </Card>

        <CodeEditor />
      </div>
    </PageContainer>
  );
}
