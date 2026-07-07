import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { cn } from '@/utils/cn'

interface CategoryCardProps {
  category: Category
  className?: string
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  return (
    <motion.div
      whileHover="hover"
      initial="initial"
      className={cn(
        'group relative overflow-hidden bg-[#F4F4F2] border border-border-custom rounded-premium aspect-[4/3] w-full',
        className
      )}
    >
      <Link to={`/products?category=${category.slug}`} className="absolute inset-0 flex flex-col justify-between p-8 z-10">
        {/* Background Image */}
        <div className="absolute inset-0 bg-background">
          <motion.img
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.05 },
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Text details at the top-left */}
        <div className="relative text-left z-20">
          <h3 className="text-[22px] font-semibold text-primary tracking-tight leading-tight">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-1 text-[14px] text-secondary font-medium tracking-wide">
              {category.description}
            </p>
          )}
        </div>

        {/* CTA Shop Now Button at the bottom-left */}
        <div className="relative text-left z-20">
          <span className="inline-flex items-center justify-center px-[22px] py-2.5 bg-white text-primary text-[14px] font-semibold rounded-full border border-border-custom shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:bg-[#FAFAF8] active:scale-[0.98] transition-all duration-300">
            Shop Now
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
