import React from 'react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'

export const TermsOfService: React.FC = () => {
  return (
    <Container className="py-12 sm:py-16 text-left max-w-3xl">
      <SectionTitle title="Terms of Service" subtitle="Last updated: [insert date before publishing]" />

      <div className="mt-8 flex flex-col gap-8 text-sm text-secondary leading-relaxed [&_h2]:text-body [&_h2]:font-semibold [&_h2]:text-primary [&_h2]:mb-2">
        <section>
          <h2>1. Acceptance of terms</h2>
          <p>
            This website is operated by <strong className="text-primary">Aurexiva Product Private Limited</strong>
            {' '}("AUREXIVA", "we", "us"). By creating an account or placing an order on this site, you agree to
            these terms.
          </p>
        </section>

        <section>
          <h2>2. Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity under your account. You must provide accurate information when registering.
          </p>
        </section>

        <section>
          <h2>3. Orders and pricing</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are subject to change without notice. We reserve the
            right to refuse or cancel any order, including in cases of pricing errors or suspected fraud.
          </p>
        </section>

        <section>
          <h2>4. Payment</h2>
          <p>
            Payment is processed by a third-party payment provider. We do not store your full card, UPI, or bank
            details. By placing an order, you authorize us to charge the payment method you provide.
          </p>
        </section>

        <section>
          <h2>5. Shipping and delivery</h2>
          <p>
            Estimated delivery timelines are provided at checkout and are not guaranteed. Risk of loss and title
            for products pass to you upon delivery to the shipping address provided.
          </p>
        </section>

        <section>
          <h2>6. Returns and refunds</h2>
          <p>
            [Insert your actual returns/refund policy here before publishing — window, condition requirements,
            process, and any non-returnable categories.]
          </p>
        </section>

        <section>
          <h2>7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, AUREXIVA is not liable for indirect, incidental, or
            consequential damages arising from your use of this site or your purchase of products.
          </p>
        </section>

        <section>
          <h2>8. Governing law</h2>
          <p>These terms are governed by the laws of India.</p>
        </section>

        <section>
          <h2>9. Contact us</h2>
          <p>
            For any questions about these terms, contact us at{' '}
            <span className="text-primary font-medium">[insert support email before publishing]</span>.
          </p>
        </section>
      </div>
    </Container>
  )
}
