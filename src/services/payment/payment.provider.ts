import { paymentConfig } from './payment.config'
import type { IPaymentProvider } from './payment.types'
import { MockPaymentProvider } from './providers/mock.provider'
import { BankPaymentProvider } from './providers/bank.provider'

/**
 * The single place that decides which IPaymentProvider implementation is
 * active, based on `VITE_PAYMENT_PROVIDER`. Everything else in the app goes
 * through `paymentService` (payment.service.ts), which calls this factory —
 * nothing else should import a concrete provider class directly.
 *
 * Switching from the mock provider to the bank's real integration is a
 * one-line env change (`VITE_PAYMENT_PROVIDER=bank`) once bank.provider.ts
 * is filled in — no changes needed here.
 */
let cachedProvider: IPaymentProvider | null = null

export const getPaymentProvider = (): IPaymentProvider => {
  if (cachedProvider) return cachedProvider

  switch (paymentConfig.provider) {
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
