import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MenuItem } from '@/services/api'

export interface CartItem {
  id: string // 臨時ID，用於前端管理
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
  addedAt: Date
}

interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  serviceCharge: number
  totalAmount: number
  isLoading: boolean
  
  // Actions
  addItem: (menuItem: MenuItem, quantity?: number, specialRequests?: string) => void
  removeItem: (itemId: string) => void
  updateItem: (itemId: string, quantity: number, specialRequests?: string) => void
  clearCart: () => void
  calculateTotals: () => void
  
  // Getters
  itemCount: number
  hasItems: boolean
  getItemById: (itemId: string) => CartItem | undefined
  getItemByMenuId: (menuItemId: number) => CartItem | undefined
}

// 税率和服務費配置
const TAX_RATE = 0.05 // 5%
const SERVICE_CHARGE_RATE = 0.10 // 10%

const generateItemId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      serviceCharge: 0,
      totalAmount: 0,
      isLoading: false,

      // Actions
      addItem: (menuItem: MenuItem, quantity = 1, specialRequests) => {
        const state = get()
        
        // 檢查是否已存在相同的商品（包含特殊需求）
        const existingItem = state.items.find(
          item => (item.menuItem.itemId || item.menuItem.id) === (menuItem.itemId || menuItem.id) && item.specialRequests === specialRequests
        )
        
        if (existingItem) {
          // 更新現有商品數量
          get().updateItem(existingItem.id, existingItem.quantity + quantity, specialRequests)
        } else {
          // 添加新商品
          const newItem: CartItem = {
            id: generateItemId(),
            menuItem,
            quantity,
            unitPrice: menuItem.price,
            totalPrice: menuItem.price * quantity,
            specialRequests,
            addedAt: new Date()
          }
          
          set((state) => ({
            items: [...state.items, newItem]
          }))
          
          // 重新計算總金額
          get().calculateTotals()
        }
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter(item => (item.itemId || item.id) !== itemId)
        }))
        
        get().calculateTotals()
      },

      updateItem: (itemId: string, quantity: number, specialRequests) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item => 
            (item.itemId || item.id) === itemId 
              ? {
                  ...item,
                  quantity,
                  totalPrice: item.unitPrice * quantity,
                  specialRequests
                }
              : item
          )
        }))
        
        get().calculateTotals()
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          serviceCharge: 0,
          totalAmount: 0
        })
      },

      calculateTotals: () => {
        const { items } = get()
        
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
        const tax = subtotal * TAX_RATE
        const serviceCharge = subtotal * SERVICE_CHARGE_RATE
        const totalAmount = subtotal + tax + serviceCharge
        
        set({
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          serviceCharge: Math.round(serviceCharge * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100
        })
      },

      // Getters
      get itemCount() {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      get hasItems() {
        return get().items.length > 0
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => (item.itemId || item.id) === itemId)
      },

      getItemByMenuId: (menuItemId: number | string) => {
        return get().items.find(item => (item.menuItem.itemId || item.menuItem.id) === menuItemId)
      }
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        tax: state.tax,
        serviceCharge: state.serviceCharge,
        totalAmount: state.totalAmount
      }),
      onRehydrateStorage: () => (state) => {
        // 重新計算總金額（以防稅率或服務費有變更）
        if (state) {
          state.calculateTotals()
        }
      }
    }
  )
)

// Selectors for convenient access
export const useCart = () => useCartStore((state) => ({
  items: state.items,
  subtotal: state.subtotal,
  tax: state.tax,
  serviceCharge: state.serviceCharge,
  totalAmount: state.totalAmount,
  itemCount: state.itemCount,
  hasItems: state.hasItems,
  isLoading: state.isLoading
}))

export const useCartActions = () => useCartStore((state) => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  updateItem: state.updateItem,
  clearCart: state.clearCart,
  calculateTotals: state.calculateTotals,
  getItemById: state.getItemById,
  getItemByMenuId: state.getItemByMenuId
}))

// 輔助函數
export const formatPrice = (price: number): string => {
  return `NT$ ${price.toLocaleString()}`
}

export const getTaxRate = (): number => TAX_RATE
export const getServiceChargeRate = (): number => SERVICE_CHARGE_RATE