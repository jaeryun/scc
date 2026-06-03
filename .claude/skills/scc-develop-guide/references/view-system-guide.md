# View System Guide

## Architecture

Views are the top-level navigation units switched via the header dropdown.

## Adding a New View

1. Add entry to `src/config/views.ts` `views` array:

```typescript
{
  id: 'my-view',          // Must match route group directory name
  label: 'My View',       // Display name in dropdown
  icon: 'server',         // Icon key from @/components/icons
  navItems: [
    { title: 'Page 1', href: '/my-view/page-1', icon: 'info' },
    { title: 'Page 2', href: '/my-view/page-2', icon: 'code' },
  ]
}
```

2. Create route group: `src/app/(main)/my-view/`

3. Each page follows the standard pattern:

```tsx
import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My View - Page 1',
  description: 'Description of this page'
};

export default function Page1() {
  return (
    <PageContainer pageTitle='Page 1' pageDescription='Description'>
      {/* page content */}
    </PageContainer>
  );
}
```

4. Required files for new route groups:
   - `error.tsx` — error boundary (`'use client'`)
   - `loading.tsx` — loading skeleton

## Current Views

| View ID | Label | Type | Description |
|---------|-------|------|-------------|
| `home` | Home | Info | SCC 소개 |
| `dcim` | DCIM | Product | Devices, IPAM |
| `demo` | 데모 | Demo | 컴포넌트 및 모듈 쇼케이스 |
| `settings` | 설정 | Product | 뷰, 일반, 외형, 알림 설정 |
| `api-reference` | API Reference | Info | API 문서 |

## Route Groups

Route groups `(main)` are transparent to URLs — they only scope layouts.

```
src/app/(main)/           → layout.tsx (sidebar, header, kbar)
  ├── demo/               → /demo/*
  ├── dcim/               → /dcim/*
  ├── home/               → /home
  └── settings/           → /settings/*
```
