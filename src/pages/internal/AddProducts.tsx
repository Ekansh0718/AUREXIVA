import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Input } from '@/components/ui/Input'
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useCategories } from '@/hooks/useCatalog'
import { supabase } from '@/lib/supabase'
import { getErrorMessage } from '@/utils/errors'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

interface DraftProduct {
  key: string
  categoryId: string
  name: string
  slug: string
  slugTouched: boolean
  description: string
  price: string
  images: string
  variants: string
  colors: string
  isBestSeller: boolean
}

const blankRow = (): DraftProduct => ({
  key: crypto.randomUUID(),
  categoryId: '',
  name: '',
  slug: '',
  slugTouched: false,
  description: '',
  price: '',
  images: '',
  variants: '',
  colors: '',
  isBestSeller: false,
})

const parseList = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean)

/**
 * Private bulk-add tool — not linked in any nav, not the client's admin
 * panel (that's explicitly out of MVP scope). Only accounts with
 * profiles.is_admin = true can write via this page; RLS enforces that
 * server-side regardless of what this UI does.
 */
export const AddProducts: React.FC = () => {
  const { user, profile, isLoading: isAuthLoading } = useAuth()
  const { data: categories = [] } = useCategories()
  const [rows, setRows] = useState<DraftProduct[]>([blankRow()])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState<number | null>(null)

  const updateRow = (key: string, patch: Partial<DraftProduct>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const handleNameChange = (key: string, name: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.key === key ? { ...row, name, slug: row.slugTouched ? row.slug : slugify(name) } : row
      )
    )
  }

  const addRow = () => setRows((prev) => [...prev, blankRow()])
  const removeRow = (key: string) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev))

  const handleSaveAll = async () => {
    setError(null)
    setSuccessCount(null)

    const invalidIndex = rows.findIndex(
      (r) => !r.categoryId || !r.name.trim() || !r.slug.trim() || !r.price || Number(r.price) <= 0
    )
    if (invalidIndex >= 0) {
      setError(`Row ${invalidIndex + 1} is missing a category, name, slug, or valid price.`)
      return
    }

    setIsSaving(true)
    try {
      const payload = rows.map((r) => ({
        category_id: r.categoryId,
        name: r.name.trim(),
        slug: r.slug.trim(),
        description: r.description.trim() || null,
        price: Number(r.price),
        images: parseList(r.images),
        variants: parseList(r.variants),
        colors: parseList(r.colors),
        is_best_seller: r.isBestSeller,
        is_active: true,
      }))

      const { error: insertError } = await supabase.from('products').insert(payload)
      if (insertError) throw insertError

      setSuccessCount(payload.length)
      setRows([blankRow()])
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save products.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isAuthLoading) return null

  if (!user || !profile?.is_admin) {
    return (
      <Container className="py-24 text-center">
        <h2 className="text-h2 font-medium text-primary">Not Authorized</h2>
        <p className="mt-2 text-secondary">This page is restricted to store administrators.</p>
        <Link to="/" className="mt-6 inline-flex text-xs font-bold uppercase tracking-wider text-primary underline">
          Back to Home
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-12 sm:py-16 text-left">
      <SectionTitle
        title="Bulk Add Products"
        subtitle="Internal tool — add several products at once. Not visible to customers."
      />

      {successCount !== null && (
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-success bg-success/5 border border-success/20 rounded-sm px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Saved {successCount} product{successCount === 1 ? '' : 's'} successfully.
        </div>
      )}
      {error && (
        <div className="mt-6 text-sm font-medium text-error bg-error/5 border border-error/20 rounded-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {rows.map((row, index) => (
          <div key={row.key} className="bg-white border border-border-custom rounded-premium p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Product {index + 1}</span>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row.key)}
                  className="text-secondary hover:text-error transition-colors cursor-pointer"
                  aria-label="Remove product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium tracking-wider text-primary uppercase">Category</label>
                <select
                  value={row.categoryId}
                  onChange={(e) => updateRow(row.key, { categoryId: e.target.value })}
                  className="flex w-full border border-border-custom bg-white px-3.5 py-2.5 text-body rounded-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select category…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (INR)"
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(e) => updateRow(row.key, { price: e.target.value })}
                placeholder="1999.00"
              />

              <Input
                label="Name"
                value={row.name}
                onChange={(e) => handleNameChange(row.key, e.target.value)}
                placeholder="Terry Stripe Trackpants"
              />

              <Input
                label="Slug"
                value={row.slug}
                onChange={(e) => updateRow(row.key, { slug: slugify(e.target.value), slugTouched: true })}
                placeholder="terry-stripe-trackpants"
                helperText="Must be unique across all products"
              />
            </div>

            <Input
              label="Description"
              value={row.description}
              onChange={(e) => updateRow(row.key, { description: e.target.value })}
              placeholder="Short product description"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wider text-primary uppercase">
                Image URLs (one per line, or comma-separated)
              </label>
              <textarea
                value={row.images}
                onChange={(e) => updateRow(row.key, { images: e.target.value })}
                rows={2}
                placeholder="https://.../photo1.jpg"
                className="flex w-full border border-border-custom bg-white px-3.5 py-2.5 text-body rounded-sm focus:outline-none focus:border-primary resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Sizes (comma-separated)"
                value={row.variants}
                onChange={(e) => updateRow(row.key, { variants: e.target.value })}
                placeholder="M, L, XL, XXL"
              />
              <Input
                label="Colors (comma-separated)"
                value={row.colors}
                onChange={(e) => updateRow(row.key, { colors: e.target.value })}
                placeholder="Black, Grey, Olive"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={row.isBestSeller}
                onChange={(e) => updateRow(row.key, { isBestSeller: e.target.checked })}
              />
              Show in Best Sellers on the homepage
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SecondaryButton onClick={addRow} leftIcon={<Plus className="h-4 w-4" />}>
          Add Another Product
        </SecondaryButton>
        <PrimaryButton onClick={handleSaveAll} isLoading={isSaving} className="sm:ml-auto">
          Save All Products
        </PrimaryButton>
      </div>
    </Container>
  )
}
