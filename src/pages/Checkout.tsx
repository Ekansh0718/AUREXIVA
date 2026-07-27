import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banknote, CreditCard } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { usePayment } from '@/hooks/usePayment'
import { createOrder, markOrderAsCashOnDelivery } from '@/services/orders'
import { paymentConfig } from '@/services/payment/payment.config'
import { formatPrice } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { cn } from '@/utils/cn'

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
  const { items, subtotal, clearCart } = useCart()
  const { initiatePayment, isProcessing: isPaymentProcessing } = usePayment()
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const hasPlacedOrderRef = useRef(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFields>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: user?.email ?? '' },
  })

  const shipping = subtotal > 999 ? 0 : 99
  const total = items.length > 0 ? subtotal + shipping : 0

  useEffect(() => {
    if (items.length === 0 && !hasPlacedOrderRef.current) navigate('/cart', { replace: true })
  }, [items.length, navigate])

  const onSubmit = async (data: CheckoutFields) => {
    if (!user) return
    setFormError(null)
    setIsSubmitting(true)

    try {
      const order = await createOrder(
        user.id,
        items,
        { fullName: data.name, email: data.email, address: data.address, city: data.city, zip: data.zip },
        subtotal,
        total
      )

      if (paymentMethod === 'cod') {
        await markOrderAsCashOnDelivery(order.id)
        hasPlacedOrderRef.current = true
        await clearCart()
        navigate(`/order-confirmation/${order.id}`)
        return
      }

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
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isPaymentProcessing

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
              disabled={isBusy}
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
                disabled={isBusy}
                {...register('name')}
              />
              <Input
                label="Street Address"
                placeholder="100 Vercel Way"
                error={errors.address?.message}
                disabled={isBusy}
                {...register('address')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  error={errors.city?.message}
                  disabled={isBusy}
                  {...register('city')}
                />
                <Input
                  label="ZIP Code"
                  placeholder="94107"
                  error={errors.zip?.message}
                  disabled={isBusy}
                  {...register('zip')}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
              Payment Method
            </h3>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                disabled={isBusy}
                className={cn(
                  'w-full flex items-start gap-4 text-left border rounded-premium p-4 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
                  paymentMethod === 'online' ? 'border-primary bg-background' : 'border-border-custom hover:border-secondary'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center',
                    paymentMethod === 'online' ? 'border-primary' : 'border-border-custom'
                  )}
                >
                  {paymentMethod === 'online' && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <CreditCard className="h-5 w-5 text-primary shrink-0" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-primary">Pay Online</span>
                  <span className="text-xs text-secondary">
                    UPI, Cards, Netbanking, and Wallets — hosted securely by our payment provider. No card
                    details are collected or stored on this page.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                disabled={isBusy}
                className={cn(
                  'w-full flex items-start gap-4 text-left border rounded-premium p-4 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
                  paymentMethod === 'cod' ? 'border-primary bg-background' : 'border-border-custom hover:border-secondary'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center',
                    paymentMethod === 'cod' ? 'border-primary' : 'border-border-custom'
                  )}
                >
                  {paymentMethod === 'cod' && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <Banknote className="h-5 w-5 text-primary shrink-0" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-primary">Cash on Delivery</span>
                  <span className="text-xs text-secondary">Pay in cash when your order is delivered.</span>
                </span>
              </button>
            </div>
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
                    {item.color ? ` · Color ${item.color}` : ''}
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
            isLoading={isBusy}
            className="w-full mt-8"
          >
            {paymentMethod === 'cod' ? 'Place Order' : 'Continue to Payment'}
          </PrimaryButton>
        </div>
      </form>
    </Container>
  )
}
