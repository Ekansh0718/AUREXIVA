import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Container } from '@/components/common/Container'
import { Input } from '@/components/ui/Input'
import { PrimaryButton } from '@/components/ui/Button'
import { DUMMY_PRODUCTS } from '@/constants/dummyData'
import { formatPrice } from '@/utils/format'

const checkoutSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(5, 'ZIP Code must be at least 5 characters'),
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(16, 'Card number must be 16 digits'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format'),
  cvv: z.string().min(3, 'CVV must be 3 digits').max(3, 'CVV must be 3 digits'),
})

type CheckoutFields = z.infer<typeof checkoutSchema>

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFields>({
    resolver: zodResolver(checkoutSchema),
  })

  // Simulated items in the bag
  const subtotal = DUMMY_PRODUCTS[0].price + DUMMY_PRODUCTS[2].price // 220 + 350
  const shipping = 0
  const total = subtotal + shipping

  const onSubmit = async (data: CheckoutFields) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert(`Order placed successfully! Thank you for shopping with Aurexiva Products, ${data.name}.`)
    navigate('/orders')
  }

  return (
    <Container className="py-12 sm:py-16 text-left">
      <h1 className="text-h2 font-medium tracking-tight text-primary mb-8 select-none">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8 items-start">
        {/* Billing & Shipping Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
                {...register('name')}
              />
              <Input
                label="Street Address"
                placeholder="100 Vercel Way"
                error={errors.address?.message}
                disabled={isSubmitting}
                {...register('address')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  error={errors.city?.message}
                  disabled={isSubmitting}
                  {...register('city')}
                />
                <Input
                  label="ZIP Code"
                  placeholder="94107"
                  error={errors.zip?.message}
                  disabled={isSubmitting}
                  {...register('zip')}
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
              Payment Information
            </h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Card Number"
                placeholder="1234567812345678"
                error={errors.cardNumber?.message}
                disabled={isSubmitting}
                {...register('cardNumber')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Expiration Date (MM/YY)"
                  placeholder="12/28"
                  error={errors.expiry?.message}
                  disabled={isSubmitting}
                  {...register('expiry')}
                />
                <Input
                  label="Security Code (CVV)"
                  placeholder="123"
                  error={errors.cvv?.message}
                  disabled={isSubmitting}
                  {...register('cvv')}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none">
            Order Review
          </h3>
          <div className="flex flex-col gap-4 pb-6 border-b border-border-custom/50">
            {/* Mock checkout item 1 */}
            <div className="flex justify-between items-center text-xs text-secondary font-medium">
              <div className="text-left">
                <p className="font-semibold text-primary">{DUMMY_PRODUCTS[0].name}</p>
                <p className="text-[10px] text-secondary/70">Qty 1 · Size US 10</p>
              </div>
              <span className="text-primary">{formatPrice(DUMMY_PRODUCTS[0].price)}</span>
            </div>

            {/* Mock checkout item 2 */}
            <div className="flex justify-between items-center text-xs text-secondary font-medium">
              <div className="text-left">
                <p className="font-semibold text-primary">{DUMMY_PRODUCTS[2].name}</p>
                <p className="text-[10px] text-secondary/70">Qty 1</p>
              </div>
              <span className="text-primary">{formatPrice(DUMMY_PRODUCTS[2].price)}</span>
            </div>
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
            isLoading={isSubmitting}
            className="w-full mt-8"
          >
            Confirm Order
          </PrimaryButton>
        </div>
      </form>
    </Container>
  )
}
