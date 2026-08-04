import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { usePageMeta } from '@/hooks/usePageMeta'

export const ReturnRefundPolicy: React.FC = () => {
  usePageMeta('Return & Refund Policy', 'Our return window, eligibility, and refund process at Aurexiva.')

  return (
    <Container className="py-12 sm:py-16 text-left max-w-3xl">
      <SectionTitle title="Return & Refund Policy" subtitle="Last updated: July 30, 2026" />

      <div className="mt-8 flex flex-col gap-8 text-sm text-secondary leading-relaxed [&_h2]:text-body [&_h2]:font-semibold [&_h2]:text-primary [&_h2]:mb-2">
        <section>
          <h2>1. Return window</h2>
          <p>
            You may request a return within 5 days of delivery, for eligible categories only (see below).
            Requests made after this window cannot be accepted.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Item must be unused, with all original tags attached.</li>
            <li>Item must be returned in its original packaging.</li>
            <li>Proof of purchase (order ID) is required.</li>
          </ul>
        </section>

        <section>
          <h2>3. Non-returnable items</h2>
          <p>
            <strong className="text-primary">Footwear and clothing are not eligible for return</strong> under any
            circumstances, except where the item arrives damaged or defective (see Section 7). Only items in our
            electronics category are eligible for return under this policy.
          </p>
        </section>

        <section>
          <h2>4. How to request a return</h2>
          <p>
            Go to Order History from your account, select the order, and contact us with your order ID and reason
            for return using the details on our{' '}
            <Link to="/contact" className="text-primary font-medium underline">
              Contact page
            </Link>
            . We'll confirm eligibility and share return instructions.
          </p>
        </section>

        <section>
          <h2>5. Return shipping</h2>
          <p>
            If the return is due to a defective, damaged, or incorrect item, we cover return shipping. For all
            other eligible returns (e.g. change of mind), return shipping is the customer's responsibility.
          </p>
        </section>

        <section>
          <h2>6. Refunds</h2>
          <p>
            Once we receive and inspect the returned item, refunds are processed online — to your original
            payment method for prepaid orders, or via UPI/bank transfer for Cash on Delivery orders (we'll request
            your details when processing the return). No cash refunds are issued.
          </p>
        </section>

        <section>
          <h2>7. Damaged or defective items</h2>
          <p>
            If your order arrives damaged or defective, contact us within 48 hours of delivery with photos of the
            item and packaging, and we'll arrange a replacement or full refund at no cost to you.
          </p>
        </section>

        <section>
          <h2>8. Contact us</h2>
          <p>
            For any return or refund questions, contact us at{' '}
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
