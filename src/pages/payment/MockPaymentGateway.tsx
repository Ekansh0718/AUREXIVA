import React, { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { formatPrice } from '@/utils/format'

/**
 * Stands in for the bank's hosted payment page. This is the only piece of
 * the flow that's fake — everything before it (order creation) and after it
 * (callback verification, order confirmation) is real. Once
 * BankPaymentProvider is implemented, `paymentService.initializePayment`
 * returns the bank's real hosted URL instead of this route, and this file
 * simply stops being linked to — no other code changes.
 */
export const MockPaymentGateway: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const ref = searchParams.get('ref') ?? ''
  const amount = Number(searchParams.get('amount') ?? 0)
  const currency = searchParams.get('currency') ?? 'USD'

  const resolve = (status: 'success' | 'failed' | 'cancelled') => {
    setIsProcessing(true)
    setTimeout(() => {
      navigate(`/payment/callback?order_id=${orderId}&status=${status}&ref=${encodeURIComponent(ref)}`)
    }, 1200)
  }

  return (
    <div className="min-h-screen w-full bg-[#111111] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-premium p-8 flex flex-col gap-6">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-secondary/70 border border-dashed border-border-custom rounded-sm px-3 py-2 select-none">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Simulated Payment Gateway — no real transaction occurs here
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Amount Due</p>
          <p className="mt-1 text-h2 font-bold text-primary">{formatPrice(amount)} <span className="text-body font-medium text-secondary">{currency}</span></p>
        </div>

        <div className="text-xs text-secondary space-y-1">
          <p>Order Reference: <span className="text-primary font-semibold">{orderId}</span></p>
          <p>Gateway Reference: <span className="text-primary font-semibold">{ref}</span></p>
        </div>

        <div className="border-t border-border-custom pt-6 flex flex-col gap-3">
          <button
            onClick={() => resolve('success')}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-full text-[15px] font-semibold tracking-wide hover:bg-primary/95 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            Pay Now
          </button>
          <button
            onClick={() => resolve('failed')}
            disabled={isProcessing}
            className="w-full py-3 rounded-full text-xs font-semibold tracking-wide text-error border border-error/30 hover:bg-error/5 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            Simulate Failed Payment
          </button>
          <button
            onClick={() => resolve('cancelled')}
            disabled={isProcessing}
            className="w-full py-3 rounded-full text-xs font-semibold tracking-wide text-secondary hover:text-primary transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  )
}
