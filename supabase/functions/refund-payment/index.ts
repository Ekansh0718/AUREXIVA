// Supabase Edge Function — issues a Razorpay refund server-side.
//
// Not wired to any UI yet (there's no admin panel/refund button in the
// MVP), but the payment module's IPaymentProvider.refundPayment
// (razorpay.provider.ts) calls this, so the capability is real and ready
// the moment a refund UI is built — nothing about the payment architecture
// needs to change.
//
// Deploy: supabase functions deploy refund-payment
// Secrets: same RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET as the other functions.

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
    const { orderId, transactionId, amount, reason } = await req.json()
    if (!orderId || !transactionId) {
      return json({ error: 'orderId and transactionId are required' }, 400)
    }

    // @ts-expect-error -- Deno global
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    // @ts-expect-error -- Deno global
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeyId || !razorpayKeySecret) {
      return json({ error: 'Razorpay is not configured on the server yet.' }, 500)
    }

    // Ownership check: only the order's own user (or, once it exists, an
    // admin) may trigger a refund for it. Scoped via the caller's own JWT so
    // RLS (orders_select_own) naturally restricts this to their own orders.
    const scopedSupabase = createClient(
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: order, error: orderError } = await scopedSupabase
      .from('orders')
      .select('id, transaction_id, payment_status')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) return json({ error: orderError.message }, 500)
    if (!order) return json({ error: 'Order not found or not accessible.' }, 404)
    if (order.transaction_id !== transactionId) {
      return json({ error: 'transactionId does not match this order.' }, 400)
    }
    if (order.payment_status !== 'success') {
      return json({ error: 'Only successfully paid orders can be refunded.' }, 409)
    }

    const razorpayRes = await fetch(`https://api.razorpay.com/v1/payments/${transactionId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        ...(amount ? { amount: Math.round(amount * 100) } : {}),
        notes: { order_id: orderId, reason: reason ?? '' },
      }),
    })

    const refund = await razorpayRes.json()
    if (!razorpayRes.ok) {
      return json({ error: refund?.error?.description ?? 'Refund failed.' }, 502)
    }

    // The order's status just moved from 'paid' to 'refunded' — outside what
    // the client-scoped RLS policy permits (it only allows writes while
    // `status = 'pending'`), so this specific write uses the service role,
    // now that ownership + payment state have already been verified above.
    const serviceSupabase = createClient(
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-expect-error -- Deno global
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    await serviceSupabase.from('orders').update({ payment_status: 'refunded' }).eq('id', orderId)

    return json({ success: true, refundId: refund.id })
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
