/**
 * Provider-agnostic payment domain types.
 *
 * Nothing in this file — or anywhere else in the app outside
 * services/payment/providers/* — knows which gateway is actually in use.
 * Pages and components talk only to `paymentService` (payment.service.ts),
 * which talks only to `IPaymentProvider`. Swapping the mock provider for the
 * bank's real integration means implementing this interface once in
 * providers/bank.provider.ts — nothing here changes.
 */

// A plain const object rather than `enum` — this project enables
// erasableSyntaxOnly, which disallows real TS enums (they emit runtime
// code that isn't erasable). This gives the same PaymentStatus.SUCCESS
// call-site ergonomics without that.
export const PaymentStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

/** What we ask the provider to start a payment for. */
export interface PaymentOrderInput {
  orderId: string
  amount: number
  currency: string
  customerName: string
  customerEmail: string
}

/** What a provider gives back after starting a payment attempt. */
export interface PaymentInitResult {
  /** Where the browser should go next — a real gateway's hosted checkout
   *  URL in production, or our own simulated gateway page for the mock
   *  provider. Callers must not assume anything about this URL's shape. */
  redirectUrl: string
  /** The provider's identifier for this payment attempt. */
  gatewayReference: string
  raw?: unknown
}

/** The data a gateway hands back on its callback/webhook — shape varies per
 *  provider, so this is intentionally a loose bag of the raw callback
 *  payload plus whatever identifiers we already know. */
export interface PaymentVerificationInput {
  orderId: string
  gatewayReference?: string
  transactionId?: string
  payload: Record<string, string>
}

export interface PaymentVerificationResult {
  status: PaymentStatus
  transactionId: string
  gatewayReference: string
  paymentMethod?: string
  raw?: unknown
}

export interface RefundInput {
  orderId: string
  transactionId: string
  /** Amount in the same major currency unit as the original charge (e.g. dollars, not cents). */
  amount: number
  reason?: string
}

export interface RefundResult {
  success: boolean
  refundId: string
  status: PaymentStatus
  raw?: unknown
}

/**
 * The contract every payment provider must implement. This is the ONLY
 * surface the rest of the application is allowed to depend on for payments.
 */
export interface IPaymentProvider {
  readonly name: string

  /** Start a payment attempt; returns where to send the browser. */
  initializePayment(input: PaymentOrderInput): Promise<PaymentInitResult>

  /** Confirm a payment attempt's outcome against the provider (server-to-server
   *  status check, signature verification, etc. — provider-specific). */
  verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult>

  /** Called on the success leg of a callback; providers may do extra
   *  bookkeeping beyond verifyPayment (e.g. capturing an authorized charge). */
  handleSuccess(input: PaymentVerificationInput): Promise<PaymentVerificationResult>

  /** Called on the failure/cancel leg of a callback. */
  handleFailure(input: PaymentVerificationInput): Promise<PaymentVerificationResult>

  refundPayment(input: RefundInput): Promise<RefundResult>

  getPaymentStatus(orderId: string, transactionId: string): Promise<PaymentStatus>
}
