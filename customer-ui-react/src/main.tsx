import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './styles/globals.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time
      staleTime: 5 * 60 * 1000,
      // 10 minutes cache time
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: import.meta.env.PROD,
      // Background refetch interval
      refetchInterval: import.meta.env.DEV ? false : 5 * 60 * 1000,
    },
    mutations: {
      // Retry mutations on network errors
      retry: 1,
    },
  },
})

// Error boundary for the entire app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
    
    // Report to error tracking service in production
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      // TODO: Send error to Sentry or other error tracking service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-default p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              糟糕！出了點問題
            </h1>
            <p className="text-text-secondary mb-6">
              應用程式遇到了意外錯誤。請重新整理頁面或稍後再試。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              重新整理頁面
            </button>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-error-500">
                  開發模式：查看錯誤詳情
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Get root element
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Create React root
const root = ReactDOM.createRoot(rootElement)

// Initialize app
async function initializeApp() {
  try {
    // Hide loading screen
    document.body.classList.add('react-loaded')
    
    // Check if we're in development mode
    const isDev = import.meta.env.DEV
    
    // Optional: Pre-load critical resources
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Pre-load images or other resources during idle time
        console.log('App initialized successfully')
      })
    }
    
    // Render the app
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <App />
              {isDev && (
                <ReactQueryDevtools
                  initialIsOpen={false}
                  position="bottom-right"
                />
              )}
            </QueryClientProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    )
    
  } catch (error) {
    console.error('Failed to initialize app:', error)
    
    // Show fallback error UI
    root.render(
      <div className="min-h-screen flex items-center justify-center bg-background-default p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            初始化失敗
          </h1>
          <p className="text-text-secondary">
            應用程式無法正常啟動，請重新整理頁面。
          </p>
        </div>
      </div>
    )
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept()
}