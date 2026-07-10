import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFields = z.infer<typeof loginSchema>

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFields) => {
    setFormError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setFormError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
      return
    }

    const redirect = searchParams.get('redirect')
    navigate(redirect || '/profile')
  }

  return (
    <Container className="py-16 sm:py-20 flex justify-center text-left">
      <div className="w-full max-w-md border border-border-custom bg-white p-8 sm:p-10 rounded-sm hover:shadow-premium transition-all duration-300">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-h3 font-medium tracking-tight text-primary">Sign In</h1>
          <p className="text-xs text-secondary">
            Enter your credentials to access your account.
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

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center mb-1 select-none">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                Password
              </span>
              <Link to="/forgot-password" className="text-xs text-secondary/80 hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register('password')}
            />
          </div>

          <PrimaryButton type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Continue
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-xs text-secondary font-medium">
          New to Aurexiva Products?{' '}
          <Link to="/register" className="text-primary hover:text-accent font-semibold underline transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </Container>
  )
}
