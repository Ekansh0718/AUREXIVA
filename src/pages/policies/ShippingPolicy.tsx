import React from 'react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { usePageMeta } from '@/hooks/usePageMeta'

export const ShippingPolicy: React.FC = () => {
  usePageMeta('Shipping Policy', 'Dispatch times, delivery estimates, and shipping charges at Aurexiva.')

  return (
    <Container className="py-12 sm:py-16 text-left max-w-3xl">
      <SectionTitle title="Shipping Policy" subtitle="Last updated: July 30, 2026" />

      <div className="mt-8 flex flex-col gap-8 text-sm text-secondary leading-relaxed [&_h2]:text-body [&_h2]:font-semibold [&_h2]:text-primary [&_h2]:mb-2">
        <section>
          <h2>1. Shipping coverage</h2>
          <p>We currently ship to addresses across India.</p>
        </section>

        <section>
          <h2>2. Dispatch & delivery times</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Orders are dispatched within 1–2 business days of payment confirmation.</li>
            <li>Delivery typically takes 3–7 business days depending on your location.</li>
            <li>Remote or rural pin codes may take longer.</li>
          </ul>
        </section>

        <section>
          <h2>3. Shipping charges</h2>
          <p>
            Shipping is free on orders above ₹800. Orders below that are charged a flat ₹99 shipping fee, applied
            automatically at checkout.
          </p>
        </section>

        <section>
          <h2>4. Order tracking</h2>
          <p>
            You can check your order status any time from the Orders page in your account. Tracking details, once
            available from our courier partner, will be shared there and by email.
          </p>
        </section>

        <section>
          <h2>5. Delays</h2>
          <p>
            Occasionally, deliveries may be delayed due to weather, courier disruptions, regional restrictions, or
            incorrect/incomplete address details. We'll do our best to keep you informed if this happens.
          </p>
        </section>

        <section>
          <h2>6. Contact us</h2>
          <p>
            For any shipping questions, contact us at{' '}
            <a href="mailto:costomercareaurexiva@gmail.com" className="text-primary font-medium underline">
              costomercareaurexiva@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  )
}
