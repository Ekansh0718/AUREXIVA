// Supabase Edge Function (Deno runtime) — placeholder for the bank's
// server-to-server payment webhook.
//
// NOT DEPLOYED / NOT WIRED UP YET. This exists so the folder structure and
// method shape are ready the moment the bank provides:
//   - Webhook URL to give them (this function's deployed URL)
//   - Webhook Secret (for verifying the signature below)
//
// Deploy with: `supabase functions deploy payment-webhook`
// Set secrets with: `supabase secrets set BANK_WEBHOOK_SECRET=... BANK_SECRET_KEY=...`
// (never as VITE_ variables — those are exposed to the browser)
//
// Why this needs to exist at all: a client can lie about a payment
// succeeding (see the MVP simplification note in
// supabase/migrations/0004_payment.sql). The webhook is the trusted source
// of truth once a real gateway is live — it verifies the bank's signature
// itself and writes the order's payment result using the service-role key,
// independent of anything the browser claims happened.

// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookEvent {
  orderId: string
  transactionId: string
  gatewayReference: string
  status: 'success' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod?: string
}

// TODO(bank-integration): replace with the bank's actual signature scheme
// (HMAC-SHA256 over the raw body using BANK_WEBHOOK_SECRET is typical, but
// follow whatever the bank's docs specify).
function verifySignature(_rawBody: string, _signatureHeader: string | null, _secret: string): boolean {
  // TODO(bank-integration): implement real verification. Returning false by
  // default so this can never accidentally accept unverified events.
  return false
}

// TODO(bank-integration): map the bank's event/status vocabulary onto our
// PaymentStatus values (src/services/payment/payment.types.ts) here.
function parseWebhookPayload(_rawBody: string): WebhookEvent | null {
  // TODO(bank-integration): parse the bank's actual payload shape.
  return null
}

// @ts-expect-error -- Deno global
serve(async (req: Request) => {
  const rawBody = await req.text()
  // TODO(bank-integration): confirm the exact header name the bank signs with.
  const signature = req.headers.get('x-webhook-signature')

  // @ts-expect-error -- Deno global
  const webhookSecret = Deno.env.get('BANK_WEBHOOK_SECRET') ?? ''

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
  }

  const event = parseWebhookPayload(rawBody)
  if (!event) {
    return new Response(JSON.stringify({ error: 'Unrecognized payload' }), { status: 400 })
  }

  const supabase = createClient(
    // @ts-expect-error -- Deno global
    Deno.env.get('SUPABASE_URL') ?? '',
    // @ts-expect-error -- Deno global
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: event.status,
      transaction_id: event.transactionId,
      gateway_reference: event.gatewayReference,
      payment_method: event.paymentMethod ?? null,
      ...(event.status === 'success' ? { status: 'paid' } : {}),
    })
    .eq('id', event.orderId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
