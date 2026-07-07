import React from 'react'
import { Link } from 'react-router-dom'
import { User, MapPin, Package, CreditCard, LogOut } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'

export const Profile: React.FC = () => {
  const userMock = {
    name: 'Alexander Mercer',
    email: 'alexander.mercer@stripe.com',
    memberSince: 'July 2026',
    address: '100 Vercel Way, Suite 404, San Francisco, CA 94107',
  }

  return (
    <Container className="py-12 sm:py-16 text-left">
      <SectionTitle title="Account Profile" subtitle="Manage your personal details, shipping addresses, and order history." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mt-8 items-start">
        {/* Sidebar Nav */}
        <aside className="w-full flex flex-col gap-1 border border-border-custom bg-white p-4 rounded-premium">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase bg-background text-primary rounded-full transition-colors duration-200"
          >
            <User className="h-4 w-4" />
            Account Details
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase text-secondary hover:text-primary hover:bg-background rounded-full transition-colors duration-200"
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
        <main className="lg:col-span-3 flex flex-col gap-8">
          {/* Card 1: Account Info */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-secondary" />
              Personal details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-secondary font-medium">
              <div className="flex flex-col gap-1">
                <span>Full Name</span>
                <span className="text-body font-semibold text-primary">{userMock.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Email Address</span>
                <span className="text-body font-semibold text-primary">{userMock.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Membership status</span>
                <span className="text-body font-semibold text-primary">Aurexiva Products Member</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Joined</span>
                <span className="text-body font-semibold text-primary">{userMock.memberSince}</span>
              </div>
            </div>
          </section>

          {/* Card 2: Shipping Info */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary select-none flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-secondary" />
                Default Shipping Address
              </h3>
              <button
                onClick={() => alert('Edit Address clicked')}
                className="text-xs font-semibold text-accent underline hover:text-accent/80 transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="text-xs font-semibold text-primary">
              <p className="leading-relaxed">{userMock.name}</p>
              <p className="mt-1.5 font-medium text-secondary max-w-sm leading-relaxed">
                {userMock.address}
              </p>
            </div>
          </section>

          {/* Card 3: Payment methods mockup */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-secondary" />
              Saved Payment Methods
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium text-secondary">
              <div className="border border-border-custom p-3 rounded-premium bg-background flex items-center gap-3">
                <span className="font-bold text-[10px] tracking-widest text-primary border border-primary px-1 rounded-[4px] uppercase select-none">
                  Visa
                </span>
                <div>
                  <p className="font-semibold text-primary">Visa ending in 4242</p>
                  <p className="text-[10px] text-secondary/70">Expires 12/28</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Container>
  )
}
