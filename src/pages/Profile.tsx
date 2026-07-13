import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, MapPin, Package, CreditCard, LogOut } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Input } from '@/components/ui/Input'
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface AddressFields {
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

const EMPTY_ADDRESS: AddressFields = { line1: '', line2: '', city: '', state: '', postal_code: '', country: '' }

const formatAddress = (address: Record<string, unknown> | null): string | null => {
  if (!address) return null
  const { line1, line2, city, state, postal_code, country } = address as Record<string, string | undefined>
  return [line1, line2, city, state, postal_code, country].filter(Boolean).join(', ') || null
}

export const Profile: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressFields>(EMPTY_ADDRESS)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const openAddressEditor = () => {
    const existing = (profile?.default_address as Partial<AddressFields> | null) ?? {}
    setAddressForm({ ...EMPTY_ADDRESS, ...existing })
    setIsEditingAddress(true)
  }

  const handleSaveAddress = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ default_address: addressForm as unknown as Record<string, unknown> })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      setIsEditingAddress(false)
    } finally {
      setIsSaving(false)
    }
  }

  const fullName = profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || 'Member'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'
  const address = formatAddress(profile?.default_address ?? null)

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
            onClick={handleLogout}
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
                <span className="text-body font-semibold text-primary">{fullName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Email Address</span>
                <span className="text-body font-semibold text-primary">{user?.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Membership status</span>
                <span className="text-body font-semibold text-primary">Aurexiva Products Member</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Joined</span>
                <span className="text-body font-semibold text-primary">{memberSince}</span>
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
                onClick={openAddressEditor}
                className="text-xs font-semibold text-accent underline hover:text-accent/80 transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
            <div className="text-xs font-semibold text-primary">
              {address ? (
                <>
                  <p className="leading-relaxed">{fullName}</p>
                  <p className="mt-1.5 font-medium text-secondary max-w-sm leading-relaxed">{address}</p>
                </>
              ) : (
                <p className="font-medium text-secondary">No default address saved yet.</p>
              )}
            </div>
          </section>

          {/* Card 3: Payment methods mockup */}
          <section className="bg-white border border-border-custom p-6 sm:p-8 rounded-premium hover:shadow-premium transition-all duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-6 select-none flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-secondary" />
              Saved Payment Methods
            </h3>
            <p className="text-xs font-medium text-secondary">
              No saved payment methods yet. Payment details are collected securely at checkout.
            </p>
          </section>
        </main>
      </div>

      <Dialog open={isEditingAddress} onOpenChange={setIsEditingAddress}>
        <DialogContent className="rounded-premium">
          <DialogHeader>
            <DialogTitle>Edit Default Shipping Address</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input
              label="Address Line 1"
              value={addressForm.line1}
              onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
            />
            <Input
              label="Address Line 2 (optional)"
              value={addressForm.line2}
              onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
              />
              <Input
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal Code"
                value={addressForm.postal_code}
                onChange={(e) => setAddressForm((f) => ({ ...f, postal_code: e.target.value }))}
              />
              <Input
                label="Country"
                value={addressForm.country}
                onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <SecondaryButton className="flex-1" onClick={() => setIsEditingAddress(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton className="flex-1" isLoading={isSaving} onClick={handleSaveAddress}>
                Save Address
              </PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
