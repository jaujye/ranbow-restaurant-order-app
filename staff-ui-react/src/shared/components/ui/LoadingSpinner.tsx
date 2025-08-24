import React from 'react';
import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent' | 'white' | 'gray';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'border-primary-600 border-t-transparent',
  accent: 'border-accent-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-600 border-t-transparent',
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2',
          sizeClasses[size],
          colorClasses[color]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

// Page-level loading spinner
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-4">
          <LoadingSpinner size="xl" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          載入中...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          正在準備您的工作台
        </p>
      </div>
    </div>
  );
}

// Inline loading spinner for content areas
export function InlineLoader({ text = '載入中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Overlay loading spinner
export function OverlayLoader({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text="處理中，請稍候..." />
      </div>
    </div>
  );
}