/**
 * Theme Switcher Component
 * 主題切換器 - 提供視覺化的主題和色彩方案選擇介面
 */

import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { useTheme, ColorScheme, ThemeMode } from './ThemeProvider'
import { useAccessibility } from '../layout/AccessibilityProvider'
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { Button } from './Button'

interface ThemeSwitcherProps {
  className?: string
  showColorSchemes?: boolean
  variant?: 'dropdown' | 'inline' | 'compact'
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  showColorSchemes = true,
  variant = 'dropdown',
}) => {
  const { mode, colorScheme, isDark, setMode, setColorScheme, toggleTheme } = useTheme()
  const { announceMessage } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  const themeOptions: Array<{ value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: 'light', label: '淺色模式', icon: SunIcon },
    { value: 'dark', label: '深色模式', icon: MoonIcon },
    { value: 'system', label: '跟隨系統', icon: ComputerDesktopIcon },
  ]

  const colorSchemeOptions: Array<{ value: ColorScheme; label: string; preview: string }> = [
    { value: 'rainbow', label: '彩虹主題', preview: 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-500' },
    { value: 'purple', label: '紫色主題', preview: 'bg-gradient-to-r from-violet-500 to-violet-600' },
    { value: 'blue', label: '藍色主題', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'green', label: '綠色主題', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'orange', label: '橙色主題', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { value: 'pink', label: '粉色主題', preview: 'bg-gradient-to-r from-pink-500 to-pink-600' },
  ]

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode)
    const modeLabel = themeOptions.find(option => option.value === newMode)?.label || newMode
    announceMessage(`主題已切換至${modeLabel}`, 'polite')
    setIsOpen(false)
  }

  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme)
    const schemeLabel = colorSchemeOptions.find(option => option.value === newScheme)?.label || newScheme
    announceMessage(`色彩方案已切換至${schemeLabel}`, 'polite')
  }

  const currentThemeOption = themeOptions.find(option => option.value === mode)
  const currentSchemeOption = colorSchemeOptions.find(option => option.value === colorScheme)

  // Compact variant - 只顯示切換按鈕
  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={cn('p-2', className)}
        aria-label={`切換至${isDark ? '淺色' : '深色'}模式`}
        tooltip={`目前：${currentThemeOption?.label}，點擊切換`}
      >
        {isDark ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
      </Button>
    )
  }

  // Inline variant - 水平排列的選項
  if (variant === 'inline') {
    return (
      <div className={cn('theme-switcher-inline space-y-4', className)}>
        {/* 主題模式選擇 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            外觀模式
          </label>
          <div className="flex gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = mode === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleModeChange(option.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    isActive
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  )}
                  aria-pressed={isActive}
                  aria-label={`${option.label}${isActive ? ' (目前選中)' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 色彩方案選擇 */}
        {showColorSchemes && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              色彩方案
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colorSchemeOptions.map((option) => {
                const isActive = colorScheme === option.value
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleColorSchemeChange(option.value)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200',
                      'border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      isActive
                        ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                    )}
                    aria-pressed={isActive}
                    aria-label={`${option.label}${isActive ? ' (目前選中)' : ''}`}
                  >
                    <div className={cn('w-4 h-4 rounded-full', option.preview)} />
                    <span className="flex-1 text-left">{option.label}</span>
                    {isActive && <CheckIcon className="w-4 h-4 text-primary-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Dropdown variant - 下拉選單模式（默認）
  return (
    <div className={cn('theme-switcher-dropdown relative', className)}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="主題設定選單"
      >
        <SwatchIcon className="w-5 h-5" />
        <span className="hidden sm:inline">主題</span>
        <ChevronDownIcon className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Menu */}
          <div 
            className={cn(
              'absolute right-0 top-full mt-2 w-80 z-50',
              'bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600',
              'animate-in slide-in-from-top-2 duration-200'
            )}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="p-4 space-y-6">
              {/* 主題模式 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  外觀模式
                </h3>
                <div className="space-y-1">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = mode === option.value
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleModeChange(option.value)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        )}
                        role="menuitem"
                        aria-pressed={isActive}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {isActive && <CheckIcon className="w-4 h-4 text-primary-500" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 色彩方案 */}
              {showColorSchemes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    色彩方案
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {colorSchemeOptions.map((option) => {
                      const isActive = colorScheme === option.value
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleColorSchemeChange(option.value)}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                          )}
                          role="menuitem"
                          aria-pressed={isActive}
                        >
                          <div className={cn('w-3 h-3 rounded-full', option.preview)} />
                          <span className="flex-1 text-left truncate">{option.label}</span>
                          {isActive && <CheckIcon className="w-3 h-3" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeSwitcher