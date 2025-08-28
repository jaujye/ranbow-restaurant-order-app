/**
 * Performance Monitor Component
 * 性能監控組件 - 開發環境下顯示實時性能指標
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { useMemoryUsage, useFPS, useBundleAnalyzer } from '@/hooks/usePerformance'
import { useAccessibilityPreferences } from '../ui/ThemeProvider'
import {
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  EyeSlashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

interface PerformanceMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showInProduction?: boolean
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  position = 'bottom-right',
  showInProduction = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [renderCount, setRenderCount] = useState(0)
  
  const memoryUsage = useMemoryUsage()
  const fps = useFPS()
  const bundleInfo = useBundleAnalyzer()
  const { isReducedMotion } = useAccessibilityPreferences()

  // Don't show in production unless explicitly enabled
  useEffect(() => {
    const shouldShow = process.env.NODE_ENV === 'development' || showInProduction
    const isDevTools = new URLSearchParams(window.location.search).has('dev')
    
    setIsVisible(shouldShow || isDevTools)
  }, [showInProduction])

  // Track component re-renders
  useEffect(() => {
    setRenderCount(prev => prev + 1)
  })

  // Performance thresholds
  const getPerformanceStatus = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'good'
    if (value <= thresholds[1]) return 'warning'
    return 'poor'
  }

  const fpsStatus = getPerformanceStatus(60 - fps, [5, 15]) // Good: >55fps, Warning: >45fps, Poor: <45fps
  const memoryStatus = memoryUsage 
    ? getPerformanceStatus(memoryUsage.percentage, [70, 90])
    : 'unknown'

  // Position styles
  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  const statusColors = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    poor: 'text-red-600 bg-red-50',
    unknown: 'text-gray-600 bg-gray-50',
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed z-[9999] select-none',
        positionStyles[position],
        'font-mono text-xs',
        isReducedMotion ? '' : 'transition-all duration-300 ease-in-out'
      )}
      role="complementary"
      aria-label="性能監控器"
    >
      {/* Minimized View */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-black/80 text-white backdrop-blur-sm',
            'hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50',
            'border border-white/20'
          )}
          aria-label="展開性能監控器"
        >
          <ChartBarIcon className="w-4 h-4" />
          <span className={cn('px-1.5 py-0.5 rounded text-xs', statusColors[fpsStatus])}>
            {fps}fps
          </span>
          {memoryUsage && (
            <span className={cn('px-1.5 py-0.5 rounded text-xs', statusColors[memoryStatus])}>
              {memoryUsage.percentage}%
            </span>
          )}
        </button>
      )}

      {/* Expanded View */}
      {!isMinimized && (
        <div
          className={cn(
            'bg-black/90 text-white rounded-lg shadow-2xl backdrop-blur-lg',
            'border border-white/20 min-w-[280px]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              <span className="font-medium">Performance Monitor</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="最小化性能監控器"
            >
              <EyeSlashIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics */}
          <div className="p-3 space-y-3">
            {/* FPS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-400" />
                <span>FPS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-1 rounded', statusColors[fpsStatus])}>
                  {fps}
                </span>
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      fpsStatus === 'good' && 'bg-green-500',
                      fpsStatus === 'warning' && 'bg-yellow-500',
                      fpsStatus === 'poor' && 'bg-red-500'
                    )}
                    style={{ width: `${(fps / 60) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            {memoryUsage && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CpuChipIcon className="w-4 h-4 text-purple-400" />
                  <span>Memory</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <div className={cn('px-2 py-1 rounded text-xs', statusColors[memoryStatus])}>
                      {memoryUsage.percentage}%
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {memoryUsage.used}MB / {memoryUsage.total}MB
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        memoryStatus === 'good' && 'bg-green-500',
                        memoryStatus === 'warning' && 'bg-yellow-500',
                        memoryStatus === 'poor' && 'bg-red-500'
                      )}
                      style={{ width: `${memoryUsage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bundle Info */}
            {bundleInfo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Load Time</span>
                  <span className="text-cyan-400">{bundleInfo.loadTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resources</span>
                  <span className="text-cyan-400">{bundleInfo.resourceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bundle Size</span>
                  <span className="text-cyan-400">{bundleInfo.totalSize}KB</span>
                </div>
              </div>
            )}

            {/* Component Renders */}
            <div className="flex items-center justify-between">
              <span>Renders</span>
              <span className="text-green-400">{renderCount}</span>
            </div>

            {/* Debug Info */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-white/60 space-y-1">
                <div>ENV: {process.env.NODE_ENV}</div>
                <div>User Agent: {navigator.userAgent.split(' ')[0]}</div>
                <div>Viewport: {window.innerWidth}x{window.innerHeight}</div>
                <div>Device Ratio: {window.devicePixelRatio}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-white/10 text-xs text-white/60">
            <div className="flex items-center justify-between">
              <span>Ranbow Restaurant - Dev Tools</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceMonitor