import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SE Command Center',
  description: '사내 인프라팀 관리 대시보드'
};

export default function RootPage() {
  redirect('/home');
}
