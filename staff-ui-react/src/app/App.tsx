import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import AppRouter from './router';
import { GlobalProviders } from './providers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorFallback } from '@/components/ui/ErrorFallback';
import { env, isDevelopment } from '@/config/env.config';

// Enable debugging in development
if (isDevelopment && env.DEBUG_MODE) {
  window.__STAFF_UI_DEBUG__ = {
    env,
    version: env.APP_VERSION,
    timestamp: new Date().toISOString(),
  };
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary:', error, errorInfo);
        
        // In development, show more detailed error information
        if (isDevelopment) {
          console.error('Component Stack:', errorInfo.componentStack);
          console.error('Error Boundary Stack:', errorInfo.errorBoundary);
        }

        // TODO: Send error to monitoring service in production
        // errorReportingService.captureException(error, {
        //   extra: errorInfo,
        //   tags: {
        //     component: 'App',
        //     version: env.APP_VERSION,
        //   },
        // });
      }}
      onReset={() => {
        // Clear any error state and refresh the page
        window.location.reload();
      }}
    >
      <Router>
        <GlobalProviders>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <AppRouter />
            </Suspense>
          </div>
        </GlobalProviders>
      </Router>
    </ErrorBoundary>
  );
}

export default App;