import { useQuery } from '@tanstack/react-query'
import {
  fetchBestSellers,
  fetchCategoriesWithCounts,
  fetchProductBySlug,
  fetchProducts,
  fetchRelatedProducts,
} from '@/services/catalog'

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesWithCounts,
  })

export const useProducts = (filters: { categorySlug?: string; search?: string }) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  })

export const useBestSellers = (limit = 5) =>
  useQuery({
    queryKey: ['products', 'best-sellers', limit],
    queryFn: () => fetchBestSellers(limit),
  })

export const useProduct = (slug: string | undefined) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug as string),
    enabled: Boolean(slug),
  })

export const useRelatedProducts = (categoryId: string | undefined, excludeId: string | undefined) =>
  useQuery({
    queryKey: ['products', 'related', categoryId, excludeId],
    queryFn: () => fetchRelatedProducts(categoryId as string, excludeId as string),
    enabled: Boolean(categoryId && excludeId),
  })
