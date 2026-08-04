import React from 'react'
import { Truck, ShieldCheck, RotateCcw, Headset } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { usePageMeta } from '@/hooks/usePageMeta'

const values = [
  { icon: ShieldCheck, title: 'Quality Assured', description: 'Every product is chosen for craftsmanship that lasts.' },
  { icon: Truck, title: 'Fast Dispatch', description: 'Orders leave our hands within 1–2 business days.' },
  { icon: RotateCcw, title: 'Easy Returns', description: 'A straightforward 5-day return window on eligible items.' },
  { icon: Headset, title: '24/7 Support', description: "We're here to help, whenever you need us." },
]

export const AboutUs: React.FC = () => {
  usePageMeta(
    'About Us',
    'Aurexiva curates handcrafted luxury footwear, organic clothing, and premium electronics for the modern lifestyle.'
  )

  return (
    <Container className="py-12 sm:py-16 text-left max-w-3xl">
      <SectionTitle title="About Aurexiva" subtitle="Everything you need. All in one place." />

      <div className="flex flex-col gap-6 text-sm text-secondary leading-relaxed">
        <p>
          Aurexiva was founded on a simple idea: that everyday essentials — the clothes you wear, the shoes you
          walk in, the electronics you rely on — should feel considered, not disposable. We curate a focused
          collection across footwear, clothing, and electronics, choosing each piece for craftsmanship and quality
          rather than chasing every passing trend.
        </p>
        <p>
          Every order is handled with the same care we'd want for ourselves — from secure checkout, to careful
          packaging, to support that actually helps when something goes wrong. We're a small, growing team, and we
          take that responsibility seriously.
        </p>
        <p>[insert your own brand story, founding year, and mission here before publishing]</p>
      </div>

      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {values.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-start gap-2 text-left">
            <Icon className="h-6 w-6 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</p>
            <p className="text-xs text-secondary leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border-custom">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Registered office</p>
        <address className="not-italic text-sm text-secondary leading-relaxed">
          Aurexiva Product Private Limited<br />
          Chainpur Mobarakpur, Siwan, Bihar 841203, India<br />
          GSTIN: <span className="text-primary font-medium">10ABFCA8055J1ZS</span>
        </address>
      </div>
    </Container>
  )
}
