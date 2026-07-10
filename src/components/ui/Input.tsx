import React from 'react'
import { cn } from '@/utils/cn'
import { Label } from '@/components/ui/Label'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId()

    return (
      <div className="flex w-full flex-col gap-1.5 text-left">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          type={type}
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={cn(
            'flex w-full border border-border-custom bg-white px-3.5 py-2.5 text-body transition-all duration-300 placeholder:text-secondary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error font-medium select-none">{error}</p>}
        {!error && helperText && <p className="text-xs text-secondary/70 select-none">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
