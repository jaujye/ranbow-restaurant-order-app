import React, { useEffect, useState } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Header from './Header'
import BottomNav from './BottomNav'
import { AccessibilityProvider } from './AccessibilityProvider'

export interface LayoutProps {
  showBottomNav?: boolean
  showHeader?: boolean
  className?: string
}

// Hook to detect device type and screen size
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 640 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    // Use passive listener for better performance
    window.addEventListener('resize', handleResize, { passive: true })
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      // Delay to allow screen to rotate
      setTimeout(handleResize, 100)
    }, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return screenSize
}

const Layout: React.FC<LayoutProps> = ({
  showBottomNav = true,
  showHeader = true,
  className,
}) => {
  const location = useLocation()
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  // Pages that should not show bottom navigation
  const hideBottomNavPaths = ['/checkout', '/login', '/register']
  const shouldShowBottomNav = showBottomNav && !hideBottomNavPaths.includes(location.pathname)
  
  // Pages that should not show header
  const hideHeaderPaths = ['/login', '/register']
  const shouldShowHeader = showHeader && !hideHeaderPaths.includes(location.pathname)
  
  // Pages that should not show back button
  const hideBackButtonPaths = ['/']
  const shouldShowBackButton = !hideBackButtonPaths.includes(location.pathname)

  // Set CSS custom properties for dynamic sizing
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--is-mobile', isMobile ? '1' : '0')
    root.style.setProperty('--is-tablet', isTablet ? '1' : '0')
    root.style.setProperty('--is-desktop', isDesktop ? '1' : '0')
  }, [isMobile, isTablet, isDesktop])

  // Dynamic layout classes based on device type
  const layoutClasses = cn(
    // Base layout
    'app-layout min-h-screen bg-background-default',
    'relative overflow-hidden',
    
    // Responsive adjustments
    {
      // Mobile-specific styling
      'mobile-layout': isMobile,
      // Tablet-specific styling  
      'tablet-layout': isTablet,
      // Desktop-specific styling
      'desktop-layout': isDesktop,
    },
    
    className
  )

  const mainContentClasses = cn(
    // Base content styling
    'main-content flex-1 relative',
    'overflow-auto overscroll-contain',
    
    // Dynamic padding based on navigation presence
    shouldShowHeader && 'pt-header',
    shouldShowBottomNav && isMobile && 'pb-bottom-nav',
    
    // Safe area support for mobile devices
    'safe-left safe-right',
    
    // Responsive content container - 手機版縮小間距
    {
      // Mobile: 縮小padding改善視覺空間
      'px-2': isMobile,
      // Tablet: constrained width with more padding
      'px-6 max-w-4xl mx-auto': isTablet,
      // Desktop: max width with sidebar potential
      'px-8 max-w-6xl mx-auto': isDesktop,
    },
    
    // Smooth transitions
    'transition-all duration-base'
  )

  return (
    <AccessibilityProvider>
      <div 
        className={layoutClasses}
        role="application"
        aria-label="Ranbow Restaurant 點餐應用程式"
      >
        {/* Background decoration for larger screens */}
        {!isMobile && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-100/50 to-accent-100/50 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary-100/50 to-primary-100/50 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          </div>
        )}
        
        {/* Header - responsive behavior */}
        {shouldShowHeader && (
          <Header 
            showBack={shouldShowBackButton}
            className={cn(
              'transition-all duration-base',
              {
                // Mobile header styling - 縮小間距
                'px-2': isMobile,
                // Tablet/Desktop header styling
                'px-6': !isMobile,
              }
            )}
          />
        )}
        
        {/* Main Content Area */}
        <main 
          className={mainContentClasses}
          id="main-content"
          role="main"
          aria-label="主要內容區域"
          tabIndex={-1}
        >
          {/* Content wrapper for better responsive behavior */}
          <div className={cn(
            'content-wrapper w-full',
            // Responsive spacing - 手機版縮小垂直間距
            {
              'py-2': isMobile,
              'py-6': isTablet,
              'py-8': isDesktop,
            }
          )}>
            <Outlet />
          </div>
        </main>
        
        {/* Bottom Navigation - mobile only by default */}
        {shouldShowBottomNav && (
          <nav 
            className={cn(
              'transition-all duration-base',
              {
                // Hide on desktop unless explicitly shown
                'lg:hidden': !isDesktop,
                // Mobile styling - 進一步縮小間距
                'px-1': isMobile,
                // Tablet styling
                'px-4': isTablet,
              }
            )}
            role="navigation"
            aria-label="主要導航"
          >
            <BottomNav />
          </nav>
        )}
        
        {/* Desktop sidebar navigation (future enhancement) */}
        {isDesktop && shouldShowBottomNav && (
          <aside 
            className="fixed left-0 top-header bottom-0 w-64 bg-white/95 backdrop-blur-lg border-r border-border-light shadow-medium transform -translate-x-full transition-transform duration-base hover:translate-x-0 z-fixed hidden"
            role="complementary"
            aria-label="側邊欄導航"
          >
            <nav className="p-6" role="navigation" aria-label="桌面端導航">
              <div className="text-sm font-medium text-text-secondary mb-4">
                Navigation
              </div>
              {/* Desktop navigation items would go here */}
            </nav>
          </aside>
        )}
        
        {/* Floating elements container */}
        <div 
          className="floating-elements-container fixed inset-0 pointer-events-none z-toast"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Future: Toast notifications, FAB buttons, etc. */}
        </div>
      </div>
    </AccessibilityProvider>
  )
}

export default Layout