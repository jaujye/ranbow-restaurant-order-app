/**
 * 🏠 Main App Component
 * Root application component with routing and providers
 */

import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// 🔐 Authentication
import { useAuthStore } from '@/store'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// 📱 Layout Components
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

// 📄 Pages (Lazy Loaded)
const LoginPage = React.lazy(() => import('@/pages/auth/Login'))
const DashboardPage = React.lazy(() => import('@/pages/dashboard/Dashboard'))
const OrdersPage = React.lazy(() => import('@/pages/orders/Orders'))
const KitchenPage = React.lazy(() => import('@/pages/kitchen/Kitchen'))
const StatsPage = React.lazy(() => import('@/pages/stats/Stats'))
const ProfilePage = React.lazy(() => import('@/pages/profile/Profile'))
const NotFoundPage = React.lazy(() => import('@/pages/NotFound'))

// ⚡ Loading Components
const AppLoading: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
      <p className="text-body text-gray-600">載入中...</p>
    </div>
  </div>
)

const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
      <p className="text-caption text-gray-500">載入頁面...</p>
    </div>
  </div>
)

// 🔧 Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
})

// 🏠 Main App Component
const App: React.FC = () => {
  const { isAuthenticated, checkSessionExpiry, logout } = useAuthStore()

  // 🔍 Session Management
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && checkSessionExpiry()) {
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [isAuthenticated, checkSessionExpiry, logout])

  // 📱 App Error Boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      // You could add error reporting here
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      // You could add error reporting here
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<AppLoading />}>
            <Routes>
              {/* 🔐 Authentication Routes */}
              <Route
                path="/auth/*"
                element={
                  <AuthLayout>
                    <Routes>
                      <Route path="login" element={<LoginPage />} />
                      <Route path="*" element={<Navigate to="/auth/login" replace />} />
                    </Routes>
                  </AuthLayout>
                }
              />

              {/* 🏠 Main Application Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Suspense fallback={<PageLoading />}>
                        <Routes>
                          {/* Dashboard */}
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<DashboardPage />} />
                          
                          {/* Orders Management */}
                          <Route path="/orders" element={<OrdersPage />} />
                          <Route path="/orders/:orderId" element={<OrdersPage />} />
                          
                          {/* Kitchen Operations */}
                          <Route path="/kitchen" element={<KitchenPage />} />
                          
                          {/* Statistics & Analytics */}
                          <Route path="/stats" element={<StatsPage />} />
                          
                          {/* Staff Profile */}
                          <Route path="/profile" element={<ProfilePage />} />
                          
                          {/* 404 Not Found */}
                          <Route path="/404" element={<NotFoundPage />} />
                          <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                      </Suspense>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>

          {/* 🔥 Global Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              className: 'bg-white shadow-elevated rounded-staff border border-gray-200',
              success: {
                iconTheme: {
                  primary: '#34C759',
                  secondary: '#ffffff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#FF3B30',
                  secondary: '#ffffff'
                }
              },
              loading: {
                iconTheme: {
                  primary: '#FF6B35',
                  secondary: '#ffffff'
                }
              }
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App