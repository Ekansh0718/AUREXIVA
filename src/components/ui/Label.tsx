import React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils/cn'

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-xs font-medium tracking-wider text-primary uppercase select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName
