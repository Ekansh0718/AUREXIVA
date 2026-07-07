import type { Variants } from 'framer-motion'

// Apple/Stripe-like smooth custom ease-out curve
export const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: premiumEase },
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: premiumEase },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: premiumEase },
  },
}

export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const hoverLift = {
  y: -4,
  transition: { duration: 0.3, ease: premiumEase },
}
