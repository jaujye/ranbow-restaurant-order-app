import React from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Header from './Header'
import BottomNav from './BottomNav'

export interface LayoutProps {
  showBottomNav?: boolean
  showHeader?: boolean
  className?: string
}

const Layout: React.FC<LayoutProps> = ({
  showBottomNav = true,
  showHeader = true,
  className,
}) => {
  const location = useLocation()
  
  // Pages that should not show bottom navigation
  const hideBottomNavPaths = ['/checkout', '/login', '/register']
  const shouldShowBottomNav = showBottomNav && !hideBottomNavPaths.includes(location.pathname)
  
  // Pages that should not show header
  const hideHeaderPaths = ['/login', '/register']
  const shouldShowHeader = showHeader && !hideHeaderPaths.includes(location.pathname)
  
  // Pages that should not show back button
  const hideBackButtonPaths = ['/']
  const shouldShowBackButton = !hideBackButtonPaths.includes(location.pathname)

  return (
    <div className={cn('app-layout min-h-screen bg-background-default', className)}>
      {/* Header */}
      {shouldShowHeader && <Header showBack={shouldShowBackButton} />}
      
      {/* Main Content */}
      <main
        className={cn(
          'main-content flex-1',
          shouldShowHeader && 'pt-header',
          shouldShowBottomNav && 'pb-bottom-nav',
          // Safe area support for mobile devices
          'safe-left safe-right'
        )}
      >
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      {shouldShowBottomNav && <BottomNav />}
    </div>
  )
}

export default Layout