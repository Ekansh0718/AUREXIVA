import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button'
import { getOrder, type OrderRecord } from '@/services/orders'
import { formatPrice } from '@/utils/format'

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    getOrder(orderId)
      .then(setOrder)
      .finally(() => setIsLoading(false))
  }, [orderId])

  if (isLoading) {
    return (
      <Container className="py-16 sm:py-24 flex justify-center">
        <LoadingSkeleton className="h-64 w-full max-w-lg rounded-premium" />
      </Container>
    )
  }

  if (!order) {
    return (
      <Container className="py-24 text-center">
        <h2 className="text-h2 font-medium text-primary">Order Not Found</h2>
        <Link to="/orders" className="mt-6 inline-flex text-xs font-bold uppercase tracking-wider text-primary underline">
          View Order History
        </Link>
      </Container>
    )
  }

  const isCod = order.paymentMethod === 'cod'

  return (
    <Container className="py-16 sm:py-24 flex justify-center text-left">
      <div className="w-full max-w-lg border border-border-custom bg-white rounded-premium p-8 sm:p-10 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <h1 className="text-h2 font-medium tracking-tight text-primary">Order Confirmed</h1>
          <p className="text-sm text-secondary">
            {isCod
              ? "Thank you — your order has been placed. Pay in cash when it's delivered."
              : 'Thank you — your order has been placed and payment received.'}
          </p>
        </div>

        <div className="border-t border-border-custom pt-6 flex flex-col gap-3 text-xs font-medium text-secondary">
          <div className="flex justify-between">
            <span>Order ID</span>
            <span className="text-primary font-semibold">{order.id}</span>
          </div>
          {!isCod && (
            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="text-primary font-semibold">{order.transactionId ?? '—'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="text-primary font-semibold">
              {isCod ? 'Cash on Delivery' : order.paymentMethod || 'Online'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status</span>
            <span className={`font-semibold capitalize ${isCod ? 'text-accent' : 'text-success'}`}>
              {isCod ? 'Due on Delivery' : order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="border-t border-border-custom pt-6 flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs text-secondary font-medium">
              <div>
                <p className="font-semibold text-primary">{item.productName}</p>
                <p className="text-[10px] text-secondary/70">
                  Qty {item.quantity}
                  {item.variant ? ` · Size ${item.variant}` : ''}
                  {item.color ? ` · Color ${item.color}` : ''}
                </p>
              </div>
              <span className="text-primary">{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border-custom/50 pt-4 flex justify-between text-body font-semibold text-primary">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link to="/orders" className="flex-1">
            <SecondaryButton className="w-full">View Order History</SecondaryButton>
          </Link>
          <Link to="/products" className="flex-1">
            <PrimaryButton className="w-full">Continue Shopping</PrimaryButton>
          </Link>
        </div>
      </div>
    </Container>
  )
}
