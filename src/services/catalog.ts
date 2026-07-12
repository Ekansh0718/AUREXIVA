import { supabase } from '@/lib/supabase'
import type { Category, Product } from '@/types'

interface CategoryRow {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface ProductRow {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  images: string[]
  variants: string[]
  colors: string[]
  is_active: boolean
  category_id: string
  categories: { name: string; slug: string } | null
}

const PRODUCT_SELECT = 'id, name, slug, description, price, images, variants, colors, is_active, category_id, categories(name, slug)'

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  price: row.price,
  description: row.description ?? '',
  image: row.images[0] ?? '',
  category: row.categories?.name ?? '',
  categorySlug: row.categories?.slug ?? '',
  categoryId: row.category_id,
  inStock: row.is_active,
  variants: row.variants ?? [],
  colors: row.colors ?? [],
})

const mapCategory = (row: CategoryRow, count: number): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  image: row.image_url ?? '',
  count,
})

export const fetchCategoriesWithCounts = async (): Promise<Category[]> => {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .order('name')
  if (categoriesError) throw categoriesError

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true)
  if (productsError) throw productsError

  const counts = new Map<string, number>()
  for (const product of (products ?? []) as { category_id: string }[]) {
    counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1)
  }

  return ((categories ?? []) as CategoryRow[]).map((row) => mapCategory(row, counts.get(row.id) ?? 0))
}

interface ProductFilters {
  categorySlug?: string
  search?: string
}

export const fetchProducts = async ({ categorySlug, search }: ProductFilters): Promise<Product[]> => {
  let query = supabase.from('products').select(PRODUCT_SELECT).eq('is_active', true)

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error

  // Filtering an embedded relation (categories.slug) only restricts which
  // related row comes back, not which products match — drop mismatches here.
  const rows = (data ?? []) as unknown as ProductRow[]
  return rows
    .filter((row) => !categorySlug || row.categories?.slug === categorySlug)
    .map(mapProduct)
}

export const fetchBestSellers = async (limit = 5): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('is_best_seller', true)
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as unknown as ProductRow[]).map(mapProduct)
}

export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data ? mapProduct(data as unknown as ProductRow) : null
}

export const fetchRelatedProducts = async (categoryId: string, excludeId: string, limit = 4): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as unknown as ProductRow[]).map(mapProduct)
}
