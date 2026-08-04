import React from 'react'
import { Mail, Phone, Clock, MapPin } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { usePageMeta } from '@/hooks/usePageMeta'

export const Contact: React.FC = () => {
  usePageMeta('Contact Us', 'Get in touch with the Aurexiva support team.')

  return (
    <Container className="py-12 sm:py-16 text-left max-w-3xl">
      <SectionTitle title="Contact Us" subtitle="We're here to help with orders, returns, or anything else." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-start gap-4 bg-white border border-border-custom p-6 rounded-premium">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Email</p>
            <p className="text-sm text-secondary">costomercareaurexiva@gmail.com</p>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-white border border-border-custom p-6 rounded-premium">
          <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Phone</p>
            <p className="text-sm text-secondary">+91 87892 23990</p>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-white border border-border-custom p-6 rounded-premium">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Support Hours</p>
            <p className="text-sm text-secondary">Monday–Friday, 10am–2pm</p>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-white border border-border-custom p-6 rounded-premium">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Registered Office</p>
            <address className="not-italic text-sm text-secondary leading-relaxed">
              Chainpur Mobarakpur, Siwan, Bihar 841203, India
            </address>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-secondary leading-relaxed">
        For order-related questions, it helps to include your order ID — you can find it on the{' '}
        <span className="text-primary font-medium">Orders</span> page in your account.
      </p>
    </Container>
  )
}
