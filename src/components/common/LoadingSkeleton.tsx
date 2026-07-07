import React from 'react'
import { cn } from '@/utils/cn'

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangle' | 'circle' | 'text'
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangle',
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse-slow bg-border-custom/60',
        variant === 'circle' && 'rounded-full',
        variant === 'rectangle' && 'rounded-sm',
        variant === 'text' && 'h-4 w-3/4 rounded-sm',
        className
      )}
      {...props}
    />
  )
}
