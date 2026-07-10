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
import { generateMockGatewayReference, generateMockTransactionId } from '../payment.utils'

/**
 * Simulates a bank/gateway integration end-to-end so the full checkout flow
 * (Cart → Checkout → Place Order → Gateway → Callback → Verify → Confirmation)
 * is real and testable today, with no external dependency.
 *
 * This class is intentionally isolated from the rest of the app: it knows
 * nothing about Supabase, orders, or React. It only implements
 * IPaymentProvider. Deleting this file and flipping
 * VITE_PAYMENT_PROVIDER=bank is the entire migration path once bank.provider.ts
 * is implemented.
 */
export class MockPaymentProvider implements IPaymentProvider {
  readonly name = 'mock'

  // In-memory only — a real provider would query the bank's API here instead.
  // Sufficient for simulating getPaymentStatus() within a single session.
  private statusByOrder = new Map<string, PaymentStatusType>()

  async initializePayment(input: PaymentOrderInput): Promise<PaymentInitResult> {
    const gatewayReference = generateMockGatewayReference()
    this.statusByOrder.set(input.orderId, PaymentStatus.PENDING)

    // A real provider would call the bank's API here and return the URL it
    // gives back. We redirect to our own simulated gateway page instead.
    const redirectUrl = `/payment/gateway/${input.orderId}?ref=${encodeURIComponent(gatewayReference)}&amount=${input.amount}&currency=${input.currency}`

    return { redirectUrl, gatewayReference }
  }

  async verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    const outcome = input.payload.status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
    return this.buildResult(input, outcome)
  }

  async handleSuccess(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    return this.buildResult(input, PaymentStatus.SUCCESS)
  }

  async handleFailure(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    const outcome = input.payload.status === 'cancelled' ? PaymentStatus.CANCELLED : PaymentStatus.FAILED
    return this.buildResult(input, outcome)
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    this.statusByOrder.set(input.orderId, PaymentStatus.REFUNDED)
    return {
      success: true,
      refundId: `MOCK-REFUND-${crypto.randomUUID()}`,
      status: PaymentStatus.REFUNDED,
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatusType> {
    return this.statusByOrder.get(orderId) ?? PaymentStatus.PENDING
  }

  private buildResult(input: PaymentVerificationInput, status: PaymentStatusType): PaymentVerificationResult {
    this.statusByOrder.set(input.orderId, status)
    return {
      status,
      transactionId: input.transactionId ?? generateMockTransactionId(),
      gatewayReference: input.gatewayReference ?? generateMockGatewayReference(),
      paymentMethod: 'mock',
    }
  }
}
