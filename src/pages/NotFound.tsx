import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/common/Container'
import { PrimaryButton } from '@/components/ui/Button'

export const NotFound: React.FC = () => {
  return (
    <Container className="py-24 sm:py-32 text-center flex flex-col items-center gap-6 select-none">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
        404 Error
      </span>
      <h1 className="text-display font-medium tracking-tight text-primary leading-tight">
        Page Not Found
      </h1>
      <p className="text-body text-secondary max-w-md leading-relaxed">
        The page you are looking for doesn't exist or has been moved to another location.
      </p>
      <Link to="/" className="mt-4">
        <PrimaryButton>Return Home</PrimaryButton>
      </Link>
    </Container>
  )
}
