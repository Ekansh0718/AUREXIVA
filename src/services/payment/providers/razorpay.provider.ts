import { supabase } from '@/lib/supabase'
import { isRazorpayConfigured } from '../payment.config'
import type {
  IPaymentProvider,
  PaymentInitResult,
  PaymentOrderInput,
  PaymentStatus as PaymentStatusType,
  PaymentVerificationInput,
  PaymentVerificationResult,
  RefundInput,
  RefundResult,
} from '../payment.types'
import { PaymentStatus } from '../payment.types'

interface CreatePaymentOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
  error?: string
}

interface VerifyPaymentResponse {
  status: PaymentStatusType
  transactionId: string
  gatewayReference: string
  paymentMethod?: string
  error?: string
}

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

let scriptPromise: Promise<boolean> | null = null

const loadRazorpayScript = (): Promise<boolean> => {
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
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

  return scriptPromise
}

type ModalOutcome =
  | { status: 'success'; payload: Record<string, string> }
  | { status: 'cancelled'; payload: Record<string, string> }
  | { status: 'failed'; payload: Record<string, string> }

/**
 * Real Razorpay integration. The only things this class needs to work are
 * the two env vars documented in payment.config.ts (VITE_PAYMENT_PROVIDER=
 * razorpay, VITE_PAYMENT_PUBLIC_KEY) plus the Key Secret / Webhook Secret
 * set as Supabase Edge Function secrets (never in frontend env — see the
 * security note in payment.config.ts).
 *
 * This class itself never touches the Key Secret. Order creation and
 * signature verification both happen in Supabase Edge Functions
 * (supabase/functions/create-payment-order, verify-payment) — this class
 * only calls those functions and shapes their responses to IPaymentProvider.
 *
 * The checkout modal is opened here, synchronously within the same call
 * chain as the "Continue to Payment" click (Checkout.tsx's onSubmit calls
 * initializePayment directly) — Razorpay's own reference integration always
 * opens the modal on the same page, in direct response to the triggering
 * user gesture, rather than after a route change to a separate page. Opening
 * it later, on a freshly-navigated page after an async script load, is
 * unreliable — the modal can silently fail to reveal itself with no error
 * surfaced anywhere.
 */
export class RazorpayPaymentProvider implements IPaymentProvider {
  readonly name = 'razorpay'

  constructor() {
    if (!isRazorpayConfigured()) {
      console.warn(
        '[RazorpayPaymentProvider] Missing VITE_PAYMENT_PUBLIC_KEY. Also confirm ' +
          'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set as Supabase Edge Function secrets.'
      )
    }
  }

  async initializePayment(input: PaymentOrderInput): Promise<PaymentInitResult> {
    const { data, error } = await supabase.functions.invoke<CreatePaymentOrderResponse>('create-payment-order', {
      body: { orderId: input.orderId },
    })

    if (error) throw error
    if (!data || data.error) throw new Error(data?.error ?? 'Unable to create Razorpay order.')

    const loaded = await loadRazorpayScript()
    if (!loaded || !window.Razorpay) {
      throw new Error("Couldn't load the payment window. Check your connection and try again.")
    }

    const outcome = await new Promise<ModalOutcome>((resolve, reject) => {
      try {
        const rzp = new window.Razorpay!({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'AUREXIVA',
          description: `Order ${input.orderId}`,
          order_id: data.razorpayOrderId,
          prefill: { name: input.customerName, email: input.customerEmail },
          theme: { color: '#111111' },
          handler: (response) => {
            resolve({
              status: 'success',
              payload: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            })
          },
          modal: {
            ondismiss: () => resolve({ status: 'cancelled', payload: {} }),
          },
        })

        rzp.on('payment.failed', () => resolve({ status: 'failed', payload: {} }))
        rzp.open()
      } catch (err) {
        reject(err)
      }
    })

    // Route through the same /payment/callback flow every provider uses —
    // Checkout.tsx just does navigate(redirectUrl), and PaymentCallback.tsx
    // already knows how to read these Razorpay-specific query params.
    const params = new URLSearchParams({ order_id: input.orderId, status: outcome.status, ...outcome.payload })

    return {
      redirectUrl: `/payment/callback?${params.toString()}`,
      gatewayReference: data.razorpayOrderId,
    }
  }

  async verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    const { data, error } = await supabase.functions.invoke<VerifyPaymentResponse>('verify-payment', {
      body: {
        orderId: input.orderId,
        razorpay_payment_id: input.payload.razorpay_payment_id,
        razorpay_order_id: input.payload.razorpay_order_id,
        razorpay_signature: input.payload.razorpay_signature,
      },
    })

    if (error) throw error
    if (!data || data.error) throw new Error(data?.error ?? 'Payment verification failed.')

    return {
      status: data.status,
      transactionId: data.transactionId,
      gatewayReference: data.gatewayReference,
      paymentMethod: data.paymentMethod ?? 'razorpay',
    }
  }

  async handleSuccess(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    // Razorpay's success callback still requires signature verification —
    // "the browser said it succeeded" is never trusted on its own.
    return this.verifyPayment(input)
  }

  async handleFailure(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    // Failures/cancellations happen client-side (user closed the modal, or
    // Razorpay reported an error) — there's no signature to check because no
    // payment was completed, so there's nothing to forge either.
    const cancelled = input.payload.status === 'cancelled'
    return {
      status: cancelled ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
      transactionId: input.transactionId ?? '',
      gatewayReference: input.gatewayReference ?? '',
      paymentMethod: 'razorpay',
    }
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean
      refundId: string
      error?: string
    }>('refund-payment', {
      body: {
        orderId: input.orderId,
        transactionId: input.transactionId,
        amount: input.amount,
        reason: input.reason,
      },
    })

    if (error) throw error
    if (!data || data.error) throw new Error(data?.error ?? 'Refund failed.')

    return {
      success: data.success,
      refundId: data.refundId,
      status: PaymentStatus.REFUNDED,
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatusType> {
    // Our own orders table is kept current by verify-payment (client flow)
    // and the payment-webhook function (durable server-side flow), so
    // reading it directly avoids yet another Razorpay API round-trip.
    const { data, error } = await supabase.from('orders').select('payment_status').eq('id', orderId).maybeSingle()

    if (error) throw error
    return (data?.payment_status as PaymentStatusType) ?? PaymentStatus.PENDING
  }
}
