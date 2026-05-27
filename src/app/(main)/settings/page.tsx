import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '설정',
  description: '애플리케이션 설정을 관리합니다.'
};

export default function SettingsIndexPage() {
  redirect('/settings/views');
}
