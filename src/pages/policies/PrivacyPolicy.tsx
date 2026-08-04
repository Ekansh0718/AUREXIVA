import React from 'react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'

export const PrivacyPolicy: React.FC = () => {
  return (
    <Container className="py-12 sm:py-16 text-left max-w-3xl">
      <SectionTitle title="Privacy Policy" subtitle="Last updated: July 30, 2026" />

      <div className="mt-8 flex flex-col gap-8 text-sm text-secondary leading-relaxed [&_h2]:text-body [&_h2]:font-semibold [&_h2]:text-primary [&_h2]:mb-2">
        <section>
          <h2>1. Who we are</h2>
          <p>
            This website is operated by <strong className="text-primary">Aurexiva Product Private Limited</strong>
            {' '}("AUREXIVA", "we", "us"), registered at Chainpur Mobarakpur, Siwan, Bihar 841203, India. This
            policy explains what personal data we collect when you use this site, why we collect it, and how you
            can control it.
          </p>
        </section>

        <section>
          <h2>2. Information we collect</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Account information: name and email address, provided at registration.</li>
            <li>Order information: shipping address, order contents, and order history.</li>
            <li>Cart contents, stored either in your account or in your browser if you are not signed in.</li>
            <li>
              Payment information: collected and processed entirely by our payment provider. We do not store your
              card, UPI, or bank details on our servers.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How we use your information</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>To create and manage your account.</li>
            <li>To process, fulfill, and communicate with you about your orders.</li>
            <li>To send you a newsletter, only if you explicitly subscribed, with an unsubscribe option in every email.</li>
            <li>To keep the site secure and prevent fraud.</li>
          </ul>
        </section>

        <section>
          <h2>4. How we protect your information</h2>
          <p>
            Your account is protected by authentication with encrypted password storage. All data is transmitted
            over HTTPS. Access to your order and account data is restricted so that only you can view it.
          </p>
        </section>

        <section>
          <h2>5. Your rights</h2>
          <p>
            You can review and update your account details and default address at any time from your Profile page.
            To request deletion of your account or data, contact us using the details below.
          </p>
        </section>

        <section>
          <h2>6. Contact us</h2>
          <p>
            For any privacy questions, contact us at{' '}
            <a href="mailto:costomercareaurexiva@gmail.com" className="text-primary font-medium underline">
              costomercareaurexiva@gmail.com
            </a>
            , or by post at:
          </p>
          <address className="not-italic mt-2 text-primary font-medium leading-relaxed">
            Aurexiva Product Private Limited<br />
            Chainpur Mobarakpur, Siwan, Bihar 841203, India
          </address>
        </section>
      </div>
    </Container>
  )
}
