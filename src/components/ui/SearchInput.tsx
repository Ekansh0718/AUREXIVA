import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, onChange, ...props }, ref) => {
    const hasValue = !!value

    return (
      <div className="relative w-full flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-4 w-4 text-secondary/40" aria-hidden="true" />
        </div>
        <input
          type="text"
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            'flex w-full border border-border-custom bg-white py-2.5 pl-10 pr-10 text-body transition-all duration-300 placeholder:text-secondary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 rounded-sm',
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-secondary/45 hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
