// Placeholder Supabase Edge Function — will hold the server-side call to
// verify a payment's status directly with the bank (using the secret key),
// once BankPaymentProvider.verifyPayment / getPaymentStatus
// (src/services/payment/providers/bank.provider.ts) is wired to call this.
//
// Expected contract (keep this in sync with BankPaymentProvider):
//   Request:  { orderId: string, transactionId?: string, gatewayReference?: string }
//   Response: { status: 'pending'|'success'|'failed'|'cancelled'|'refunded',
//               transactionId: string, gatewayReference: string, paymentMethod?: string }
//
// NOT DEPLOYED / NOT IMPLEMENTED YET.

// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

// @ts-expect-error -- Deno global
serve(async (_req: Request) => {
  // TODO(bank-integration): Merchant ID, API Key, Secret Key — Deno.env.get(...)
  // TODO(bank-integration): call the bank's transaction-status endpoint
  // TODO(bank-integration): map the bank's status vocabulary onto PaymentStatus
  return new Response(JSON.stringify({ error: 'Not implemented — awaiting bank credentials.' }), {
    status: 501,
  })
})
