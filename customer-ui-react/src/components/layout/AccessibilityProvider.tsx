/**
 * Accessibility Provider Component
 * 提供全面的無障礙功能支援，包括鍵盤導航、螢幕閱讀器支援和WCAG合規性
 */

import React, { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react'

// 無障礙上下文
interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  isHighContrast: boolean
  isReducedMotion: boolean
  isKeyboardNavigation: boolean
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const politeAriaRef = useRef<HTMLDivElement>(null)
  const assertiveAriaRef = useRef<HTMLDivElement>(null)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)

  // 檢測使用者偏好設定
  useEffect(() => {
    const checkHighContrast = () => {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      setIsHighContrast(highContrastQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsHighContrast(e.matches)
        if (e.matches) {
          announceMessage('高對比度模式已啟用', 'polite')
        }
      }
      
      highContrastQuery.addEventListener('change', handleChange)
      return () => highContrastQuery.removeEventListener('change', handleChange)
    }

    const checkReducedMotion = () => {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setIsReducedMotion(reducedMotionQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches)
        if (e.matches) {
          announceMessage('減少動畫模式已啟用', 'polite')
        }
      }
      
      reducedMotionQuery.addEventListener('change', handleChange)
      return () => reducedMotionQuery.removeEventListener('change', handleChange)
    }

    const checkKeyboardNavigation = () => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          setIsKeyboardNavigation(true)
          document.documentElement.classList.add('keyboard-navigation')
        }
      }

      const handleMouseDown = () => {
        setIsKeyboardNavigation(false)
        document.documentElement.classList.remove('keyboard-navigation')
      }

      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleMouseDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('mousedown', handleMouseDown)
      }
    }

    const cleanupHighContrast = checkHighContrast()
    const cleanupReducedMotion = checkReducedMotion()
    const cleanupKeyboardNavigation = checkKeyboardNavigation()

    return () => {
      cleanupHighContrast?.()
      cleanupReducedMotion?.()
      cleanupKeyboardNavigation?.()
    }
  }, [])

  // 螢幕閱讀器公告功能
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const targetRef = priority === 'assertive' ? assertiveAriaRef : politeAriaRef
    
    if (targetRef.current) {
      // 清空並重新設置內容以觸發螢幕閱讀器
      targetRef.current.textContent = ''
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.textContent = message
        }
      }, 100)
    }
  }

  // 設置全域無障礙設定
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }

    if (isReducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [isHighContrast, isReducedMotion])

  // 鍵盤導航增強
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 關閉模態框、下拉選單等
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
        
        // 觸發全域 Escape 事件
        const escapeEvent = new CustomEvent('global-escape')
        document.dispatchEvent(escapeEvent)
      }
    }

    const handleF6Navigation = (e: KeyboardEvent) => {
      if (e.key === 'F6') {
        e.preventDefault()
        // F6 用於在主要區域間導航
        const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="complementary"], [role="banner"]')
        if (landmarks.length > 0) {
          const currentIndex = Array.from(landmarks).findIndex(el => el.contains(document.activeElement))
          const nextIndex = (currentIndex + 1) % landmarks.length
          const nextLandmark = landmarks[nextIndex] as HTMLElement
          
          if (nextLandmark) {
            nextLandmark.focus()
            announceMessage(`已移動到${nextLandmark.getAttribute('aria-label') || '下一個區域'}`, 'polite')
          }
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleF6Navigation)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleF6Navigation)
    }
  }, [])

  const contextValue: AccessibilityContextType = {
    announceMessage,
    isHighContrast,
    isReducedMotion,
    isKeyboardNavigation,
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* 跳過鏈接 */}
      <a 
        href="#main-content" 
        className="skip-link focus-visible"
        onFocus={() => announceMessage('跳過鏈接已聚焦，按Enter跳至主要內容', 'polite')}
      >
        跳至主要內容
      </a>
      
      {/* ARIA Live Regions for screen reader announcements */}
      <div
        ref={politeAriaRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div
        ref={assertiveAriaRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />

      {/* 主要內容 */}
      <div id="main-content" role="main">
        {children}
      </div>

      {/* 鍵盤導航說明（僅在首次使用Tab鍵時顯示） */}
      {isKeyboardNavigation && (
        <div
          className="sr-only"
          role="region"
          aria-label="鍵盤導航說明"
        >
          <p>您正在使用鍵盤導航。使用Tab鍵移動，Enter鍵選擇，Escape鍵返回，F6鍵在主要區域間切換。</p>
        </div>
      )}
    </AccessibilityContext.Provider>
  )
}

// Hook for announcing messages to screen readers
export const useScreenReader = () => {
  const { announceMessage } = useAccessibility()
  
  return {
    announce: announceMessage,
    success: (message: string) => announceMessage(`成功：${message}`, 'polite'),
    error: (message: string) => announceMessage(`錯誤：${message}`, 'assertive'),
    warning: (message: string) => announceMessage(`警告：${message}`, 'assertive'),
    info: (message: string) => announceMessage(`資訊：${message}`, 'polite'),
  }
}

// Hook for detecting user accessibility preferences
export const useAccessibilityPreferences = () => {
  const { isHighContrast, isReducedMotion, isKeyboardNavigation } = useAccessibility()
  
  return {
    isHighContrast,
    isReducedMotion,
    isKeyboardNavigation,
    prefersReducedMotion: isReducedMotion,
    prefersHighContrast: isHighContrast,
    isUsingKeyboard: isKeyboardNavigation,
  }
}

export default AccessibilityProvider