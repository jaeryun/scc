'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GridItemProps {
  x: number
  y: number
  w: number
  h: number
  children: ReactNode
  className?: string
  isEditing?: boolean
}

export function GridItem({
  x,
  y,
  w,
  h,
  children,
  className,
  isEditing = false,
}: GridItemProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm',
        isEditing && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      style={{
        gridColumn: `${x + 1} / span ${w}`,
        gridRow: `${y + 1} / span ${h}`,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
