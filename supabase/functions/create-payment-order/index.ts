// Supabase Edge Function — creates a real Razorpay Order server-side.
//
// Why this has to be a server-side function at all: creating a Razorpay
// Order requires Basic Auth with Key ID + Key Secret, and the amount must
// come from OUR database (not from whatever the browser claims), otherwise
// a tampered client could create a payment for ₹1 against a ₹5,000 order.
//
// Deploy: supabase functions deploy create-payment-order
// Secrets required (set once):
//   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
//   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
//
// Called from: src/services/payment/providers/razorpay.provider.ts via
// supabase.functions.invoke('create-payment-order', { body: { orderId } }).
// The caller's Supabase session JWT is forwarded automatically by
// supabase-js, which is what lets this function scope the order lookup to
// the calling user via RLS below.

// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
// @ts-expect-error -- Deno global, not resolvable by the Vite/Node TS project
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// @ts-expect-error -- Deno global
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return json({ error: 'orderId is required' }, 400)
    }

    // @ts-expect-error -- Deno global
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    // @ts-expect-error -- Deno global
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeyId || !razorpayKeySecret) {
      return json({ error: 'Razorpay is not configured on the server yet.' }, 500)
    }

    // Scope the order lookup to the calling user by forwarding their JWT —
    // RLS (orders_select_own) then guarantees they can only fetch their own
    // order, never anyone else's.
    const supabase = createClient(
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total, status, payment_status')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) return json({ error: orderError.message }, 500)
    if (!order) return json({ error: 'Order not found or not accessible.' }, 404)
    if (order.status !== 'pending' || order.payment_status !== 'pending') {
      return json({ error: 'This order has already been paid or is no longer pending.' }, 409)
    }

    // Razorpay expects the smallest currency unit (paise for INR).
    const amountInPaise = Math.round(order.total * 100)

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.id,
        notes: { order_id: order.id },
      }),
    })

    const razorpayOrder = await razorpayRes.json()
    if (!razorpayRes.ok) {
      return json({ error: razorpayOrder?.error?.description ?? 'Razorpay order creation failed.' }, 502)
    }

    return json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId,
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
