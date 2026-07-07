import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { ProductCard } from '@/components/product/ProductCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { DUMMY_PRODUCTS } from '@/constants/dummyData'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/utils/animations'

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  const categoryFilter = searchParams.get('category') || ''
  const searchFilter = searchParams.get('search') || ''

  // Trigger brief simulation of loading state when filters change for demonstration
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [categoryFilter, searchFilter])

  const filteredProducts = DUMMY_PRODUCTS.filter((product) => {
    const matchesCategory = categoryFilter
      ? product.category.toLowerCase() === categoryFilter.toLowerCase()
      : true
    const matchesSearch = searchFilter
      ? product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.description.toLowerCase().includes(searchFilter.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    if (query) {
      setSearchParams((prev) => {
        prev.set('search', query)
        return prev
      })
    } else {
      setSearchParams((prev) => {
        prev.delete('search')
        return prev
      })
    }
  }

  const handleClearSearch = () => {
    setSearchParams((prev) => {
      prev.delete('search')
      return prev
    })
  }

  const handleCategorySelect = (category: string) => {
    setSearchParams((prev) => {
      if (category) {
        prev.set('category', category)
      } else {
        prev.delete('category')
      }
      return prev
    })
  }

  const categories = ['Footwear', 'Kids Clothing', 'Electronics']

  return (
    <Container className="py-12 sm:py-16 text-left">
      <SectionTitle
        title="Catalog"
        subtitle="Explore our curated collection of lifestyle essentials. Filter by category or search our catalog."
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start mt-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex flex-col gap-6">
          {/* Search */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Search Catalog</span>
            <SearchInput
              value={searchFilter}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search..."
            />
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Collections</span>
            <div className="flex flex-wrap lg:flex-col gap-2 mt-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`text-xs text-left px-3.5 py-2 font-medium tracking-wide uppercase border transition-all duration-300 rounded-sm cursor-pointer ${
                  !categoryFilter
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-custom bg-white text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat.toLowerCase().replace(' ', '-'))}
                  className={`text-xs text-left px-3.5 py-2 font-medium tracking-wide uppercase border transition-all duration-300 rounded-sm cursor-pointer ${
                    categoryFilter === cat.toLowerCase().replace(' ', '-')
                      ? 'border-primary bg-primary text-white'
                      : 'border-border-custom bg-white text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Catalog Grid */}
        <main className="flex-1 w-full">
          {isLoading ? (
            /* Loading skeletons placeholder */
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3 bg-transparent">
                  <LoadingSkeleton className="aspect-square w-full rounded-premium" />
                  <LoadingSkeleton variant="text" className="h-6 w-2/3 mt-2" />
                  <LoadingSkeleton variant="text" className="h-5 w-1/3" />
                  <LoadingSkeleton variant="text" className="h-4.5 w-1/4 mt-1" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div
              variants={staggerContainer()}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={fadeUp} layout>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Empty State */
            <div className="py-24 text-center border border-dashed border-border-custom rounded-sm">
              <p className="text-body text-secondary">No products found matching your criteria.</p>
              <button
                onClick={() => {
                  handleClearSearch()
                  handleCategorySelect('')
                }}
                className="mt-4 text-xs font-semibold text-primary underline hover:text-accent cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </Container>
  )
}
