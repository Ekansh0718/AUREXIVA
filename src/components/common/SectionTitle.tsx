import React from 'react'
import { cn } from '@/utils/cn'

interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  align = 'left',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'mb-8 sm:mb-12 flex flex-col gap-2',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
        className
      )}
      {...props}
    >
      <h2 className="text-h2 font-medium tracking-tight text-primary leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-small sm:text-body text-secondary max-w-xl font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
