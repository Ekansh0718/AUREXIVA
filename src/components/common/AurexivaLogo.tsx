import React from 'react'
import { cn } from '@/utils/cn'

interface AurexivaLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
}

/**
 * Icon + real (non-rasterized) wordmark, not the flattened logo-with-text
 * artwork — that image's text portion is a small fraction of its height, so
 * it turns to illegible noise at any UI-appropriate size. This stays crisp
 * at any scale and lets the wordmark's color/weight be styled per-context.
 */
export const AurexivaLogo: React.FC<AurexivaLogoProps> = ({ className, iconClassName, textClassName }) => {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <img
        src="/logo-mark.png"
        alt="AUREXIVA"
        className={cn('h-8 w-auto object-contain', iconClassName)}
      />
      <span
        className={cn(
          'font-sans font-medium tracking-[0.26em] uppercase text-white text-[15px] leading-none whitespace-nowrap',
          textClassName
        )}
      >
        Aurexiva
      </span>
    </span>
  )
}
