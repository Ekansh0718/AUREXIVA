import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  addOrIncrementCartItem,
  fetchCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from '@/services/cart'
import type { Product } from '@/types'

const GUEST_CART_KEY = 'aurexiva_guest_cart'

const readGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

const writeGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

interface CartContextValue {
  items: CartItem[]
  isLoading: boolean
  addItem: (product: Product, variant: string | null, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  subtotal: number
  totalCount: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const hasMergedForUser = useRef<string | null>(null)

  useEffect(() => {
    if (isAuthLoading) return

    const load = async () => {
      setIsLoading(true)
      if (!user) {
        hasMergedForUser.current = null
        setItems(readGuestCart())
        setIsLoading(false)
        return
      }

      if (hasMergedForUser.current !== user.id) {
        const guestItems = readGuestCart()
        for (const guestItem of guestItems) {
          await addOrIncrementCartItem(user.id, guestItem.product.id, guestItem.variant, guestItem.quantity)
        }
        if (guestItems.length > 0) {
          writeGuestCart([])
        }
        hasMergedForUser.current = user.id
      }

      const dbItems = await fetchCartItems(user.id)
      setItems(dbItems)
      setIsLoading(false)
    }

    load()
  }, [user, isAuthLoading])

  const addItem = async (product: Product, variant: string | null, quantity = 1) => {
    if (!user) {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.product.id === product.id && i.variant === variant)
        let next: CartItem[]
        if (existingIndex >= 0) {
          next = prev.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
          )
        } else {
          next = [...prev, { id: crypto.randomUUID(), product, variant, quantity }]
        }
        writeGuestCart(next)
        return next
      })
      return
    }

    await addOrIncrementCartItem(user.id, product.id, variant, quantity)
    setItems(await fetchCartItems(user.id))
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    if (!user) {
      setItems((prev) => {
        const next = prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        writeGuestCart(next)
        return next
      })
      return
    }

    await updateCartItemQuantity(itemId, quantity)
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const removeItem = async (itemId: string) => {
    if (!user) {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== itemId)
        writeGuestCart(next)
        return next
      })
      return
    }

    await removeCartItem(itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const clearCart = async () => {
    if (!user) {
      writeGuestCart([])
      setItems([])
      return
    }

    await Promise.all(items.map((item) => removeCartItem(item.id)))
    setItems([])
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, isLoading, addItem, updateQuantity, removeItem, clearCart, subtotal, totalCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
