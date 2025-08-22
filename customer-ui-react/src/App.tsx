import React, { Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer, DialogProvider } from '@/components/ui'
import { PageLoading } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'

// Layout Components (will be created later)
import Layout from '@/components/layout/Layout'

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('@/pages/auth/Login'))
const RegisterPage = React.lazy(() => import('@/pages/auth/Register'))
const HomePage = React.lazy(() => import('@/pages/home/Home'))
const MenuPage = React.lazy(() => import('@/pages/menu/MenuList'))
const MenuDetailPage = React.lazy(() => import('@/pages/menu/MenuDetail'))
const CartPage = React.lazy(() => import('@/pages/cart/Cart'))
const CheckoutPage = React.lazy(() => import('@/pages/checkout/Checkout'))
const PaymentPage = React.lazy(() => import('@/pages/payment/PaymentPage'))
const OrdersPage = React.lazy(() => import('@/pages/orders/OrderList'))
const OrderDetailPage = React.lazy(() => import('@/pages/orders/OrderDetail'))
const ProfilePage = React.lazy(() => import('@/pages/profile/Profile'))

// Development tools (only load in development)
const DevToolsPage = React.lazy(() => import('@/pages/dev/DevTools'))

// 404 Page Component
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-default">
    <div className="text-center">
      <div className="text-9xl font-bold text-primary-500 mb-4">404</div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">頁面不存在</h1>
      <p className="text-text-secondary mb-6">
        抱歉，您訪問的頁面不存在或已被移除。
      </p>
      <button 
        onClick={() => window.history.back()}
        className="btn btn-primary mr-4"
      >
        返回上頁
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        className="btn btn-ghost"
      >
        回到首頁
      </button>
    </div>
  </div>
)

// Route Guard for authentication
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  // Import Zustand auth store - checking token, user, and loading state
  const { token, user, isLoading } = useAuthStore((state) => ({
    token: state.token,
    user: state.user,
    isLoading: state.isLoading
  }))
  const location = useLocation()
  
  // Initialize after component mount to allow Zustand hydration
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 500)  // 增加延遲到500ms
    return () => clearTimeout(timer)
  }, [])
  
  // Show loading while initializing or during auth operations
  if (!isInitialized || isLoading) {
    return <PageLoading />
  }
  
  // Check authentication by verifying both token and user exist
  const isAuthenticated = token !== null && user !== null
  
  if (!isAuthenticated) {
    // Redirect to login with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register']

// Main App Component
const App: React.FC = () => {
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  
  // Auth store for application initialization
  const { token, refreshUser } = useAuthStore((state) => ({
    token: state.token,
    refreshUser: state.refreshUser
  }))
  
  // Initialize authentication on app start
  useEffect(() => {
    // If user has a token, refresh their data
    if (token) {
      refreshUser().catch(console.warn)
    }
  }, [token, refreshUser])
  
  // Google Analytics or other tracking
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
      // TODO: Implement Google Analytics tracking
      console.log('Page view:', location.pathname)
    }
  }, [location.pathname])
  
  // App-level keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            // Open search (Ctrl/Cmd + K)
            event.preventDefault()
            console.log('Open search')
            break
          case '/':
            // Focus search (Ctrl/Cmd + /)
            event.preventDefault()
            console.log('Focus search')
            break
        }
      }
      
      // Escape key to close modals
      if (event.key === 'Escape') {
        // This can be handled by individual modal components
        console.log('Escape pressed')
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <DialogProvider>
      <div className="app">
        {/* Toast Notifications */}
        <ToastContainer position="top-center" />
        
        {/* Main Routes */}
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <div className="min-h-screen">
                  <LoginPage />
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <div className="min-h-screen">
                  <RegisterPage />
                </div>
              }
            />
            
            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="menu/:itemId" element={<MenuDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Development Tools Route (only in development) */}
            {import.meta.env.DEV && (
              <Route path="/dev" element={<DevToolsPage />} />
            )}
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </DialogProvider>
  )
}

export default App