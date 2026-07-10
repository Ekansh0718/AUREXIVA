// Placeholder Supabase Edge Function — will hold the server-side call to
// the bank's "create payment/order" API using the secret key
// (Deno.env.get('BANK_SECRET_KEY')), once BankPaymentProvider.initializePayment
// (src/services/payment/providers/bank.provider.ts) is wired to call this
// instead of throwing PaymentProviderNotConfiguredError.
//
// Expected contract (keep this in sync with BankPaymentProvider):
//   Request:  { orderId: string, amount: number, currency: string }
//   Response: { redirectUrl: string, gatewayReference: string }
//
// NOT DEPLOYED / NOT IMPLEMENTED YET.

// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

// @ts-expect-error -- Deno global
serve(async (_req: Request) => {
  // TODO(bank-integration): Merchant ID, API Key, Secret Key — Deno.env.get(...)
  // TODO(bank-integration): call the bank's order-creation endpoint (paymentConfig.gatewayUrl)
  // TODO(bank-integration): return { redirectUrl, gatewayReference }
  return new Response(JSON.stringify({ error: 'Not implemented — awaiting bank credentials.' }), {
    status: 501,
  })
})
