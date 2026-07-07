import React from 'react'
import { Link } from 'react-router-dom'
import { Package, User, LogOut, ChevronRight } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils/format'

export const Orders: React.FC = () => {
  // Mock data for order history
  const ordersMock = [
    {
      id: 'ORD-98716',
      date: 'July 5, 2026',
      status: 'shipped' as const,
      total: 350,
      items: [
        { name: 'Studio Over-Ear Headphones', qty: 1 },
      ],
    },
    {
      id: 'ORD-96102',
      date: 'June 20, 2026',
      status: 'delivered' as const,
      total: 220,
      items: [
        { name: 'Classic Leather Sneaker', qty: 1 },
      ],
    },
  ]

  const statusBadges = {
    shipped: <Badge variant="accent">Shipped</Badge>,
    delivered: <Badge variant="success">Delivered</Badge>,
    processing: <Badge variant="secondary">Processing</Badge>,
    cancelled: <Badge variant="error">Cancelled</Badge>,
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
            onClick={() => alert('Log out clicked')}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase text-secondary hover:text-error hover:bg-error/5 rounded-full transition-colors duration-200 cursor-pointer text-left w-full"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          {ordersMock.length > 0 ? (
            ordersMock.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-border-custom p-6 rounded-premium hover:shadow-premium transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                {/* Left side: Order Metadata */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-body font-bold text-primary">{order.id}</span>
                    {statusBadges[order.status]}
                  </div>
                  <div className="text-xs text-secondary/80 font-medium">
                    Ordered on <span className="text-primary font-semibold">{order.date}</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-secondary">
                    Items:{' '}
                    <span className="text-primary font-semibold">
                      {order.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Right side: Summary and button */}
                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-border-custom/50">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Amount</p>
                    <p className="text-btn font-bold text-primary mt-0.5">{formatPrice(order.total)}</p>
                  </div>

                  <button
                    onClick={() => alert(`Showing details for ${order.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors cursor-pointer select-none"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </button>
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
