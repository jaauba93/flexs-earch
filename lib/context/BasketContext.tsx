'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useBasket, BasketItem } from '@/lib/hooks/useBasket'

interface BasketContextValue {
  items: BasketItem[]
  count: number
  addItem: (item: BasketItem) => void
  removeItem: (id: string) => void
  clearBasket: () => void
  isInBasket: (id: string) => boolean
  isFull: boolean
  mounted: boolean
}

const BasketContext = createContext<BasketContextValue | null>(null)

export function BasketProvider({ children }: { children: ReactNode }) {
  const basket = useBasket()
  return <BasketContext.Provider value={basket}>{children}</BasketContext.Provider>
}

export function useBasketContext() {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasketContext must be used within BasketProvider')
  return ctx
}
