import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from '@/components/ui'
import { PageLoading } from '@/components/ui/Loading'

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
const OrdersPage = React.lazy(() => import('@/pages/orders/OrderList'))
const OrderDetailPage = React.lazy(() => import('@/pages/orders/OrderDetail'))
const ProfilePage = React.lazy(() => import('@/pages/profile/Profile'))

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
  // TODO: Implement authentication check with Zustand store
  const isAuthenticated = false // This will be replaced with real auth state
  const location = useLocation()
  
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
                <Layout>
                  <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="menu" element={<MenuPage />} />
                    <Route path="menu/:itemId" element={<MenuDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:orderId" element={<OrderDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </Layout>
              </RequireAuth>
            }
          />
          
          {/* Redirect root to home */}
          <Route
            path="/"
            element={<Navigate to="/" replace />}
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App