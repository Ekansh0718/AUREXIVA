import { supabase } from '@/lib/supabase'
import type { CartItem } from '@/services/cart'
import type { PaymentVerificationResult } from '@/services/payment/payment.types'
import { PaymentStatus } from '@/services/payment/payment.types'

export interface ShippingAddress {
  fullName: string
  email: string
  address: string
  city: string
  zip: string
}

export interface OrderItemRecord {
  id: string
  productId: string | null
  productName: string
  variant: string | null
  color: string | null
  unitPrice: number
  quantity: number
}

export interface OrderRecord {
  id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded'
  transactionId: string | null
  gatewayReference: string | null
  paymentMethod: string | null
  shippingAddress: ShippingAddress
  subtotal: number
  total: number
  createdAt: string
  items: OrderItemRecord[]
}

interface OrderRow {
  id: string;
  status: OrderRecord['status'];
  payment_status: OrderRecord['paymentStatus'];
  transaction_id: string | null;
  gateway_reference: string | null;
  payment_method: string | null;
  shipping_address: Record<string, unknown>;
  subtotal: number;
  total: number;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string;
  variant: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
}

const mapOrderItem = (row: OrderItemRow): OrderItemRecord => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  variant: row.variant,
  color: row.color,
  unitPrice: row.unit_price,
  quantity: row.quantity,
})

const mapOrder = (row: OrderRow, items: OrderItemRow[]): OrderRecord => ({
  id: row.id,
  status: row.status,
  paymentStatus: row.payment_status,
  transactionId: row.transaction_id,
  gatewayReference: row.gateway_reference,
  paymentMethod: row.payment_method,
  shippingAddress: row.shipping_address as unknown as ShippingAddress,
  subtotal: row.subtotal,
  total: row.total,
  createdAt: row.created_at,
  items: items.map(mapOrderItem),
})

/** Creates the order + order_items rows for the current cart. Payment has
 *  not happened yet — both `status` and `payment_status` start `pending`. */
export const createOrder = async (
  userId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
  subtotal: number,
  total: number
): Promise<OrderRecord> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      shipping_address: shippingAddress as unknown as Record<string, unknown>,
      subtotal,
      total,
    })
    .select('id, status, payment_status, transaction_id, gateway_reference, payment_method, shipping_address, subtotal, total, created_at')
    .single()

  if (orderError) throw orderError
  const orderRow = order as unknown as OrderRow

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(
      items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.product.id,
        product_name: item.product.name,
        variant: item.variant,
        color: item.color,
        unit_price: item.product.price,
        quantity: item.quantity,
      }))
    )
    .select('id, product_id, product_name, variant, color, unit_price, quantity')

  if (itemsError) throw itemsError

  return mapOrder(orderRow, (orderItems ?? []) as unknown as OrderItemRow[])
}

/** Writes a payment provider's result back onto the order.
 *
 * MVP SIMPLIFICATION: called directly from the client (see RLS policy
 * `orders_update_own_pending_payment` for why). Once a real gateway with a
 * server-verifiable webhook exists, this write should happen inside
 * supabase/functions/payment-webhook instead, and this client-side call
 * should be removed. */
export const updateOrderPaymentResult = async (
  orderId: string,
  result: PaymentVerificationResult
): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: result.status,
      transaction_id: result.transactionId,
      gateway_reference: result.gatewayReference,
      payment_method: result.paymentMethod ?? null,
      ...(result.status === PaymentStatus.SUCCESS ? { status: 'paid' as const } : {}),
    })
    .eq('id', orderId)

  if (error) throw error
}

export const getOrder = async (orderId: string): Promise<OrderRecord | null> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, payment_status, transaction_id, gateway_reference, payment_method, shipping_address, subtotal, total, created_at')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError) throw orderError
  if (!order) return null

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, product_id, product_name, variant, color, unit_price, quantity')
    .eq('order_id', orderId)

  if (itemsError) throw itemsError

  return mapOrder(order as unknown as OrderRow, (items ?? []) as unknown as OrderItemRow[])
}

export const fetchUserOrders = async (userId: string): Promise<OrderRecord[]> => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, status, payment_status, transaction_id, gateway_reference, payment_method, shipping_address, subtotal, total, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ordersError) throw ordersError
  const orderRows = (orders ?? []) as unknown as OrderRow[]
  if (orderRows.length === 0) return []

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, product_name, variant, color, unit_price, quantity')
    .in('order_id', orderRows.map((o) => o.id))

  if (itemsError) throw itemsError
  const itemRows = (items ?? []) as unknown as (OrderItemRow & { order_id: string })[]

  return orderRows.map((row) => mapOrder(row, itemRows.filter((item) => item.order_id === row.id)))
}
