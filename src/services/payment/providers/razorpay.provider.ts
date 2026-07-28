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

    const params = new URLSearchParams({
      razorpay_order_id: data.razorpayOrderId,
      amount: String(data.amount),
      currency: data.currency,
      key: data.keyId,
      name: input.customerName,
      email: input.customerEmail,
    })

    return {
      redirectUrl: `/payment/razorpay/${input.orderId}?${params.toString()}`,
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
