/**
 * Payment configuration — reads only from environment variables, never
 * hardcodes credentials.
 *
 * SECURITY BOUNDARY — READ BEFORE ADDING FIELDS HERE:
 * Every `VITE_`-prefixed variable is bundled into the public JS and is
 * readable by anyone who opens devtools, no exceptions. This file is loaded
 * by the browser, so it may only ever hold values that are safe to be
 * public: a merchant/store ID, a *publishable* API key, gateway/redirect
 * URLs. It must NEVER hold a secret key or webhook signing secret.
 *
 * The bank's secret key and webhook secret belong in Supabase Edge Function
 * secrets (`supabase secrets set BANK_SECRET_KEY=...`), read there via
 * `Deno.env.get(...)` — see supabase/functions/payment-webhook. That
 * function is the only place those values may ever be read.
 */

export type PaymentProviderName = 'mock' | 'bank'
export type PaymentEnvironment = 'sandbox' | 'production'

export interface PaymentConfig {
  /** Which IPaymentProvider implementation payment.provider.ts should hand out. */
  provider: PaymentProviderName
  environment: PaymentEnvironment

  // --- Client-safe bank/gateway identifiers ------------------------------
  // TODO(bank-integration): fill these once the bank issues credentials.
  /** Merchant ID issued by the bank. Safe to expose client-side — it
   *  identifies the merchant account, it does not authenticate requests. */
  merchantId: string
  /** Publishable/public API key, if the gateway issues one (distinct from
   *  the secret key — never put a secret key here). */
  publicApiKey: string
  /** The bank's hosted checkout / gateway base URL. */
  gatewayUrl: string

  // --- Redirect URLs the bank will send the browser back to --------------
  /** Where the gateway redirects the browser after payment (success or failure). */
  callbackUrl: string
  /** Some gateways distinguish a generic "return" URL from the callback URL. */
  returnUrl: string
  successUrl: string
  failureUrl: string

  currency: string
}

const readEnv = (value: string | undefined, fallback = ''): string =>
  value && value.length > 0 ? value : fallback

const origin = typeof window !== 'undefined' ? window.location.origin : ''

export const paymentConfig: PaymentConfig = {
  provider: readEnv(import.meta.env.VITE_PAYMENT_PROVIDER, 'mock') as PaymentProviderName,
  environment: readEnv(import.meta.env.VITE_PAYMENT_ENV, 'sandbox') as PaymentEnvironment,

  // TODO(bank-integration): VITE_PAYMENT_MERCHANT_ID
  merchantId: readEnv(import.meta.env.VITE_PAYMENT_MERCHANT_ID),
  // TODO(bank-integration): VITE_PAYMENT_PUBLIC_KEY (publishable key only — never the secret key)
  publicApiKey: readEnv(import.meta.env.VITE_PAYMENT_PUBLIC_KEY),
  // TODO(bank-integration): VITE_PAYMENT_GATEWAY_URL
  gatewayUrl: readEnv(import.meta.env.VITE_PAYMENT_GATEWAY_URL),

  // TODO(bank-integration): VITE_PAYMENT_CALLBACK_URL (defaults to our own callback route)
  callbackUrl: readEnv(import.meta.env.VITE_PAYMENT_CALLBACK_URL, `${origin}/payment/callback`),
  returnUrl: readEnv(import.meta.env.VITE_PAYMENT_RETURN_URL, `${origin}/payment/callback`),
  successUrl: readEnv(import.meta.env.VITE_PAYMENT_SUCCESS_URL, `${origin}/order-confirmation`),
  failureUrl: readEnv(import.meta.env.VITE_PAYMENT_FAILURE_URL, `${origin}/checkout`),

  currency: readEnv(import.meta.env.VITE_PAYMENT_CURRENCY, 'INR'),
}

export const isBankProviderConfigured = (): boolean =>
  Boolean(paymentConfig.merchantId && paymentConfig.publicApiKey && paymentConfig.gatewayUrl)
