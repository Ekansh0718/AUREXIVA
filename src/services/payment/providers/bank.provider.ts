import { paymentConfig, isBankProviderConfigured } from '../payment.config'
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

/**
 * Placeholder for the client's bank payment gateway.
 *
 * WHEN THE BANK SENDS CREDENTIALS AND DOCS, THIS IS THE ONLY CLASS THAT
 * SHOULD NEED REAL LOGIC (alongside payment.config.ts env values). No other
 * file in the app should need to change — pages call `paymentService`, which
 * calls `getPaymentProvider()`, which returns this class once
 * `VITE_PAYMENT_PROVIDER=bank` is set.
 *
 * IMPORTANT ARCHITECTURE NOTE:
 * The bank's *secret* key must never be called from browser code — it must
 * never appear in a `VITE_` env var (see payment.config.ts's security
 * boundary comment). So `initializePayment`, `verifyPayment`, and
 * `refundPayment` below should NOT call the bank's API directly from here.
 * Instead they should call a Supabase Edge Function (server-side, holding
 * the secret key via `supabase secrets set`) which then talks to the bank.
 * `supabase/functions/payment-webhook` is scaffolded for the inbound
 * webhook side of this; a companion `create-payment-order` /
 * `verify-payment` function should be added for the outbound calls this
 * class makes. The TODOs below assume that shape.
 */
export class BankPaymentProvider implements IPaymentProvider {
  readonly name = 'bank'

  constructor() {
    if (!isBankProviderConfigured()) {
      // Loud in dev, since silently falling back would hide a real
      // misconfiguration once this provider is actually selected.
      console.warn(
        '[BankPaymentProvider] Missing configuration. Set VITE_PAYMENT_MERCHANT_ID, ' +
          'VITE_PAYMENT_PUBLIC_KEY, and VITE_PAYMENT_GATEWAY_URL once the bank ' +
          'provides credentials. See payment.config.ts.'
      )
    }
  }

  async initializePayment(_input: PaymentOrderInput): Promise<PaymentInitResult> {
    this.assertConfigured()

    // TODO(bank-integration): Merchant ID — paymentConfig.merchantId
    // TODO(bank-integration): API Key (publishable) — paymentConfig.publicApiKey
    // TODO(bank-integration): Secret Key — NEVER here; used only inside a
    //   Supabase Edge Function this method calls via supabase.functions.invoke(...)
    // TODO(bank-integration): Gateway URL — paymentConfig.gatewayUrl
    // TODO(bank-integration): Callback URL — paymentConfig.callbackUrl
    // TODO(bank-integration): Return URL — paymentConfig.returnUrl
    // TODO(bank-integration): Success URL — paymentConfig.successUrl
    // TODO(bank-integration): Failure URL — paymentConfig.failureUrl
    // TODO(bank-integration): Environment (sandbox/production) — paymentConfig.environment
    //
    // Real implementation sketch:
    //   const { data, error } = await supabase.functions.invoke('create-payment-order', {
    //     body: { orderId: input.orderId, amount: input.amount, currency: input.currency },
    //   })
    //   if (error) throw error
    //   return { redirectUrl: data.redirectUrl, gatewayReference: data.gatewayReference }

    throw new PaymentProviderNotConfiguredError(
      'BankPaymentProvider.initializePayment is not implemented yet — awaiting bank credentials.'
    )
  }

  async verifyPayment(_input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    this.assertConfigured()
    // TODO(bank-integration): call a `verify-payment` Edge Function that
    // checks the bank's signature (using Webhook Secret, server-side only)
    // and/or queries the bank's transaction-status API with the secret key.
    throw new PaymentProviderNotConfiguredError(
      'BankPaymentProvider.verifyPayment is not implemented yet — awaiting bank credentials.'
    )
  }

  async handleSuccess(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    // TODO(bank-integration): typically identical to verifyPayment for most
    // gateways; separated here in case the bank requires a distinct
    // capture/confirm step for the success leg.
    return this.verifyPayment(input)
  }

  async handleFailure(input: PaymentVerificationInput): Promise<PaymentVerificationResult> {
    // TODO(bank-integration): confirm failure/cancellation with the bank if
    // their flow requires it; otherwise this can just format the result.
    return this.verifyPayment(input)
  }

  async refundPayment(_input: RefundInput): Promise<RefundResult> {
    this.assertConfigured()
    // TODO(bank-integration): call a `refund-payment` Edge Function using
    // the secret key server-side.
    throw new PaymentProviderNotConfiguredError(
      'BankPaymentProvider.refundPayment is not implemented yet — awaiting bank credentials.'
    )
  }

  async getPaymentStatus(_orderId: string, _transactionId: string): Promise<PaymentStatusType> {
    this.assertConfigured()
    // TODO(bank-integration): query the bank's transaction-status API
    // (server-side, via Edge Function) and map their status codes onto
    // PaymentStatus.
    throw new PaymentProviderNotConfiguredError(
      'BankPaymentProvider.getPaymentStatus is not implemented yet — awaiting bank credentials.'
    )
  }

  private assertConfigured(): void {
    if (!isBankProviderConfigured()) {
      throw new PaymentProviderNotConfiguredError(
        'Bank payment provider is missing required configuration (merchant ID, public key, or gateway URL).'
      )
    }
    void paymentConfig // referenced so the TODOs above have a concrete target once implemented
  }
}

export class PaymentProviderNotConfiguredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PaymentProviderNotConfiguredError'
  }
}
