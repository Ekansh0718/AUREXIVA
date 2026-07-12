import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

const PRODUCT_SELECT = 'id, name, slug, description, price, images, variants, colors, is_active, category_id, categories(name, slug)'

interface CartRow {
  id: string
  quantity: number
  variant: string | null
  color: string | null
  products: {
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
  } | null
}

export interface CartItem {
  id: string
  product: Product
  variant: string | null
  color: string | null
  quantity: number
}

const mapCartRow = (row: CartRow): CartItem | null => {
  if (!row.products) return null
  const p = row.products
  return {
    id: row.id,
    variant: row.variant,
    color: row.color,
    quantity: row.quantity,
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description ?? '',
      image: p.images[0] ?? '',
      category: p.categories?.name ?? '',
      categorySlug: p.categories?.slug ?? '',
      categoryId: p.category_id,
      inStock: p.is_active,
      variants: p.variants ?? [],
      colors: p.colors ?? [],
    },
  }
}

export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`id, quantity, variant, color, products (${PRODUCT_SELECT})`)
    .eq('user_id', userId)

  if (error) throw error
  return ((data ?? []) as unknown as CartRow[])
    .map(mapCartRow)
    .filter((item): item is CartItem => item !== null)
}

export const addOrIncrementCartItem = async (
  userId: string,
  productId: string,
  variant: string | null,
  color: string | null,
  quantity: number
): Promise<void> => {
  let existing = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)

  existing = variant ? existing.eq('variant', variant) : existing.is('variant', null)
  existing = color ? existing.eq('color', color) : existing.is('color', null)

  const { data: existingRow, error: fetchError } = await existing.maybeSingle()
  if (fetchError) throw fetchError

  if (existingRow) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingRow.quantity + quantity })
      .eq('id', existingRow.id)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('cart_items')
    .insert({ user_id: userId, product_id: productId, variant, color, quantity })
  if (error) throw error
}

export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<void> => {
  const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
  if (error) throw error
}

export const removeCartItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
  if (error) throw error
}
