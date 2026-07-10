import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { usePayment } from '@/hooks/usePayment'
import { createOrder } from '@/services/orders'
import { paymentConfig } from '@/services/payment/payment.config'
import { formatPrice } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

const checkoutSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(5, 'ZIP Code must be at least 5 characters'),
})

type CheckoutFields = z.infer<typeof checkoutSchema>

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal } = useCart()
  const { initiatePayment, isProcessing } = usePayment()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFields>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: user?.email ?? '' },
  })

  const shipping = subtotal > 150 ? 0 : 15
  const total = items.length > 0 ? subtotal + shipping : 0

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true })
  }, [items.length, navigate])

  const onSubmit = async (data: CheckoutFields) => {
    if (!user) return
    setFormError(null)

    try {
      const order = await createOrder(
        user.id,
        items,
        { fullName: data.name, email: data.email, address: data.address, city: data.city, zip: data.zip },
        subtotal,
        total
      )

      const payment = await initiatePayment({
        orderId: order.id,
        amount: total,
        currency: paymentConfig.currency,
        customerName: data.name,
        customerEmail: data.email,
      })

      // For the mock provider this is our own simulated gateway route; for a
      // real gateway it would be an external URL — either way, we just
      // navigate to whatever the provider tells us.
      navigate(payment.redirectUrl)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to start checkout. Please try again.'))
    }
  }

  if (items.length === 0) return null

  return (
    <Container className="py-12 sm:py-16 text-left">
      <h1 className="text-h2 font-medium tracking-tight text-primary mb-8 select-none">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8 items-start">
        {/* Billing & Shipping Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {formError && (
            <p className="text-xs text-error font-medium bg-error/5 border border-error/20 rounded-sm px-3.5 py-2.5">
              {formError}
            </p>
          )}

          {/* Customer info */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
              Contact Information
            </h3>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              disabled={isProcessing}
              {...register('email')}
            />
          </section>

          {/* Shipping Address */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
              Shipping Address
            </h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                disabled={isProcessing}
                {...register('name')}
              />
              <Input
                label="Street Address"
                placeholder="100 Vercel Way"
                error={errors.address?.message}
                disabled={isProcessing}
                {...register('address')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  error={errors.city?.message}
                  disabled={isProcessing}
                  {...register('city')}
                />
                <Input
                  label="ZIP Code"
                  placeholder="94107"
                  error={errors.zip?.message}
                  disabled={isProcessing}
                  {...register('zip')}
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
              Payment
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              You'll enter your payment details on the next screen, hosted securely by our payment
              provider — no card information is collected or stored on this page.
            </p>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
            Order Review
          </h3>
          <div className="flex flex-col gap-4 pb-6 border-b border-border-custom/50">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs text-secondary font-medium">
                <div className="text-left">
                  <p className="font-semibold text-primary">{item.product.name}</p>
                  <p className="text-[10px] text-secondary/70">
                    Qty {item.quantity}
                    {item.variant ? ` · Size ${item.variant}` : ''}
                  </p>
                </div>
                <span className="text-primary">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-xs font-medium text-secondary mt-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-primary">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-border-custom/50 pt-4 flex justify-between text-body font-semibold text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <PrimaryButton
            type="submit"
            isLoading={isProcessing}
            className="w-full mt-8"
          >
            Continue to Payment
          </PrimaryButton>
        </div>
      </form>
    </Container>
  )
}
