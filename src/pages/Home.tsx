import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Headset, 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { Container } from '@/components/common/Container'
import { CategoryCard } from '@/components/category/CategoryCard'
import { ProductCard } from '@/components/product/ProductCard'
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button'
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from '@/constants/dummyData'
import { fadeIn, fadeUp, staggerContainer } from '@/utils/animations'

export const Home: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0)

  // Carousel slider state for Best Sellers (mock scrolling / offset)
  const [scrollIndex, setScrollIndex] = useState(0)

  const handlePrevClick = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextClick = () => {
    setScrollIndex((prev) => Math.min(DUMMY_PRODUCTS.length - 3, prev + 1)) // Mock bounds
  }

  return (
    <div className="flex flex-col bg-background">
      {/* 2. Hero Section (Height: calc(100vh - 88px)) */}
      <section className="relative w-full bg-white border-b border-border-custom overflow-hidden lg:h-[calc(100vh-88px)] flex items-center py-8 lg:py-0">
        <Container className="h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full w-full">
            {/* Left Column */}
            <motion.div
              variants={staggerContainer(0.08, 0.1)}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-start text-left max-w-xl gap-4 xl:gap-6 z-10"
            >
              <motion.span
                variants={fadeIn}
                className="text-[12px] font-semibold uppercase tracking-[0.32em] text-accent select-none"
              >
                Limited Time Offer
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="text-[44px] sm:text-[52px] xl:text-[64px] font-bold tracking-tight text-primary leading-[1.05] font-sans"
              >
                Everything You Need.
                <br />
                All in One Place.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-[16px] sm:text-[18px] xl:text-[20px] font-normal text-secondary leading-[1.6] xl:leading-[1.75] max-w-lg"
              >
                Discover premium quality products across footwear, clothing & electronics – curated for your lifestyle.
              </motion.p>
              
              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-1">
                <Link to="/products">
                  <PrimaryButton size="lg" className="shadow-sm">
                    Shop Now <span className="ml-2">→</span>
                  </PrimaryButton>
                </Link>
                <Link to="/products?category=kids-clothing">
                  <SecondaryButton size="lg">
                    Explore Collections
                  </SecondaryButton>
                </Link>
              </motion.div>

              {/* Customer Rating Panel */}
              <motion.div 
                variants={fadeUp}
                className="flex items-center gap-4 mt-4 select-none"
              >
                <div className="flex -space-x-3.5">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                    alt="User 1"
                  />
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
                    alt="User 2"
                  />
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=100&auto=format&fit=crop"
                    alt="User 3"
                  />
                </div>
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-semibold text-secondary">
                    Trusted by 10,000+ customers
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-primary">
                    <div className="flex text-amber-400">
                      {'★★★★★'.split('').map((char, index) => (
                        <span key={index}>{char}</span>
                      ))}
                    </div>
                    <span>4.8/5</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Editorial Image & Floating Details Card */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-full flex items-center justify-center lg:justify-end py-4 lg:py-6">
              <div className="relative w-full lg:w-[92%] h-full max-h-[620px] rounded-premium overflow-hidden border border-border-custom shadow-[0_4px_30px_rgba(0,0,0,0.01)] bg-[#F5F5F3]">
                {/* Hero Editorial Image */}
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop"
                  alt="Editorial Hero Model"
                  className="w-full h-full object-cover object-top"
                />

                {/* Floating Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-[4px] p-4 pr-6 flex items-center gap-4 rounded-premium shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white/50 max-w-xs sm:max-w-sm select-none"
                >
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <Star className="h-4.5 w-4.5 fill-current" />
                  </div>
                  <div className="flex flex-col text-left flex-1 min-w-0">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      New Arrivals
                    </span>
                    <span className="text-[13px] text-secondary font-medium mt-0.5 truncate">
                      Summer Collection '24
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                </motion.div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-8 left-8 flex gap-2 select-none z-20">
                  <button
                    onClick={() => setActiveSlide(0)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      activeSlide === 0 ? 'bg-primary scale-110' : 'bg-white hover:bg-white/80'
                    }`}
                    aria-label="Slide 1"
                  />
                  <button
                    onClick={() => setActiveSlide(1)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      activeSlide === 1 ? 'bg-primary scale-110' : 'bg-white hover:bg-white/80'
                    }`}
                    aria-label="Slide 2"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Trust Bar (4 columns, Section Padding: 100px) */}
      <section className="py-[100px] border-b border-border-custom bg-white">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 text-left">
            {/* Box 1 */}
            <div className="flex gap-4 items-start pr-4 border-r-0 lg:border-r border-border-custom last:border-r-0">
              <Truck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-primary uppercase tracking-wider">
                  Free Shipping
                </span>
                <span className="text-[14px] text-secondary font-medium mt-1">
                  On orders over $50
                </span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="flex gap-4 items-start pr-4 border-r-0 lg:border-r border-border-custom last:border-r-0">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-primary uppercase tracking-wider">
                  Secure Payments
                </span>
                <span className="text-[14px] text-secondary font-medium mt-1">
                  100% protected
                </span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="flex gap-4 items-start pr-4 border-r-0 lg:border-r border-border-custom last:border-r-0">
              <RotateCcw className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-primary uppercase tracking-wider">
                  Easy Returns
                </span>
                <span className="text-[14px] text-secondary font-medium mt-1">
                  30-day return policy
                </span>
              </div>
            </div>

            {/* Box 4 */}
            <div className="flex gap-4 items-start pr-4 last:border-r-0">
              <Headset className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold text-primary uppercase tracking-wider">
                  24/7 Support
                </span>
                <span className="text-[14px] text-secondary font-medium mt-1">
                  We're here to help
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Shop by Category (Section Padding: 100px, Grid Gap: 32px) */}
      <section className="py-[100px] bg-background">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-10">
            <h2 className="text-[42px] font-bold text-primary tracking-tight">
              Shop by Category
            </h2>
            <Link
              to="/products"
              className="text-[14px] font-semibold uppercase tracking-wider text-primary hover:text-accent flex items-center gap-1.5 transition-colors duration-200"
            >
              View all categories <span className="text-lg">→</span>
            </Link>
          </div>
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-[32px]"
          >
            {DUMMY_CATEGORIES.map((category) => (
              <motion.div key={category.id} variants={fadeUp}>
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* 5. Best Sellers (5 Column Grid, Product Gap: 28px, Carousel Buttons) */}
      <section className="py-[100px] bg-white border-t border-b border-border-custom relative overflow-hidden">
        <Container className="relative">
          <div className="flex items-center justify-between gap-4 mb-10">
            <h2 className="text-[42px] font-bold text-primary tracking-tight">
              Best Sellers
            </h2>
            <Link
              to="/products"
              className="text-[14px] font-semibold uppercase tracking-wider text-primary hover:text-accent flex items-center gap-1.5 transition-colors duration-200"
            >
              View all products <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Slider Container with Left and Right Arrows */}
          <div className="relative">
            {/* Left Circular Navigation Button */}
            <button
              onClick={handlePrevClick}
              disabled={scrollIndex === 0}
              className={`absolute top-1/2 -left-6 z-20 -translate-y-1/2 h-12 w-12 rounded-full bg-white border border-border-custom shadow-premium flex items-center justify-center text-primary hover:bg-[#FAFAF8] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:cursor-not-allowed`}
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Products Row - displaying 5 cards side by side */}
            <motion.div
              variants={staggerContainer()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[28px] transition-transform duration-500 ease-out"
            >
              {DUMMY_PRODUCTS.map((product) => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Right Circular Navigation Button */}
            <button
              onClick={handleNextClick}
              disabled={scrollIndex >= DUMMY_PRODUCTS.length - 5}
              className={`absolute top-1/2 -right-6 z-20 -translate-y-1/2 h-12 w-12 rounded-full bg-white border border-border-custom shadow-premium flex items-center justify-center text-primary hover:bg-[#FAFAF8] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-0 disabled:cursor-not-allowed`}
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </section>

      {/* 6. Promotional Banner (Exclusive Deals, Rounded Corners 22px) */}
      <section className="py-[100px] bg-background">
        <Container>
          <div className="w-full bg-primary text-white rounded-premium overflow-hidden border border-primary relative shadow-premium p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="flex flex-col items-start text-left gap-4 sm:gap-6 z-10 max-w-md">
                <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-accent select-none">
                  Exclusive Deals
                </span>
                <h2 className="text-[42px] sm:text-[48px] font-bold tracking-tight text-white leading-tight">
                  Up to 50% Off On Selected Items
                </h2>
                <button
                  onClick={() => alert('Shop Deals clicked')}
                  className="mt-4 px-[34px] py-[16px] bg-white text-primary text-[16px] font-semibold uppercase tracking-wider rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer shadow-sm"
                >
                  Shop Deals <span className="ml-1">→</span>
                </button>
              </div>

              {/* Right Content: Bags Image & Circular Badge */}
              <div className="relative h-[250px] sm:h-[350px] lg:h-[400px] w-full flex items-center justify-center lg:justify-end">
                <div className="w-full lg:w-[85%] h-full rounded-premium overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"
                    alt="Promotional bags"
                    className="w-full h-full object-cover object-center opacity-85"
                  />
                </div>

                {/* Elegant Circular Badge */}
                <div className="absolute top-6 left-6 lg:left-12 h-[110px] w-[110px] rounded-full border border-white/30 bg-primary/80 backdrop-blur-[2px] flex items-center justify-center flex-col select-none rotate-12 shadow-lg animate-pulse-slow">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Limited
                  </span>
                  <span className="text-[12px] font-bold text-white uppercase tracking-widest mt-0.5">
                    Time Only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
