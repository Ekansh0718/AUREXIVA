import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { PrimaryButton } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ProductCard } from '@/components/product/ProductCard'
import { useProduct, useRelatedProducts } from '@/hooks/useCatalog'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/format'

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isFetched } = useProduct(slug)
  const { data: relatedProducts = [] } = useRelatedProducts(product?.categoryId, product?.id)
  const { addItem } = useCart()

  const [selectedSize, setSelectedSize] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  if (isLoading) {
    return (
      <Container className="py-8 sm:py-16 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <LoadingSkeleton className="aspect-[4/5] w-full rounded-premium" />
          <div className="flex flex-col gap-4">
            <LoadingSkeleton variant="text" className="h-4 w-24" />
            <LoadingSkeleton variant="text" className="h-10 w-2/3" />
            <LoadingSkeleton variant="text" className="h-6 w-1/4" />
            <LoadingSkeleton className="h-24 w-full mt-4" />
          </div>
        </div>
      </Container>
    )
  }

  if (isFetched && !product) {
    return (
      <Container className="py-24 text-center">
        <h2 className="text-h2 font-medium text-primary">Product Not Found</h2>
        <p className="mt-2 text-secondary">The item you are looking for does not exist in our catalog.</p>
        <Link to="/products" className="mt-6 inline-flex text-xs font-bold uppercase tracking-wider text-primary underline">
          Back to Catalog
        </Link>
      </Container>
    )
  }

  if (!product) return null

  const sizes = product.variants

  const handleAddToCart = async () => {
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size.')
      return
    }
    setIsAdding(true)
    try {
      await addItem(product, selectedSize || null, 1)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Container className="py-8 sm:py-16 text-left">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-secondary hover:text-primary transition-colors duration-200 mb-8 select-none"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-background border border-border-custom rounded-premium">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px] rounded-premium">
              <Badge variant="secondary" outline>Sold Out</Badge>
            </div>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent select-none">
              {product.category}
            </span>
            <h1 className="mt-2 text-h1 font-medium tracking-tight text-primary leading-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-h3 font-medium text-primary">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="border-t border-b border-border-custom py-6">
            <p className="text-body text-secondary leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-primary">Select Size</span>
                <span className="text-secondary/70">Size Guide</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 text-xs font-semibold tracking-wider border rounded-full transition-all duration-300 cursor-pointer ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-custom bg-white text-secondary hover:border-primary hover:text-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <PrimaryButton
            size="lg"
            isLoading={isAdding}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full mt-4"
          >
            {product.inStock ? 'Add to Bag' : 'Out of Stock'}
          </PrimaryButton>

          {/* Shipping & Support details */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border-custom/50 pt-8 text-xs text-secondary font-medium select-none">
            <div className="flex flex-col gap-2">
              <Truck className="h-5 w-5 text-primary/75" />
              <span className="font-bold text-primary">Free Shipping</span>
              <span>On all orders above $150. Courier dispatch.</span>
            </div>
            <div className="flex flex-col gap-2">
              <RefreshCw className="h-5 w-5 text-primary/75" />
              <span className="font-bold text-primary">Easy Returns</span>
              <span>14-day hassle-free return and exchange policy.</span>
            </div>
            <div className="flex flex-col gap-2">
              <ShieldCheck className="h-5 w-5 text-primary/75" />
              <span className="font-bold text-primary">Quality Assured</span>
              <span>Handcrafted detailing using certified components.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="text-h2 font-bold text-primary tracking-tight mb-10">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </Container>
  )
}
