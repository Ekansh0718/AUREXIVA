import { paymentConfig } from './payment.config'
import type { IPaymentProvider } from './payment.types'
import { MockPaymentProvider } from './providers/mock.provider'
import { BankPaymentProvider } from './providers/bank.provider'
import { RazorpayPaymentProvider } from './providers/razorpay.provider'

/**
 * The single place that decides which IPaymentProvider implementation is
 * active, based on `VITE_PAYMENT_PROVIDER`. Everything else in the app goes
 * through `paymentService` (payment.service.ts), which calls this factory —
 * nothing else should import a concrete provider class directly.
 *
 * Switching providers is a one-line env change:
 *   VITE_PAYMENT_PROVIDER=razorpay  — real Razorpay checkout
 *   VITE_PAYMENT_PROVIDER=bank      — the client's bank API, once implemented
 *   VITE_PAYMENT_PROVIDER=mock      — simulated gateway, no external dependency
 * No changes needed here to switch.
 */
let cachedProvider: IPaymentProvider | null = null

export const getPaymentProvider = (): IPaymentProvider => {
  if (cachedProvider) return cachedProvider

  switch (paymentConfig.provider) {
    case 'razorpay':
      cachedProvider = new RazorpayPaymentProvider()
      break
    case 'bank':
      cachedProvider = new BankPaymentProvider()
      break
    case 'mock':
    default:
      cachedProvider = new MockPaymentProvider()
      break
  }

  return cachedProvider
}
