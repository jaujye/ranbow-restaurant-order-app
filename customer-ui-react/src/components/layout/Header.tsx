import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  ArrowLeftIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'

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
  
  // Auto-generate title based on current route if not provided
  const routeTitles: Record<string, string> = {
    '/': 'Ranbow Restaurant',
    '/menu': '菜單',
    '/cart': '購物車',
    '/checkout': '結帳',
    '/orders': '我的訂單',
    '/profile': '個人資料',
  }
  
  const currentTitle = title || routeTitles[location.pathname] || 'Ranbow Restaurant'
  
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

  return (
    <header className={cn('top-nav', className)}>
      {/* Left Section */}
      <div className="nav-left">
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="nav-btn touch-target"
            aria-label="開啟選單"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        )}
        
        {showBack && !showMenu && (
          <button
            onClick={handleBack}
            className="nav-btn touch-target"
            aria-label="返回"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Center Section */}
      <div className="nav-center">
        <h1 className="nav-title text-lg font-semibold text-text-primary truncate">
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
            className="nav-btn touch-target relative"
            aria-label="通知"
          >
            <BellIcon className="w-5 h-5" />
            {/* Notification badge */}
            <span className="notification-badge absolute -top-1 -right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>
        )}
        
        {showProfile && (
          <div className="user-menu-container relative">
            <button
              onClick={handleProfileClick}
              className="nav-btn user-menu-btn touch-target flex items-center gap-1"
              aria-label="用戶選單"
              aria-expanded={showUserDropdown}
            >
              <UserCircleIcon className="w-6 h-6" />
              <ChevronDownIcon 
                className={cn(
                  'w-4 h-4 transition-transform',
                  showUserDropdown && 'rotate-180'
                )}
              />
            </button>
            
            {/* User Dropdown */}
            {showUserDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-dropdown"
                  onClick={() => setShowUserDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="user-dropdown absolute right-0 top-full mt-2 w-64 bg-white rounded-large shadow-large border border-border-light z-popover">
                  {/* User Info */}
                  <div className="dropdown-header p-4 border-b border-border-light">
                    <div className="user-info">
                      <div className="user-name font-medium text-text-primary">
                        用戶名稱
                      </div>
                      <div className="user-email text-sm text-text-secondary">
                        user@example.com
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="dropdown-menu p-2">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowUserDropdown(false)
                      }}
                      className="dropdown-item w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-medium transition-colors"
                    >
                      <UserCircleIcon className="w-5 h-5 text-text-secondary" />
                      <span>個人資料</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/orders')
                        setShowUserDropdown(false)
                      }}
                      className="dropdown-item w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-medium transition-colors"
                    >
                      <BellIcon className="w-5 h-5 text-text-secondary" />
                      <span>我的訂單</span>
                    </button>
                    
                    <div className="dropdown-divider border-t border-border-light my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-item w-full flex items-center gap-3 px-3 py-2 text-left text-error-500 hover:bg-error-50 rounded-medium transition-colors"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <span>登出</span>
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