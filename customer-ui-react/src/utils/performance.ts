/**
 * Performance Utilities
 * 性能優化工具集：提供各種性能優化函數和配置
 */

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Image optimization
  IMAGE_LAZY_LOADING: {
    threshold: 0.1,
    rootMargin: '50px',
  },
  
  // Scroll optimization
  SCROLL_THROTTLE: 16, // ~60fps
  RESIZE_DEBOUNCE: 150,
  
  // Memory management
  CACHE_EXPIRE_TIME: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  
  // Animation optimization
  ANIMATION_DURATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500,
  },
  
  // Bundle optimization
  CHUNK_SIZE_LIMIT: 244 * 1024, // 244KB
  
  // Metrics thresholds
  THRESHOLDS: {
    FPS: {
      GOOD: 55,
      WARNING: 45,
    },
    MEMORY: {
      GOOD: 70,
      WARNING: 90,
    },
    LOAD_TIME: {
      GOOD: 1000,
      WARNING: 3000,
    },
  },
} as const

// Performance measurement utilities
export class PerformanceMeasurer {
  private static measurements = new Map<string, number>()

  static start(name: string): void {
    this.measurements.set(name, performance.now())
  }

  static end(name: string): number {
    const startTime = this.measurements.get(name)
    if (!startTime) {
      console.warn(`Performance measurement "${name}" not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(name)

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static async measure<T>(name: string, fn: () => Promise<T>): Promise<T>
  static measure<T>(name: string, fn: () => T): T
  static measure<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(name)
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then(res => {
        this.end(name)
        return res
      }).catch(err => {
        this.end(name)
        throw err
      })
    } else {
      this.end(name)
      return result
    }
  }
}

// Memory management utilities
export class MemoryManager {
  private static cache = new Map<string, { value: any; timestamp: number; size: number }>()
  private static totalSize = 0

  static set<T>(key: string, value: T, ttl = PERFORMANCE_CONFIG.CACHE_EXPIRE_TIME): void {
    // Estimate size (rough calculation)
    const size = JSON.stringify(value).length * 2 // UTF-16 encoding

    // Clean expired entries
    this.cleanup()

    // Check if we need to make space
    if (this.totalSize + size > PERFORMANCE_CONFIG.MAX_CACHE_SIZE * 1024) {
      this.evictLRU(size)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now() + ttl,
      size,
    })

    this.totalSize += size
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.timestamp) {
      this.delete(key)
      return null
    }

    return entry.value
  }

  static delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.totalSize -= entry.size
      return this.cache.delete(key)
    }
    return false
  }

  static clear(): void {
    this.cache.clear()
    this.totalSize = 0
  }

  private static cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.delete(key)
      }
    }
  }

  private static evictLRU(neededSize: number): void {
    // Simple LRU: remove oldest entries until we have enough space
    const entries = Array.from(this.cache.entries())
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)

    for (const [key] of entries) {
      this.delete(key)
      if (this.totalSize + neededSize <= PERFORMANCE_CONFIG.MAX_CACHE_SIZE * 1024) {
        break
      }
    }
  }

  static getStats(): { size: number; count: number; hitRate: number } {
    return {
      size: this.totalSize,
      count: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
    }
  }
}

// Image optimization utilities
export const ImageOptimizer = {
  // Generate responsive image sources
  generateSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ')
  },

  // Generate sizes attribute for responsive images
  generateSizes: (breakpoints: Array<{ minWidth?: number; size: string }>): string => {
    return breakpoints
      .map(({ minWidth, size }) => 
        minWidth ? `(min-width: ${minWidth}px) ${size}` : size
      )
      .join(', ')
  },

  // Create optimized image placeholder
  createPlaceholder: (width: number, height: number, color = 'rgba(0,0,0,0.1)'): string => {
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
           fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${color}"/>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  },

  // Preload critical images
  preloadImage: (src: string, as: 'image' | 'fetch' = 'image'): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (as === 'image') {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = src
      } else {
        fetch(src)
          .then(() => resolve())
          .catch(reject)
      }
    })
  },
}

// DOM optimization utilities
export const DOMOptimizer = {
  // Batch DOM operations
  batchDOMOperations: (operations: (() => void)[]): void => {
    // Use DocumentFragment for multiple DOM manipulations
    const fragment = document.createDocumentFragment()
    
    // Batch operations using requestAnimationFrame
    requestAnimationFrame(() => {
      operations.forEach(operation => {
        try {
          operation()
        } catch (error) {
          console.error('DOM operation failed:', error)
        }
      })
    })
  },

  // Optimize scroll performance
  optimizeScrollPerformance: (element: HTMLElement): void => {
    element.style.willChange = 'scroll-position'
    element.style.transform = 'translate3d(0, 0, 0)'
    element.style.webkitOverflowScrolling = 'touch'
  },

  // Virtual scrolling helper
  calculateVisibleItems: (
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan = 5
  ): { startIndex: number; endIndex: number; visibleItems: number } => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleItems = Math.ceil(containerHeight / itemHeight) + overscan * 2
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItems)

    return { startIndex, endIndex, visibleItems }
  },
}

// Bundle optimization utilities
export const BundleOptimizer = {
  // Lazy load components
  lazyLoadComponent: <T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    return React.lazy(async () => {
      try {
        const module = await importFunc()
        return module
      } catch (error) {
        console.error('Failed to lazy load component:', error)
        if (fallback) {
          return { default: fallback }
        }
        throw error
      }
    })
  },

  // Preload route modules
  preloadRoute: (routeImport: () => Promise<any>): void => {
    // Preload on hover or focus for better UX
    const preload = () => {
      routeImport().catch(error => {
        console.error('Failed to preload route:', error)
      })
    }

    // Add to idle callback if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload)
    } else {
      setTimeout(preload, 1000)
    }
  },

  // Critical CSS extraction
  extractCriticalCSS: (): string[] => {
    const criticalSelectors: string[] = []
    
    // Get all stylesheets
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            // Check if selector matches visible elements
            if (document.querySelector(rule.selectorText)) {
              criticalSelectors.push(rule.cssText)
            }
          }
        })
      } catch (error) {
        // Cross-origin stylesheets can't be accessed
        console.warn('Cannot access stylesheet:', error)
      }
    })

    return criticalSelectors
  },
}

// Performance monitoring
export const PerformanceMonitor = {
  // Web Vitals measurement
  measureWebVitals: (): Promise<{
    FCP: number
    LCP: number
    CLS: number
    FID: number
    TTFB: number
  }> => {
    return new Promise((resolve) => {
      const metrics = {
        FCP: 0,
        LCP: 0,
        CLS: 0,
        FID: 0,
        TTFB: 0,
      }

      // Measure TTFB
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntry) {
        metrics.TTFB = navEntry.responseStart - navEntry.requestStart
      }

      // Use Performance Observer API for other metrics
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            switch (entry.entryType) {
              case 'paint':
                if (entry.name === 'first-contentful-paint') {
                  metrics.FCP = entry.startTime
                }
                break
              case 'largest-contentful-paint':
                metrics.LCP = entry.startTime
                break
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  metrics.CLS += (entry as any).value
                }
                break
              case 'first-input':
                metrics.FID = entry.processingStart - entry.startTime
                break
            }
          })
        })

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] })

        // Resolve after collecting metrics
        setTimeout(() => {
          observer.disconnect()
          resolve(metrics)
        }, 5000)
      } else {
        resolve(metrics)
      }
    })
  },

  // Resource loading analysis
  analyzeResourceLoading: (): {
    totalResources: number
    totalSize: number
    slowResources: Array<{ name: string; duration: number }>
  } => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const analysis = {
      totalResources: resources.length,
      totalSize: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
      slowResources: resources
        .filter(resource => resource.duration > 1000)
        .map(resource => ({
          name: resource.name,
          duration: resource.duration,
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
    }

    return analysis
  },
}

// Export utilities
export default {
  PerformanceMeasurer,
  MemoryManager,
  ImageOptimizer,
  DOMOptimizer,
  BundleOptimizer,
  PerformanceMonitor,
  PERFORMANCE_CONFIG,
}