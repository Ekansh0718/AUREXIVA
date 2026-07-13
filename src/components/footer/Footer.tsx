import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, Youtube, ArrowRight, Check } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { AurexivaLogo } from '@/components/common/AurexivaLogo'
import { supabase } from '@/lib/supabase'

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const currentYear = new Date().getFullYear()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('submitting')
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() })

    if (error) {
      // Unique constraint violation = already subscribed; treat as success.
      if (error.code === '23505') {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage('Something went wrong. Please try again.')
        return
      }
    } else {
      setStatus('success')
    }
    setEmail('')
  }

  const shopLinks = [
    { label: 'Footwear', href: '/products?category=footwear' },
    { label: 'Clothing', href: '/products?category=clothing' },
    { label: 'Electronics', href: '/products?category=electronics' },
  ]

  const customerServiceLinks = [
    { label: 'Track Order', href: '/orders' },
  ]

  return (
    <footer className="bg-primary text-white pt-[90px] pb-10 text-left border-t border-primary">
      <Container>
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-[60px] border-b border-white/10">
          {/* Logo and Description */}
          <div className="flex flex-col gap-6 lg:col-span-1.5">
            <div>
              <Link to="/">
                <AurexivaLogo width={52} height={52} showText={true} light={true} />
              </Link>
              <p className="mt-5 text-[16px] text-white/70 max-w-xs leading-relaxed">
                Everything you need. All in one place.
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="flex flex-col gap-5">
            <span className="text-[18px] font-semibold text-white tracking-wide">
              Shop
            </span>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[16px] font-normal text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="flex flex-col gap-5">
            <span className="text-[18px] font-semibold text-white tracking-wide">
              Customer Service
            </span>
            <ul className="flex flex-col gap-3">
              {customerServiceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[16px] font-normal text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col gap-4 lg:col-span-1.25">
            <span className="text-[18px] font-semibold text-white tracking-wide">
              Newsletter
            </span>
            <p className="text-[16px] text-white/70 leading-relaxed max-w-sm">
              Subscribe to get updates on new arrivals and offers.
            </p>
            {status === 'success' ? (
              <p className="flex items-center gap-2 text-[15px] text-white mt-2">
                <Check className="h-4 w-4" /> You're subscribed — thank you.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative w-full mt-2">
                <div className="flex items-center border border-white/20 bg-transparent rounded-sm py-3 px-4 focus-within:border-white/50 transition-all duration-300">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={status === 'submitting'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder:text-white/40 pr-8 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="absolute right-4 text-white hover:text-accent transition-colors duration-200 cursor-pointer disabled:opacity-60"
                    aria-label="Submit"
                  >
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </form>
            )}
            {status === 'error' && (
              <p className="text-[13px] text-error/90">{errorMessage}</p>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[14px] text-white/60 font-normal">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span>© {currentYear} AUREXIVA PRODUCT PRIVATE LIMITED. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/policies/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          <span className="text-[13px] text-white/50 select-none">Secure checkout on every order</span>
        </div>
      </Container>
    </footer>
  )
}
