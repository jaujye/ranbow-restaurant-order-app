import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useCartStore } from '@/store/cartStore'
import {
  HomeIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ReceiptPercentIcon as ReceiptPercentIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  badge?: number
}

export interface BottomNavProps {
  className?: string
}

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 從 Zustand store 獲取購物車項目數量
  const cartItems = useCartStore((state) => state.items)
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: '首頁',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      id: 'menu',
      label: '菜單',
      path: '/menu',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2IconSolid,
    },
    {
      id: 'cart',
      label: '購物車',
      path: '/cart',
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartIconSolid,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      id: 'orders',
      label: '訂單',
      path: '/orders',
      icon: ReceiptPercentIcon,
      activeIcon: ReceiptPercentIconSolid,
    },
    {
      id: 'profile',
      label: '我的',
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ]
  
  const handleItemClick = (path: string) => {
    navigate(path)
  }
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={cn('bottom-nav safe-bottom', className)}>
      {navItems.map((item) => {
        const active = isActive(item.path)
        const Icon = active ? item.activeIcon : item.icon
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.path)}
            className={cn(
              'nav-item',
              active && 'nav-item-active',
              'touch-target-lg'
            )}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              
              {/* Badge for cart */}
              {item.badge && item.badge > 0 && (
                <span className="cart-badge absolute -top-2 -right-2 min-w-[20px] h-[20px] flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full px-1 shadow-sm border border-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            
            <span className="text-xs font-medium mt-1">
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav