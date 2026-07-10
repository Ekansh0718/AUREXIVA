import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, XCircle } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { PrimaryButton } from '@/components/ui/Button'
import { paymentService } from '@/services/payment/payment.service'
import { PaymentStatus } from '@/services/payment/payment.types'
import { updateOrderPaymentResult } from '@/services/orders'
import { useCart } from '@/context/CartContext'
import { getErrorMessage } from '@/utils/errors'

/**
 * The landing point a gateway redirects back to after payment — real or
 * simulated. This is where we verify the outcome (never trust the redirect
 * query string alone in production; a real BankPaymentProvider.verifyPayment
 * would check the gateway's signature) and persist the result onto the order.
 */
export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [error, setError] = useState<string | null>(null)
  const hasRun = useRef(false)

  const orderId = searchParams.get('order_id')
  const status = searchParams.get('status') ?? 'failed'
  const gatewayReference = searchParams.get('ref') ?? undefined

  useEffect(() => {
    if (hasRun.current || !orderId) return
    hasRun.current = true

    const run = async () => {
      try {
        const input = { orderId, gatewayReference, payload: { status } }
        const result =
          status === 'success'
            ? await paymentService.handleSuccess(input)
            : await paymentService.handleFailure(input)

        await updateOrderPaymentResult(orderId, result)

        if (result.status === PaymentStatus.SUCCESS) {
          await clearCart()
          navigate(`/order-confirmation/${orderId}`, { replace: true })
        } else {
          setError(
            result.status === PaymentStatus.CANCELLED
              ? 'Payment was cancelled.'
              : 'Payment failed. Your order has been saved — you can try paying again from your order history.'
          )
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Something went wrong verifying your payment.'))
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (!orderId) {
    return (
      <Container className="py-24 text-center">
        <h2 className="text-h2 font-medium text-primary">Missing Order Reference</h2>
        <p className="mt-2 text-secondary">This payment callback link is invalid.</p>
        <Link to="/cart" className="mt-6 inline-flex text-xs font-bold uppercase tracking-wider text-primary underline">
          Back to Cart
        </Link>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-24 flex flex-col items-center text-center gap-4">
        <XCircle className="h-12 w-12 text-error" />
        <h2 className="text-h2 font-medium text-primary">Payment Not Completed</h2>
        <p className="max-w-sm text-secondary">{error}</p>
        <Link to="/orders">
          <PrimaryButton>View Order History</PrimaryButton>
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-24 flex flex-col items-center text-center gap-4">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <h2 className="text-h3 font-medium text-primary">Verifying your payment…</h2>
      <p className="text-secondary text-sm">Please don't close this page.</p>
    </Container>
  )
}
