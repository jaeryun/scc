'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GridCanvasProps {
  columns?: number
  rowHeight?: number
  gap?: number
  children: ReactNode
  className?: string
}

export function GridCanvas({
  columns = 12,
  rowHeight = 80,
  gap = 8,
  children,
  className,
}: GridCanvasProps) {
  return (
    <div
      className={cn('relative w-full', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: `${rowHeight}px`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  )
}
