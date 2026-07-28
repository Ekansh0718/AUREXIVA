// Supabase Edge Function — verifies a Razorpay Checkout payment server-side.
//
// This is the security-critical piece of the whole integration: Razorpay's
// checkout.js hands the browser a razorpay_signature after a successful
// payment, and ONLY someone holding the Key Secret can compute the correct
// signature for a given (order_id, payment_id) pair. Verifying it here
// (server-side, secret never exposed to the browser) means a user cannot
// fake a "successful payment" by crafting a fake success response client-side.
//
// Deploy: supabase functions deploy verify-payment
// Secrets required: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (same as
// create-payment-order — set once, shared by both functions).
//
// Called from: src/services/payment/providers/razorpay.provider.ts via
// supabase.functions.invoke('verify-payment', { body: {...} }).

// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return json({ error: 'Missing required verification fields.' }, 400)
    }

    // @ts-expect-error -- Deno global
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      return json({ error: 'Razorpay is not configured on the server yet.' }, 500)
    }

    const supabase = createClient(
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) return json({ error: orderError.message }, 500)
    if (!order) return json({ error: 'Order not found or not accessible.' }, 404)

    // The documented Razorpay signature formula: HMAC-SHA256 of
    // "razorpay_order_id|razorpay_payment_id", keyed with the Key Secret.
    const expectedSignature = await hmacSha256Hex(
      razorpayKeySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`
    )

    if (!timingSafeEqual(expectedSignature, razorpay_signature)) {
      return json({
        status: 'failed',
        transactionId: razorpay_payment_id,
        gatewayReference: razorpay_order_id,
        paymentMethod: 'razorpay',
        reason: 'Signature verification failed.',
      })
    }

    return json({
      status: 'success',
      transactionId: razorpay_payment_id,
      gatewayReference: razorpay_order_id,
      paymentMethod: 'razorpay',
    })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
