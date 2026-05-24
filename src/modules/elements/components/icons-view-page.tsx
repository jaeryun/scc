'use client';

import { useMemo, useState } from 'react';
import { Icons, ICON_CATEGORIES } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TABLER_ICONS_URL = 'https://tabler.io/icons';

const CATEGORIES = ['All', ...Object.keys(ICON_CATEGORIES)];

const keyToCategory: Record<string, string> = {};
for (const [cat, keys] of Object.entries(ICON_CATEGORIES)) {
  for (const key of keys) {
    keyToCategory[key] = cat;
  }
}

const TOTAL_COUNT = Object.keys(Icons).length;

export default function IconsViewPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const iconEntries = useMemo(() => {
    return Object.entries(Icons).filter(([name]) => {
      if (name === 'kakaobank') return false;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || keyToCategory[name] === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const visibleCount = iconEntries.length;

  return (
    <PageContainer
      pageTitle='아이콘'
      pageDescription='사전에 준비된 아이콘들을 사용하세요. Tabler 기반의 SVG 아이콘들이 준비되어 있습니다.'
      pageHeaderAction={
        <div className='flex items-center gap-3'>
          <Badge variant='secondary' className='text-xs'>
            {TOTAL_COUNT}개 아이콘
          </Badge>
          <Link
            href={TABLER_ICONS_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors'
            )}
          >
            <Icons.externalLink className='h-4 w-4' />
            <span className='hidden sm:inline'>Browse</span> Tabler
          </Link>
        </div>
      }
    >
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center gap-1.5'>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size='sm'
              onClick={() => setCategory(cat)}
              className='h-7 px-2.5 text-xs'
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='아이콘 검색...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-sm'
          />
          {visibleCount !== TOTAL_COUNT && (
            <span className='text-muted-foreground text-xs whitespace-nowrap'>
              {TOTAL_COUNT}개 중 {visibleCount}개
            </span>
          )}
        </div>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
          {iconEntries.map(([name, IconComponent]) => (
            <div
              key={name}
              className='hover:bg-accent flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors'
            >
              <IconComponent className='h-6 w-6' />
              <span className='text-muted-foreground text-xs break-all'>{name}</span>
            </div>
          ))}
        </div>
        {iconEntries.length === 0 && (
          <p className='text-muted-foreground py-8 text-center'>
            &quot;{search}&quot;에 해당하는 아이콘이 없습니다
          </p>
        )}
      </div>
    </PageContainer>
  );
}
