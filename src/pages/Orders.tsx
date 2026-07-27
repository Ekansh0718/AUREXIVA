import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, User, LogOut, ChevronRight } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Badge } from '@/components/ui/Badge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useAuth } from '@/context/AuthContext'
import { fetchUserOrders, type OrderRecord } from '@/services/orders'
import { formatPrice } from '@/utils/format'

const statusBadge = (order: OrderRecord) => {
  if (order.paymentMethod === 'cod' && order.status === 'pending') {
    return <Badge variant="accent">Cash on Delivery</Badge>
  }
  if (order.paymentStatus === 'failed') return <Badge variant="error">Payment Failed</Badge>
  if (order.paymentStatus === 'cancelled') return <Badge variant="secondary">Cancelled</Badge>
  if (order.paymentStatus === 'refunded') return <Badge variant="secondary">Refunded</Badge>
  switch (order.status) {
    case 'paid':
      return <Badge variant="success">Paid</Badge>
    case 'shipped':
      return <Badge variant="accent">Shipped</Badge>
    case 'delivered':
      return <Badge variant="success">Delivered</Badge>
    case 'cancelled':
      return <Badge variant="error">Cancelled</Badge>
    default:
      return <Badge variant="secondary">Pending Payment</Badge>
  }
}

export const Orders: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchUserOrders(user.id)
      .then(setOrders)
      .finally(() => setIsLoading(false))
  }, [user])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <Container className="py-12 sm:py-16 text-left">
      <SectionTitle title="Order History" subtitle="Track shipments, request return labels, or review your historical transactions." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mt-8 items-start">
        {/* Sidebar Nav */}
        <aside className="w-full flex flex-col gap-1 border border-border-custom bg-white p-4 rounded-premium">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase text-secondary hover:text-primary hover:bg-background rounded-full transition-colors duration-200"
          >
            <User className="h-4 w-4" />
            Account Details
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase bg-background text-primary rounded-full transition-colors duration-200"
          >
            <Package className="h-4 w-4" />
            Order History
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase text-secondary hover:text-error hover:bg-error/5 rounded-full transition-colors duration-200 cursor-pointer text-left w-full"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          {isLoading ? (
            [...Array(2)].map((_, i) => <LoadingSkeleton key={i} className="h-28 w-full rounded-premium" />)
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-border-custom p-6 rounded-premium hover:shadow-premium transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                {/* Left side: Order Metadata */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-body font-bold text-primary">{order.id.slice(0, 8).toUpperCase()}</span>
                    {statusBadge(order)}
                  </div>
                  <div className="text-xs text-secondary/80 font-medium">
                    Ordered on{' '}
                    <span className="text-primary font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-secondary">
                    Items:{' '}
                    <span className="text-primary font-semibold">
                      {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Right side: Summary and button */}
                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-border-custom/50">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Amount</p>
                    <p className="text-btn font-bold text-primary mt-0.5">{formatPrice(order.total)}</p>
                  </div>

                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors cursor-pointer select-none"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center border border-dashed border-border-custom rounded-premium">
              <p className="text-body text-secondary">You haven't placed any orders yet.</p>
              <Link to="/products" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-primary underline">
                Browse our collections
              </Link>
            </div>
          )}
        </main>
      </div>
    </Container>
  )
}
