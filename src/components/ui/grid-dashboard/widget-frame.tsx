'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import type { ReactNode } from 'react'

interface WidgetFrameProps {
  title: string
  children: ReactNode
  className?: string
  isEditing?: boolean
  onRemove?: () => void
}

export function WidgetFrame({
  title,
  children,
  className,
  isEditing = false,
  onRemove,
}: WidgetFrameProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        {isEditing && onRemove && (
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove widget"
          >
            <Icons.xCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto pt-2">{children}</div>
    </div>
  )
}
