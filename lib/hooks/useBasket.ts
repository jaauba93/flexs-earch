'use client'

import { useState, useEffect, useCallback } from 'react'

const BASKET_KEY = 'colliers-flex-basket'
const MAX_BASKET = 10

export interface BasketItem {
  id: string
  name: string
  address_street: string
  address_city: string
  address_district: string | null
  main_image_url: string | null
  slug: string
  address_postcode: string
}

export function useBasket() {
  const [items, setItems] = useState<BasketItem[]>([])
  const [mounted, setMounted] = useState(false)

  const syncFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(BASKET_KEY)
      setItems(stored ? JSON.parse(stored) : [])
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    syncFromStorage()

    function handleBasketUpdate() {
      syncFromStorage()
    }

    window.addEventListener('storage', handleBasketUpdate)
    window.addEventListener('basket:update', handleBasketUpdate)

    return () => {
      window.removeEventListener('storage', handleBasketUpdate)
      window.removeEventListener('basket:update', handleBasketUpdate)
    }
  }, [syncFromStorage])

  const persist = useCallback((next: BasketItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(BASKET_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }, [])

  const addItem = useCallback((item: BasketItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      if (prev.length >= MAX_BASKET) return prev
      const next = [...prev, item]
      try { localStorage.setItem(BASKET_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      try { localStorage.setItem(BASKET_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [])

  const clearBasket = useCallback(() => {
    persist([])
  }, [persist])

  const isInBasket = useCallback((id: string) => items.some((i) => i.id === id), [items])

  return {
    items,
    count: items.length,
    addItem,
    removeItem,
    clearBasket,
    isInBasket,
    isFull: items.length >= MAX_BASKET,
    mounted,
  }
}
