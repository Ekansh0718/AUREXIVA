import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [isRecoveryReady, setIsRecoveryReady] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // Supabase exchanges the recovery link's token for a session automatically
    // (detectSessionInUrl) and fires this event once that session is ready.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecoveryReady(true)
    })

    // If the session already exists by the time this page mounts (e.g. fast
    // token exchange), the event above may have already fired — check directly.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsRecoveryReady(true)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const onSubmit = async (data: ResetPasswordFields) => {
    setFormError(null)
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setFormError(error.message)
      return
    }

    navigate('/profile')
  }

  if (!isRecoveryReady) {
    return (
      <Container className="py-16 sm:py-20 flex justify-center text-left">
        <div className="w-full max-w-md border border-border-custom bg-white p-8 sm:p-10 rounded-sm text-center flex flex-col items-center gap-4">
          <h1 className="text-h3 font-medium tracking-tight text-primary">Invalid or Expired Link</h1>
          <p className="text-xs text-secondary leading-relaxed">
            This password reset link is invalid or has expired. Request a new one to continue.
          </p>
          <Link to="/forgot-password" className="mt-2 text-xs font-semibold text-accent underline hover:text-accent/80 transition-colors">
            Request New Link
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-16 sm:py-20 flex justify-center text-left">
      <div className="w-full max-w-md border border-border-custom bg-white p-8 sm:p-10 rounded-sm hover:shadow-premium transition-all duration-300">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-h3 font-medium tracking-tight text-primary">Set New Password</h1>
          <p className="text-xs text-secondary">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {formError && (
            <p className="text-xs text-error font-medium bg-error/5 border border-error/20 rounded-sm px-3.5 py-2.5">
              {formError}
            </p>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isSubmitting}
            {...register('password')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />

          <PrimaryButton type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Update Password
          </PrimaryButton>
        </form>
      </div>
    </Container>
  )
}
