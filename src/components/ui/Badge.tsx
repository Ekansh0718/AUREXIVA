import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wider uppercase transition-colors duration-200 rounded-sm',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white border border-transparent',
        secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
        accent: 'bg-accent text-white border border-transparent',
        success: 'bg-success/10 text-success border border-success/20',
        error: 'bg-error/10 text-error border border-error/20',
      },
      outline: {
        true: 'bg-transparent',
      },
    },
    compoundVariants: [
      { variant: 'primary', outline: true, class: 'border border-primary text-primary bg-transparent' },
      { variant: 'secondary', outline: true, class: 'border border-secondary text-secondary bg-transparent' },
      { variant: 'accent', outline: true, class: 'border border-accent text-accent bg-transparent' },
      { variant: 'success', outline: true, class: 'border border-success/30 text-success bg-transparent' },
      { variant: 'error', outline: true, class: 'border border-error/30 text-error bg-transparent' },
    ],
    defaultVariants: {
      variant: 'primary',
      outline: false,
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ children, variant, outline, className, ...props }) => {
  return (
    <span className={cn(badgeVariants({ variant, outline }), className)} {...props}>
      {children}
    </span>
  )
}
