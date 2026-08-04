import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { PrimaryButton } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/format'

export const Cart: React.FC = () => {
  const { items, isLoading, updateQuantity, removeItem, subtotal } = useCart()

  const shipping = subtotal > 800 ? 0 : 99
  const total = items.length > 0 ? subtotal + shipping : 0

  if (isLoading) {
    return (
      <Container className="py-12 sm:py-16 text-left">
        <SectionTitle title="Shopping Bag" subtitle="Review the items in your bag before proceeding to checkout." />
        <div className="flex flex-col gap-6 mt-8">
          {[...Array(2)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 w-full rounded-premium" />
          ))}
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12 sm:py-16 text-left">
      <SectionTitle title="Shopping Bag" subtitle="Review the items in your bag before proceeding to checkout." />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 sm:gap-6 py-6 border-b border-border-custom first:pt-0"
              >
                {/* Product image */}
                <div className="h-24 w-20 sm:h-32 sm:w-28 flex-shrink-0 overflow-hidden bg-background border border-border-custom rounded-premium">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between gap-2">
                      <h3 className="text-body font-medium text-primary line-clamp-1">
                        <Link to={`/product/${item.product.slug}`} className="hover:text-accent transition-colors">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-btn font-semibold text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-secondary/70">{item.product.category}</p>
                    {(item.variant || item.color) && (
                      <p className="mt-1 text-xs font-semibold text-secondary">
                        {item.variant && <>Size: <span className="text-primary">{item.variant}</span></>}
                        {item.variant && item.color && ' · '}
                        {item.color && <>Color: <span className="text-primary">{item.color}</span></>}
                      </p>
                    )}
                  </div>

                  {/* Actions (Qty / Remove) */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Qty controller */}
                    <div className="flex items-center border border-border-custom rounded-full">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-background text-secondary transition-colors cursor-pointer rounded-l-full disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-primary select-none">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-background text-secondary transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-error transition-colors duration-200 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-body font-bold uppercase tracking-wider text-primary mb-6 select-none">
              Order Summary
            </h3>
            <div className="flex flex-col gap-4 text-xs font-medium text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-primary">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-border-custom/50 pt-4 flex justify-between text-body font-semibold text-primary">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="block mt-8">
              <PrimaryButton className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Proceed to Checkout
              </PrimaryButton>
            </Link>

            <div className="mt-4 text-center">
              <Link to="/products" className="text-xs font-semibold text-secondary hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Bag state */
        <div className="py-24 text-center border border-dashed border-border-custom rounded-premium mt-8">
          <p className="text-body text-secondary mb-6">Your shopping bag is empty.</p>
          <Link to="/products">
            <PrimaryButton>Shop the Collection</PrimaryButton>
          </Link>
        </div>
      )}
    </Container>
  )
}
