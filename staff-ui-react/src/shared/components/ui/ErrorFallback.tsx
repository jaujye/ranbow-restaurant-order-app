import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './Button';
import { isDevelopment } from '@/config/env.config';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="card p-8 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              哎呀，出現了問題
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              應用程式遇到了意外錯誤。請重新嘗試或聯絡支援團隊。
            </p>
          </div>

          {/* Development Error Details */}
          {isDevelopment && error && (
            <div className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Bug className="w-4 h-4" />
                開發模式錯誤詳情：
              </div>
              <div className="text-xs font-mono text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 p-2 rounded border overflow-auto max-h-32">
                <div className="font-semibold">{error.name}: {error.message}</div>
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {error.stack}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={resetErrorBoundary}
              variant="primary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新嘗試
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回首頁
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>如果問題持續發生，請聯絡系統管理員</p>
            <p>錯誤時間: {new Date().toLocaleString('zh-TW')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Smaller error fallback for component-level errors
export function ComponentErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="card p-6 border-danger-200 bg-danger-50 dark:bg-danger-900/10 dark:border-danger-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium text-danger-800 dark:text-danger-200">
            組件載入失敗
          </div>
          <div className="text-xs text-danger-700 dark:text-danger-300">
            {error.message || '未知錯誤'}
          </div>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={resetErrorBoundary}
            className="text-xs"
          >
            重新載入
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for handling errors in components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Component Error:', error, errorInfo);
    
    if (isDevelopment) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
      });
    }
    
    // TODO: Send error to monitoring service
    // errorReportingService.captureException(error, {
    //   extra: errorInfo,
    //   tags: {
    //     type: 'component-error',
    //   },
    // });
  };
}