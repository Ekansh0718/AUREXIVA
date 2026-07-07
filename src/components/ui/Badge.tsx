import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error'
  outline?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  outline = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wider uppercase transition-colors duration-200'
  
  const variantStyles = {
    primary: outline 
      ? 'border border-primary text-primary bg-transparent' 
      : 'bg-primary text-white border border-transparent',
    secondary: outline 
      ? 'border border-secondary text-secondary bg-transparent' 
      : 'bg-secondary/10 text-secondary border border-secondary/20',
    accent: outline 
      ? 'border border-accent text-accent bg-transparent' 
      : 'bg-accent text-white border border-transparent',
    success: outline 
      ? 'border border-success/30 text-success bg-transparent' 
      : 'bg-success/10 text-success border border-success/20',
    error: outline 
      ? 'border border-error/30 text-error bg-transparent' 
      : 'bg-error/10 text-error border border-error/20'
  }

  return (
    <span
      className={cn(baseStyles, 'rounded-sm', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
