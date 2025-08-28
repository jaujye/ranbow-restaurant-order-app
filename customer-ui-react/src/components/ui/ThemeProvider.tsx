/**
 * Theme Provider Component
 * 完整的主題系統，支援淺色/深色模式切換和彩虹主題變化
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// 主題類型定義
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorScheme = 'rainbow' | 'purple' | 'blue' | 'green' | 'orange' | 'pink'

interface ThemeContextType {
  mode: ThemeMode
  colorScheme: ColorScheme
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  setColorScheme: (scheme: ColorScheme) => void
  toggleTheme: () => void
  getThemeColors: () => ThemeColors
}

// 主題色彩定義
interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

// 色彩方案配置
const colorSchemes: Record<ColorScheme, { light: ThemeColors; dark: ThemeColors }> = {
  rainbow: {
    light: {
      primary: 'rgb(168, 85, 247)', // purple-500
      secondary: 'rgb(59, 130, 246)', // blue-500  
      accent: 'rgb(34, 197, 94)', // green-500
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(248, 250, 252)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)',
    },
    dark: {
      primary: 'rgb(196, 125, 255)', // purple-400
      secondary: 'rgb(96, 165, 250)', // blue-400
      accent: 'rgb(74, 222, 128)', // green-400
      background: 'rgb(15, 15, 17)',
      surface: 'rgb(24, 24, 27)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgb(51, 65, 85)',
      success: 'rgb(74, 222, 128)',
      warning: 'rgb(253, 224, 71)',
      error: 'rgb(248, 113, 113)',
      info: 'rgb(96, 165, 250)',
    },
  },
  purple: {
    light: {
      primary: 'rgb(147, 51, 234)', // violet-600
      secondary: 'rgb(124, 58, 237)', // violet-600
      accent: 'rgb(192, 132, 252)', // violet-400
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(250, 248, 255)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)',
    },
    dark: {
      primary: 'rgb(196, 181, 253)', // violet-300
      secondary: 'rgb(167, 139, 250)', // violet-400
      accent: 'rgb(139, 92, 246)', // violet-500
      background: 'rgb(15, 15, 17)',
      surface: 'rgb(24, 24, 27)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgb(51, 65, 85)',
      success: 'rgb(74, 222, 128)',
      warning: 'rgb(253, 224, 71)',
      error: 'rgb(248, 113, 113)',
      info: 'rgb(96, 165, 250)',
    },
  },
  blue: {
    light: {
      primary: 'rgb(37, 99, 235)', // blue-600
      secondary: 'rgb(59, 130, 246)', // blue-500
      accent: 'rgb(96, 165, 250)', // blue-400
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(248, 250, 255)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)',
    },
    dark: {
      primary: 'rgb(147, 197, 253)', // blue-300
      secondary: 'rgb(96, 165, 250)', // blue-400
      accent: 'rgb(59, 130, 246)', // blue-500
      background: 'rgb(15, 15, 17)',
      surface: 'rgb(24, 24, 27)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgb(51, 65, 85)',
      success: 'rgb(74, 222, 128)',
      warning: 'rgb(253, 224, 71)',
      error: 'rgb(248, 113, 113)',
      info: 'rgb(96, 165, 250)',
    },
  },
  green: {
    light: {
      primary: 'rgb(21, 128, 61)', // green-700
      secondary: 'rgb(34, 197, 94)', // green-500
      accent: 'rgb(74, 222, 128)', // green-400
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(247, 254, 231)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)',
    },
    dark: {
      primary: 'rgb(134, 239, 172)', // green-300
      secondary: 'rgb(74, 222, 128)', // green-400
      accent: 'rgb(34, 197, 94)', // green-500
      background: 'rgb(15, 15, 17)',
      surface: 'rgb(24, 24, 27)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgb(51, 65, 85)',
      success: 'rgb(74, 222, 128)',
      warning: 'rgb(253, 224, 71)',
      error: 'rgb(248, 113, 113)',
      info: 'rgb(96, 165, 250)',
    },
  },
  orange: {
    light: {
      primary: 'rgb(234, 88, 12)', // orange-600
      secondary: 'rgb(249, 115, 22)', // orange-500
      accent: 'rgb(251, 146, 60)', // orange-400
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(255, 251, 235)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)',
    },
    dark: {
      primary: 'rgb(253, 186, 116)', // orange-300
      secondary: 'rgb(251, 146, 60)', // orange-400
      accent: 'rgb(249, 115, 22)', // orange-500
      background: 'rgb(15, 15, 17)',
      surface: 'rgb(24, 24, 27)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgb(51, 65, 85)',
      success: 'rgb(74, 222, 128)',
      warning: 'rgb(253, 224, 71)',
      error: 'rgb(248, 113, 113)',
      info: 'rgb(96, 165, 250)',
    },
  },
  pink: {
    light: {
      primary: 'rgb(219, 39, 119)', // pink-600
      secondary: 'rgb(236, 72, 153)', // pink-500
      accent: 'rgb(244, 114, 182)', // pink-400
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(253, 242, 248)',
      text: 'rgb(15, 23, 42)',
      textSecondary: 'rgb(100, 116, 139)',
      border: 'rgb(226, 232, 240)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)',
    },
    dark: {
      primary: 'rgb(249, 168, 212)', // pink-300
      secondary: 'rgb(244, 114, 182)', // pink-400
      accent: 'rgb(236, 72, 153)', // pink-500
      background: 'rgb(15, 15, 17)',
      surface: 'rgb(24, 24, 27)',
      text: 'rgb(248, 250, 252)',
      textSecondary: 'rgb(148, 163, 184)',
      border: 'rgb(51, 65, 85)',
      success: 'rgb(74, 222, 128)',
      warning: 'rgb(253, 224, 71)',
      error: 'rgb(248, 113, 113)',
      info: 'rgb(96, 165, 250)',
    },
  },
}

const ThemeContext = createContext<ThemeContextType | null>(null)

// 自定義Hook來使用主題
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultMode?: ThemeMode
  defaultColorScheme?: ColorScheme
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
  defaultColorScheme = 'rainbow',
}) => {
  // 從localStorage讀取保存的主題設定
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode
      return savedMode || defaultMode
    }
    return defaultMode
  })

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const savedScheme = localStorage.getItem('color-scheme') as ColorScheme
      return savedScheme || defaultColorScheme
    }
    return defaultColorScheme
  })

  // 計算實際的主題（考慮system模式）
  const [isDark, setIsDark] = useState(false)

  // 檢測系統主題偏好
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateTheme = () => {
      if (mode === 'system') {
        setIsDark(mediaQuery.matches)
      } else {
        setIsDark(mode === 'dark')
      }
    }

    updateTheme()
    mediaQuery.addEventListener('change', updateTheme)
    
    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [mode])

  // 設定主題模式
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', newMode)
    }
  }

  // 設定色彩方案
  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('color-scheme', newScheme)
    }
  }

  // 切換主題（在light/dark間切換）
  const toggleTheme = () => {
    if (mode === 'system') {
      // 如果是system模式，根據當前實際顯示切換
      setMode(isDark ? 'light' : 'dark')
    } else {
      setMode(mode === 'light' ? 'dark' : 'light')
    }
  }

  // 獲取當前主題色彩
  const getThemeColors = (): ThemeColors => {
    const scheme = colorSchemes[colorScheme]
    return isDark ? scheme.dark : scheme.light
  }

  // 應用主題到DOM
  useEffect(() => {
    const root = document.documentElement
    const colors = getThemeColors()

    // 設定CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      // 提取RGB值
      const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch
        root.style.setProperty(`--color-${key}`, `${r}, ${g}, ${b}`)
        root.style.setProperty(`--color-${key}-rgb`, value)
      }
    })

    // 設定主題模式class
    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)
    
    // 設定色彩方案
    root.setAttribute('data-color-scheme', colorScheme)
    root.setAttribute('data-theme-mode', mode)

    // 設定額外的主題變量
    root.style.setProperty('--theme-mode', mode)
    root.style.setProperty('--color-scheme', colorScheme)
    root.style.setProperty('--is-dark', isDark ? '1' : '0')

  }, [isDark, colorScheme, mode])

  // 監聽系統主題變化並同步公告給無障礙功能
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 發送主題變化事件
      const themeChangeEvent = new CustomEvent('theme-change', {
        detail: { mode, colorScheme, isDark }
      })
      window.dispatchEvent(themeChangeEvent)
    }
  }, [mode, colorScheme, isDark])

  const contextValue: ThemeContextType = {
    mode,
    colorScheme,
    isDark,
    setMode,
    setColorScheme,
    toggleTheme,
    getThemeColors,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// 便利的Hook來獲取主題色彩
export const useThemeColors = () => {
  const { getThemeColors } = useTheme()
  return getThemeColors()
}

// Hook來檢測深色模式
export const useDarkMode = () => {
  const { isDark, toggleTheme } = useTheme()
  return { isDark, toggle: toggleTheme }
}

// Hook來檢測色彩方案
export const useColorScheme = () => {
  const { colorScheme, setColorScheme } = useTheme()
  return { colorScheme, setColorScheme }
}

export default ThemeProvider