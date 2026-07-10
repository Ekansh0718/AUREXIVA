import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword: React.FC = () => {
  const [formError, setFormError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFields) => {
    setFormError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setFormError(error.message)
      return
    }

    setSubmittedEmail(data.email)
  }

  if (submittedEmail) {
    return (
      <Container className="py-16 sm:py-20 flex justify-center text-left">
        <div className="w-full max-w-md border border-border-custom bg-white p-8 sm:p-10 rounded-sm text-center flex flex-col items-center gap-4">
          <MailCheck className="h-10 w-10 text-accent" />
          <h1 className="text-h3 font-medium tracking-tight text-primary">Check your inbox</h1>
          <p className="text-xs text-secondary leading-relaxed">
            If an account exists for <span className="font-semibold text-primary">{submittedEmail}</span>, we sent a
            link to reset your password.
          </p>
          <Link to="/login" className="mt-2 text-xs font-semibold text-accent underline hover:text-accent/80 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-16 sm:py-20 flex justify-center text-left">
      <div className="w-full max-w-md border border-border-custom bg-white p-8 sm:p-10 rounded-sm hover:shadow-premium transition-all duration-300">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-h3 font-medium tracking-tight text-primary">Reset Password</h1>
          <p className="text-xs text-secondary">
            Enter your account email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {formError && (
            <p className="text-xs text-error font-medium bg-error/5 border border-error/20 rounded-sm px-3.5 py-2.5">
              {formError}
            </p>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register('email')}
          />

          <PrimaryButton type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Send Reset Link
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-xs text-secondary font-medium">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary hover:text-accent font-semibold underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  )
}
