import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFields = z.infer<typeof registerSchema>

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFields) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(`Account successfully created for ${data.name}`)
    navigate('/profile')
  }

  return (
    <Container className="py-16 sm:py-20 flex justify-center text-left">
      <div className="w-full max-w-md border border-border-custom bg-white p-8 sm:p-10 rounded-sm hover:shadow-premium transition-all duration-300">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-h3 font-medium tracking-tight text-primary">Create Account</h1>
          <p className="text-xs text-secondary">
            Sign up to track orders, save items, and speed up checkout on Aurexiva Products.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            disabled={isSubmitting}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isSubmitting}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />

          <PrimaryButton type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Register
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-xs text-secondary font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-accent font-semibold underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  )
}
