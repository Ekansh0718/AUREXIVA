import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:ring-offset-1 select-none hover:scale-[1.02] active:scale-[0.98] rounded-full',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/95 border border-primary',
        secondary: 'bg-white text-primary border border-border-custom hover:bg-background',
        accent: 'bg-accent text-white hover:bg-accent/95 border border-accent',
        outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
        ghost: 'bg-transparent text-primary hover:bg-primary/5 hover:text-primary border border-transparent',
      },
      size: {
        sm: 'px-4 py-2.5 text-xs',
        md: 'px-[28px] py-3.5 text-[15px]',
        lg: 'px-[34px] py-[16px] text-[16px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        disabled={!asChild ? disabled || isLoading : undefined}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
            <span>{children}</span>
            {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

// Specific exports for developer convenience matching requested components
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
))
PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
))
SecondaryButton.displayName = 'SecondaryButton'
