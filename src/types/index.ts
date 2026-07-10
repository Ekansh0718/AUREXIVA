export interface Product {
  id: string
  name: string
  slug: string
  price: number
  description: string
  image: string
  category: string
  categorySlug: string
  categoryId: string
  inStock: boolean
  variants: string[]
  rating?: number
  reviewsCount?: number
  isFeatured?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  count?: number
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}
