import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { PrimaryButton } from '@/components/ui/Button'
import { formatPrice } from '@/utils/format'

interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string }
  theme: { color: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal: { ondismiss: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', handler: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

/**
 * Opens Razorpay's real hosted checkout modal. Reached via
 * paymentService.initializePayment's redirectUrl when
 * VITE_PAYMENT_PROVIDER=razorpay — everything before this page (order
 * creation) and after it (callback verification) is unchanged from the
 * mock/bank provider flow.
 */
export const RazorpayCheckout: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [scriptFailed, setScriptFailed] = useState(false)
  const hasOpened = useRef(false)

  const razorpayOrderId = searchParams.get('razorpay_order_id') ?? ''
  const amount = Number(searchParams.get('amount') ?? 0)
  const currency = searchParams.get('currency') ?? 'INR'
  const key = searchParams.get('key') ?? ''
  const name = searchParams.get('name') ?? ''
  const email = searchParams.get('email') ?? ''

  const goToCallback = (status: 'success' | 'failed' | 'cancelled', extra: Record<string, string> = {}) => {
    const params = new URLSearchParams({ order_id: orderId ?? '', status, ...extra })
    navigate(`/payment/callback?${params.toString()}`)
  }

  useEffect(() => {
    if (hasOpened.current || !orderId || !razorpayOrderId || !key) return
    hasOpened.current = true

    let cancelled = false

    loadRazorpayScript().then((loaded) => {
      if (cancelled) return
      if (!loaded || !window.Razorpay) {
        setScriptFailed(true)
        return
      }

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: 'AUREXIVA',
        description: `Order ${orderId}`,
        order_id: razorpayOrderId,
        prefill: { name, email },
        theme: { color: '#111111' },
        handler: (response) => {
          goToCallback('success', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss: () => goToCallback('cancelled'),
        },
      })

      rzp.on('payment.failed', () => goToCallback('failed'))
      rzp.open()
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, razorpayOrderId, key])

  if (!orderId || !razorpayOrderId || !key) {
    return (
      <div className="min-h-screen w-full bg-[#111111] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-premium p-8 text-center">
          <p className="text-sm text-secondary">This payment link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#111111] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-premium p-8 flex flex-col items-center gap-4 text-center">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Amount Due</p>
        <p className="text-h2 font-bold text-primary">
          {formatPrice(amount / 100)} <span className="text-body font-medium text-secondary">{currency}</span>
        </p>

        {scriptFailed ? (
          <>
            <p className="text-sm text-error mt-2">
              Couldn't load the payment window. Check your connection and try again.
            </p>
            <PrimaryButton onClick={() => window.location.reload()} className="mt-2">
              Retry
            </PrimaryButton>
          </>
        ) : (
          <div className="flex items-center gap-2 text-secondary mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Opening secure payment window…</span>
          </div>
        )}
      </div>
    </div>
  )
}
