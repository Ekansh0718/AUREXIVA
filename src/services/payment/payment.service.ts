import { getPaymentProvider } from './payment.provider'
import type {
  PaymentInitResult,
  PaymentOrderInput,
  PaymentStatus,
  PaymentVerificationInput,
  PaymentVerificationResult,
  RefundInput,
  RefundResult,
} from './payment.types'

/**
 * The ONLY payment surface the rest of the application should import.
 * Pages/components/hooks call these functions; they never touch a provider
 * class or a gateway SDK directly. Internally this just delegates to
 * whichever IPaymentProvider payment.provider.ts hands back.
 */
export const paymentService = {
  initializePayment: (input: PaymentOrderInput): Promise<PaymentInitResult> =>
    getPaymentProvider().initializePayment(input),

  verifyPayment: (input: PaymentVerificationInput): Promise<PaymentVerificationResult> =>
    getPaymentProvider().verifyPayment(input),

  handleSuccess: (input: PaymentVerificationInput): Promise<PaymentVerificationResult> =>
    getPaymentProvider().handleSuccess(input),

  handleFailure: (input: PaymentVerificationInput): Promise<PaymentVerificationResult> =>
    getPaymentProvider().handleFailure(input),

  refundPayment: (input: RefundInput): Promise<RefundResult> => getPaymentProvider().refundPayment(input),

  getPaymentStatus: (orderId: string, transactionId: string): Promise<PaymentStatus> =>
    getPaymentProvider().getPaymentStatus(orderId, transactionId),
}
