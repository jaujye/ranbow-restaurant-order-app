import React, { useEffect, useState } from 'react'
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
  color?: string
}

export interface BottomNavProps {
  className?: string
}

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeIndex, setActiveIndex] = useState(0)
  
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
      color: 'from-red-500 to-orange-500',
    },
    {
      id: 'menu',
      label: '菜單',
      path: '/menu',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2IconSolid,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      id: 'cart',
      label: '購物車',
      path: '/cart',
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartIconSolid,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      color: 'from-green-500 to-blue-500',
    },
    {
      id: 'orders',
      label: '訂單',
      path: '/orders',
      icon: ReceiptPercentIcon,
      activeIcon: ReceiptPercentIconSolid,
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 'profile',
      label: '我的',
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
      color: 'from-purple-500 to-pink-500',
    },
  ]
  
  // Update active index when route changes
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => isActive(item.path))
    setActiveIndex(currentIndex !== -1 ? currentIndex : 0)
  }, [location.pathname])
  
  const handleItemClick = (path: string, index: number) => {
    setActiveIndex(index)
    navigate(path)
  }
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Calculate position for active indicator
  const indicatorPosition = (activeIndex / navItems.length) * 100

  return (
    <nav className={cn('bottom-nav safe-bottom', className)}>
      {/* Active indicator background */}
      <div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-base z-10"
        style={{
          transform: `translateX(${indicatorPosition}%)`,
          width: `${100 / navItems.length}%`,
        }}
      />
      
      {/* Navigation items */}
      {navItems.map((item, index) => {
        const active = isActive(item.path)
        const Icon = active ? item.activeIcon : item.icon
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.path, index)}
            className={cn(
              'nav-item group relative',
              active && 'nav-item-active',
              'touch-target-lg',
              // Enhanced hover and focus states
              'focus-visible:ring-2 focus-visible:ring-white/50',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
            )}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            {/* Background glow effect for active item */}
            {active && (
              <div 
                className={cn(
                  'absolute inset-0 rounded-medium opacity-20 blur-sm',
                  `bg-gradient-to-t ${item.color}`
                )}
              />
            )}
            
            {/* Icon container */}
            <div className="relative z-10">
              <div className={cn(
                'relative transition-all duration-base',
                'group-hover:scale-110 group-active:scale-95',
                active && 'scale-110'
              )}>
                <Icon className={cn(
                  'w-6 h-6 transition-colors duration-base',
                  active ? 'text-white' : 'text-white/90'
                )} />
                
                {/* Enhanced badge for cart with animation */}
                {item.badge && item.badge > 0 && (
                  <span className={cn(
                    'cart-badge absolute -top-2 -right-2',
                    'min-w-[20px] h-[20px] flex items-center justify-center',
                    'text-xs font-bold text-white rounded-full px-1',
                    'shadow-medium border-2 border-white',
                    'animate-bounce-gentle',
                    // Dynamic background based on count
                    item.badge > 9 ? 'bg-red-600' : 'bg-red-500',
                    // Scale animation for count changes
                    'transition-transform duration-fast',
                    'hover:scale-110'
                  )}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                
                {/* Ripple effect on active */}
                {active && (
                  <div className={cn(
                    'absolute inset-0 rounded-full',
                    'animate-ping opacity-30',
                    `bg-gradient-to-r ${item.color}`
                  )} />
                )}
              </div>
            </div>
            
            {/* Label with enhanced styling */}
            <span className={cn(
              'text-xs font-medium mt-1 transition-all duration-base relative z-10',
              active ? 'text-white font-semibold' : 'text-white/90',
              'group-hover:text-white',
              // Add letter spacing for better readability
              'tracking-wide'
            )}>
              {item.label}
            </span>
            
            {/* Micro-interaction: Tap feedback */}
            <div className={cn(
              'absolute inset-0 rounded-medium',
              'scale-0 group-active:scale-100',
              'bg-white/10 transition-transform duration-fast'
            )} />
          </button>
        )
      })}
      
      {/* Floating animation indicator */}
      <div 
        className={cn(
          'absolute bottom-full left-0 h-1 rounded-full',
          'bg-gradient-to-r from-white/0 via-white/70 to-white/0',
          'transition-all duration-base ease-out',
          'animate-pulse'
        )}
        style={{
          left: `${(activeIndex / navItems.length) * 100}%`,
          width: `${100 / navItems.length}%`,
        }}
      />
    </nav>
  )
}

export default BottomNav