/**
 * Performance Optimization Hooks
 * 性能優化工具集：提供各種性能監控和優化功能
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number
  reRenderCount: number
  memoryUsage?: number
  fps: number
  loadTime: number
}

/**
 * Hook for monitoring component render performance
 * 監控組件渲染性能
 */
export const useRenderPerformance = (componentName?: string) => {
  const renderCountRef = useRef(0)
  const renderStartRef = useRef<number>(0)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    reRenderCount: 0,
    fps: 60,
    loadTime: 0,
  })

  // Track render start time
  useEffect(() => {
    renderStartRef.current = performance.now()
    renderCountRef.current += 1
  })

  // Track render completion
  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      reRenderCount: renderCountRef.current,
    }))

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development' && componentName) {
      console.log(`🎯 ${componentName} Performance:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        reRenderCount: renderCountRef.current,
      })
    }
  })

  return metrics
}

/**
 * Hook for optimized image loading with lazy loading and intersection observer
 * 圖片優化載入Hook
 */
export const useOptimizedImage = (src: string, options?: {
  threshold?: number
  rootMargin?: string
  placeholder?: string
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const { threshold = 0.1, rootMargin = '50px', placeholder } = options || {}

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  // Load image when in view
  useEffect(() => {
    if (!isInView) return

    const img = new Image()
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setError('Failed to load image')
    img.src = src
  }, [isInView, src])

  return {
    ref: imgRef,
    src: isInView ? src : placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4xKSIvPjwvc3ZnPg==',
    isLoaded,
    isInView,
    error,
  }
}

/**
 * Debounced value hook for performance optimization
 * 防抖Hook，優化頻繁更新的性能
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttled function hook
 * 節流Hook，限制函數執行頻率
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  const inThrottle = useRef(false)

  return useCallback(
    ((...args) => {
      if (!inThrottle.current) {
        func.apply(null, args)
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limit)
      }
    }) as T,
    [func, limit]
  )
}

/**
 * Memory usage monitoring hook
 * 記憶體使用監控Hook
 */
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    percentage: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      // @ts-ignore - performance.memory is not in types but exists in Chrome
      if ('memory' in performance) {
        // @ts-ignore
        const memory = performance.memory
        const used = Math.round(memory.usedJSHeapSize / 1048576) // MB
        const total = Math.round(memory.totalJSHeapSize / 1048576) // MB
        const percentage = Math.round((used / total) * 100)

        setMemoryInfo({ used, total, percentage })
      }
    }

    // Initial measurement
    updateMemoryInfo()

    // Update every 10 seconds
    const interval = setInterval(updateMemoryInfo, 10000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

/**
 * FPS monitoring hook
 * FPS監控Hook
 */
export const useFPS = () => {
  const [fps, setFps] = useState(60)
  const frameCountRef = useRef(0)
  const startTimeRef = useRef(performance.now())
  const animationIdRef = useRef<number>()

  useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++
      const currentTime = performance.now()
      const elapsed = currentTime - startTimeRef.current

      if (elapsed >= 1000) { // Update every second
        const currentFPS = Math.round((frameCountRef.current * 1000) / elapsed)
        setFps(currentFPS)
        frameCountRef.current = 0
        startTimeRef.current = currentTime
      }

      animationIdRef.current = requestAnimationFrame(measureFPS)
    }

    animationIdRef.current = requestAnimationFrame(measureFPS)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [])

  return fps
}

/**
 * Optimized scroll handler with RAF
 * 優化的滾動處理器，使用requestAnimationFrame
 */
export const useOptimizedScroll = (
  callback: (scrollY: number, direction: 'up' | 'down') => void,
  throttleMs = 16 // ~60fps
) => {
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollInfo = useCallback(() => {
    const scrollY = window.scrollY
    const direction = scrollY > lastScrollY.current ? 'down' : 'up'
    
    callback(scrollY, direction)
    
    lastScrollY.current = scrollY
    ticking.current = false
  }, [callback])

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollInfo)
      ticking.current = true
    }
  }, [updateScrollInfo])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])
}

/**
 * Bundle size analyzer (development only)
 * 打包大小分析器（僅開發環境）
 */
export const useBundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    loadTime: number
    resourceCount: number
    totalSize: number
  } | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const analyzeBundle = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      const resourceCount = resources.length
      const totalSize = resources.reduce((total, resource) => {
        return total + (resource.transferSize || 0)
      }, 0)

      setBundleInfo({
        loadTime: Math.round(loadTime),
        resourceCount,
        totalSize: Math.round(totalSize / 1024), // KB
      })

      console.log('📦 Bundle Analysis:', {
        loadTime: `${Math.round(loadTime)}ms`,
        resourceCount,
        totalSize: `${Math.round(totalSize / 1024)}KB`,
      })
    }

    // Run analysis after load
    if (document.readyState === 'complete') {
      analyzeBundle()
    } else {
      window.addEventListener('load', analyzeBundle)
    }

    return () => window.removeEventListener('load', analyzeBundle)
  }, [])

  return bundleInfo
}

/**
 * Memoized computation hook with cache invalidation
 * 帶緩存失效的記憶化計算Hook
 */
export const useMemoizedComputation = <T, D extends any[]>(
  computationFn: (...deps: D) => T,
  deps: D,
  cacheTime = 5000 // 5 seconds
): T => {
  const cacheRef = useRef<{
    value: T
    timestamp: number
    deps: D
  } | null>(null)

  return useMemo(() => {
    const now = Date.now()
    
    // Check if cache is valid
    if (
      cacheRef.current &&
      cacheRef.current.timestamp + cacheTime > now &&
      JSON.stringify(cacheRef.current.deps) === JSON.stringify(deps)
    ) {
      return cacheRef.current.value
    }

    // Compute new value
    const value = computationFn(...deps)
    
    // Update cache
    cacheRef.current = {
      value,
      timestamp: now,
      deps: [...deps] as D,
    }

    return value
  }, [computationFn, cacheTime, ...deps])
}

export default {
  useRenderPerformance,
  useOptimizedImage,
  useDebounce,
  useThrottle,
  useMemoryUsage,
  useFPS,
  useOptimizedScroll,
  useBundleAnalyzer,
  useMemoizedComputation,
}