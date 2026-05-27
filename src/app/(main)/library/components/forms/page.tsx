import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라이브러리 - 폼',
  description: '폼 컴포넌트 및 패턴'
};

export default function Page() {
  redirect('/library/components/forms/basic');
}
