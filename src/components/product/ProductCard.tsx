import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatPrice } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface ProductCardProps {
  product: Product
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group flex flex-col text-left bg-transparent transition-all duration-300',
        className
      )}
    >
      <Link to={`/product/${product.slug}`} className="flex flex-col h-full">
        {/* Rounded Image Container (Aspect Ratio 1:1 / Square) */}
        <div className="relative aspect-square w-full overflow-hidden bg-white border border-border-custom rounded-premium flex items-center justify-center p-8 group-hover:shadow-premium transition-all duration-300">
          <motion.img
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.03 },
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain object-center"
            loading="lazy"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px] rounded-premium">
              <Badge variant="secondary" outline>Sold Out</Badge>
            </div>
          )}
        </div>

        {/* Content details sits underneath the image box */}
        <div className="flex flex-col mt-4">
          <h3 className="text-[22px] font-semibold text-primary line-clamp-1 group-hover:text-accent transition-colors duration-200">
            {product.name}
          </h3>
          <p className="mt-1 text-[18px] font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
          
          {/* Star Rating Section */}
          {product.rating && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-secondary font-medium select-none">
              <span className="text-[#C89B3C] text-sm">★</span>
              <span className="text-primary font-semibold">{product.rating}</span>
              {product.reviewsCount !== undefined && (
                <span className="text-secondary/70 font-normal">({product.reviewsCount})</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
