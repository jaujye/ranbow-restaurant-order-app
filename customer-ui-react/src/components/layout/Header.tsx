import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  ArrowLeftIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid'

export interface HeaderProps {
  title?: string
  showBack?: boolean
  showProfile?: boolean
  showNotifications?: boolean
  showMenu?: boolean
  onMenuClick?: () => void
  className?: string
  actions?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  showProfile = true, 
  showNotifications = true,
  showMenu = false,
  onMenuClick,
  className,
  actions,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasNotifications] = useState(true) // Mock notification state
  
  // Auto-generate title based on current route if not provided
  const routeTitles: Record<string, string> = {
    '/': 'Ranbow Restaurant',
    '/menu': '菜單',
    '/cart': '購物車',
    '/checkout': '結帳',
    '/orders': '我的訂單',
    '/profile': '個人資料',
    '/payment': '付款',
  }
  
  const currentTitle = title || routeTitles[location.pathname] || 'Ranbow Restaurant'
  
  // Track scroll state for dynamic header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 10)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close dropdown when route changes
  useEffect(() => {
    setShowUserDropdown(false)
  }, [location.pathname])
  
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }
  
  const handleProfileClick = () => {
    setShowUserDropdown(!showUserDropdown)
  }
  
  const handleLogout = () => {
    // TODO: Implement logout logic with Zustand
    setShowUserDropdown(false)
    navigate('/login')
  }
  
  const handleDropdownItemClick = (path: string) => {
    navigate(path)
    setShowUserDropdown(false)
  }

  return (
    <header className={cn(
      'top-nav',
      // Dynamic styling based on scroll state
      {
        'shadow-rainbow-lg backdrop-blur-xl': isScrolled,
        'shadow-large backdrop-blur-md': !isScrolled,
      },
      // Responsive improvements
      'transition-all duration-base',
      className
    )}>
      {/* Left Section */}
      <div className="nav-left">
        {showMenu && (
          <button
            onClick={onMenuClick}
            className={cn(
              'nav-btn touch-target-lg group',
              'hover:scale-105 active:scale-95',
              'focus-visible:ring-2 focus-visible:ring-white/50'
            )}
            aria-label="開啟選單"
          >
            <Bars3Icon className="w-5 h-5 transition-transform group-hover:rotate-180" />
          </button>
        )}
        
        {showBack && !showMenu && (
          <button
            onClick={handleBack}
            className={cn(
              'nav-btn touch-target-lg group',
              'hover:scale-105 active:scale-95',
              'focus-visible:ring-2 focus-visible:ring-white/50'
            )}
            aria-label="返回"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </button>
        )}
      </div>
      
      {/* Center Section */}
      <div className="nav-center">
        <h1 className={cn(
          'nav-title text-lg font-bold text-white truncate',
          'transition-all duration-base',
          // Responsive text sizing
          'sm:text-xl lg:text-2xl',
          // Enhanced typography
          'tracking-wide'
        )}>
          {currentTitle}
        </h1>
      </div>
      
      {/* Right Section */}
      <div className="nav-right">
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
        
        {showNotifications && (
          <button
            className={cn(
              'nav-btn touch-target-lg relative group',
              'hover:scale-105 active:scale-95',
              'focus-visible:ring-2 focus-visible:ring-white/50'
            )}
            aria-label="通知"
          >
            <BellIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
            {/* Enhanced notification badge */}
            {hasNotifications && (
              <span className={cn(
                'notification-badge absolute -top-1 -right-1',
                'w-3 h-3 bg-red-500 rounded-full',
                'border-2 border-white',
                'animate-bounce-gentle'
              )}>
                <span className="sr-only">有新通知</span>
              </span>
            )}
          </button>
        )}
        
        {showProfile && (
          <div className="user-menu-container relative">
            <button
              onClick={handleProfileClick}
              className={cn(
                'nav-btn user-menu-btn touch-target-lg group',
                'flex items-center gap-1',
                'hover:scale-105 active:scale-95',
                'focus-visible:ring-2 focus-visible:ring-white/50',
                showUserDropdown && 'bg-white/20 backdrop-blur-sm'
              )}
              aria-label="用戶選單"
              aria-expanded={showUserDropdown}
            >
              {showUserDropdown ? (
                <UserCircleIconSolid className="w-6 h-6 transition-transform" />
              ) : (
                <UserCircleIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
              )}
              <ChevronDownIcon 
                className={cn(
                  'w-4 h-4 transition-all duration-base',
                  showUserDropdown && 'rotate-180 scale-110'
                )}
              />
            </button>
            
            {/* Enhanced User Dropdown */}
            {showUserDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-dropdown bg-black/20 backdrop-blur-sm"
                  onClick={() => setShowUserDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div className={cn(
                  'user-dropdown absolute right-0 top-full mt-3 w-72',
                  'bg-white/95 backdrop-blur-xl rounded-large',
                  'shadow-rainbow-lg border border-white/20',
                  'z-popover overflow-hidden',
                  'animate-slide-up'
                )}>
                  {/* Close button for mobile */}
                  <button
                    onClick={() => setShowUserDropdown(false)}
                    className="absolute top-3 right-3 p-1 rounded-medium hover:bg-gray-100 transition-colors md:hidden"
                    aria-label="關閉選單"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {/* User Info */}
                  <div className="dropdown-header p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                    <div className="user-info">
                      <div className="user-avatar mb-3 flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-medium">
                          U
                        </div>
                      </div>
                      <div className="user-name text-center font-semibold text-gray-800 mb-1">
                        用戶名稱
                      </div>
                      <div className="user-email text-center text-sm text-gray-600">
                        user@example.com
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="dropdown-menu p-3">
                    <button
                      onClick={() => handleDropdownItemClick('/profile')}
                      className={cn(
                        'dropdown-item w-full flex items-center gap-4 px-4 py-3',
                        'text-left hover:bg-gray-50 rounded-medium',
                        'transition-colors duration-fast',
                        'focus-visible:ring-2 focus-visible:ring-primary-500/50'
                      )}
                    >
                      <UserCircleIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-800">個人資料</div>
                        <div className="text-xs text-gray-500">編輯個人信息</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDropdownItemClick('/orders')}
                      className={cn(
                        'dropdown-item w-full flex items-center gap-4 px-4 py-3',
                        'text-left hover:bg-gray-50 rounded-medium',
                        'transition-colors duration-fast',
                        'focus-visible:ring-2 focus-visible:ring-primary-500/50'
                      )}
                    >
                      <BellIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-800">我的訂單</div>
                        <div className="text-xs text-gray-500">查看訂單記錄</div>
                      </div>
                    </button>
                    
                    <div className="dropdown-divider border-t border-gray-100 my-3"></div>
                    
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'dropdown-item logout-item w-full flex items-center gap-4 px-4 py-3',
                        'text-left text-red-600 hover:bg-red-50 rounded-medium',
                        'transition-colors duration-fast',
                        'focus-visible:ring-2 focus-visible:ring-red-500/50'
                      )}
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">登出</div>
                        <div className="text-xs text-red-500">退出當前帳戶</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header