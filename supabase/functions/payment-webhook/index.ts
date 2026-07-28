// Supabase Edge Function — Razorpay webhook (server-to-server, no browser
// involved). This is the durable source of truth: even if a customer closes
// their browser tab the instant payment finishes (before the client-side
// verify-payment call completes), Razorpay still calls this URL directly and
// the order gets marked paid correctly.
//
// SETUP (do this once credentials/deployment are ready):
//   1. Deploy: supabase functions deploy payment-webhook --no-verify-jwt
//      (--no-verify-jwt because Razorpay calls this directly, with no
//      Supabase auth token — it authenticates via the signature instead)
//   2. Copy the deployed function's URL.
//   3. Razorpay Dashboard -> Settings -> Webhooks -> Add New Webhook:
//        Webhook URL: <the deployed function URL>
//        Active events: payment.captured, payment.failed
//        Secret: generate one and set it below
//   4. supabase secrets set RAZORPAY_WEBHOOK_SECRET=<the secret from step 3>
//      supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<from Project Settings > API>
//
// NOT DEPLOYED YET — deploy once real Razorpay credentials are configured.

// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

// @ts-expect-error -- Deno global
serve(async (req: Request) => {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  // @ts-expect-error -- Deno global
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? ''

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Missing signature or webhook not configured' }), { status: 401 })
  }

  const expectedSignature = await hmacSha256Hex(webhookSecret, rawBody)
  if (!timingSafeEqual(expectedSignature, signature)) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
  }

  let event: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const payment = event.payload?.payment?.entity
  if (!payment) {
    // Not a payment event we care about (e.g. refund/order events) — accept
    // and ignore so Razorpay doesn't retry indefinitely.
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  }

  const razorpayPaymentId = payment.id as string
  const razorpayOrderId = payment.order_id as string
  const notes = (payment.notes ?? {}) as Record<string, string>
  const internalOrderId = notes.order_id

  const status = event.event === 'payment.captured' ? 'success' : event.event === 'payment.failed' ? 'failed' : null
  if (!status) {
    return new Response(JSON.stringify({ received: true, ignored: event.event }), { status: 200 })
  }

  const supabase = createClient(
    // @ts-expect-error -- Deno global
    Deno.env.get('SUPABASE_URL') ?? '',
    // @ts-expect-error -- Deno global
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const updatePayload = {
    payment_status: status,
    transaction_id: razorpayPaymentId,
    gateway_reference: razorpayOrderId,
    payment_method: 'razorpay',
    ...(status === 'success' ? { status: 'paid' } : {}),
  }

  // Prefer correlating via the order_id we stamped into Razorpay order notes
  // at creation time; fall back to matching our stored gateway_reference in
  // case notes weren't preserved.
  const { error } = internalOrderId
    ? await supabase.from('orders').update(updatePayload).eq('id', internalOrderId)
    : await supabase.from('orders').update(updatePayload).eq('gateway_reference', razorpayOrderId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
