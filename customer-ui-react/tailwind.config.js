/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 動態主題色彩系統 - 與ThemeProvider整合
      colors: {
        // 主要色彩 - 使用CSS變量支援動態主題
        primary: {
          50: 'rgba(var(--color-primary), 0.05)',
          100: 'rgba(var(--color-primary), 0.1)',
          200: 'rgba(var(--color-primary), 0.2)',
          300: 'rgba(var(--color-primary), 0.3)',
          400: 'rgba(var(--color-primary), 0.4)',
          500: 'rgb(var(--color-primary))', // 主要色彩
          600: 'rgba(var(--color-primary), 0.8)',
          700: 'rgba(var(--color-primary), 0.9)',
          800: 'rgba(var(--color-primary), 0.95)',
          900: 'rgba(var(--color-primary), 0.97)',
          950: 'rgba(var(--color-primary), 0.99)',
        },
        secondary: {
          50: 'rgba(var(--color-secondary), 0.05)',
          100: 'rgba(var(--color-secondary), 0.1)',
          200: 'rgba(var(--color-secondary), 0.2)',
          300: 'rgba(var(--color-secondary), 0.3)',
          400: 'rgba(var(--color-secondary), 0.4)',
          500: 'rgb(var(--color-secondary))', // 次要色彩
          600: 'rgba(var(--color-secondary), 0.8)',
          700: 'rgba(var(--color-secondary), 0.9)',
          800: 'rgba(var(--color-secondary), 0.95)',
          900: 'rgba(var(--color-secondary), 0.97)',
          950: 'rgba(var(--color-secondary), 0.99)',
        },
        accent: {
          50: 'rgba(var(--color-accent), 0.05)',
          100: 'rgba(var(--color-accent), 0.1)',
          200: 'rgba(var(--color-accent), 0.2)',
          300: 'rgba(var(--color-accent), 0.3)',
          400: 'rgba(var(--color-accent), 0.4)',
          500: 'rgb(var(--color-accent))', // 強調色彩
          600: 'rgba(var(--color-accent), 0.8)',
          700: 'rgba(var(--color-accent), 0.9)',
          800: 'rgba(var(--color-accent), 0.95)',
          900: 'rgba(var(--color-accent), 0.97)',
          950: 'rgba(var(--color-accent), 0.99)',
        },
        
        // 彩虹色彩
        rainbow: {
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D92',
        },
        
        // 狀態色彩 - 使用CSS變量支援動態主題
        success: {
          50: 'rgba(var(--color-success), 0.05)',
          100: 'rgba(var(--color-success), 0.1)',
          500: 'rgb(var(--color-success))',
          600: 'rgba(var(--color-success), 0.8)',
          700: 'rgba(var(--color-success), 0.9)',
        },
        warning: {
          50: 'rgba(var(--color-warning), 0.05)',
          100: 'rgba(var(--color-warning), 0.1)',
          500: 'rgb(var(--color-warning))',
          600: 'rgba(var(--color-warning), 0.8)',
          700: 'rgba(var(--color-warning), 0.9)',
        },
        error: {
          50: 'rgba(var(--color-error), 0.05)',
          100: 'rgba(var(--color-error), 0.1)',
          200: 'rgba(var(--color-error), 0.2)',
          300: 'rgba(var(--color-error), 0.3)',
          400: 'rgba(var(--color-error), 0.4)',
          500: 'rgb(var(--color-error))',
          600: 'rgba(var(--color-error), 0.8)',
          700: 'rgba(var(--color-error), 0.9)',
          800: 'rgba(var(--color-error), 0.95)',
          900: 'rgba(var(--color-error), 0.97)',
          950: 'rgba(var(--color-error), 0.99)',
        },
        info: {
          50: 'rgba(var(--color-info), 0.05)',
          100: 'rgba(var(--color-info), 0.1)',
          500: 'rgb(var(--color-info))',
          600: 'rgba(var(--color-info), 0.8)',
          700: 'rgba(var(--color-info), 0.9)',
        },
        
        // 語義色彩 - 使用CSS變量支援動態主題
        text: {
          primary: 'rgb(var(--color-text))',
          secondary: 'rgb(var(--color-textSecondary))',
          disabled: 'rgba(var(--color-text), 0.4)',
        },
        
        border: {
          light: 'rgba(var(--color-border), 0.6)',
          medium: 'rgb(var(--color-border))',
          dark: 'rgba(var(--color-border), 1.2)',
        },
        
        background: {
          default: 'rgb(var(--color-background))',
          surface: 'rgb(var(--color-surface))',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
      },
      
      // 字體系統 - 多語言支援
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'noto': ['Noto Sans TC', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      
      // 字體大小 - 手機版優化
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['15px', { lineHeight: '22px' }],
        'lg': ['17px', { lineHeight: '24px' }],
        'xl': ['19px', { lineHeight: '26px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['26px', { lineHeight: '34px' }],
      },
      
      // 間距系統
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'header': '64px',
        'bottom-nav': '72px',
        'touch-min': '44px',
        'touch-rec': '48px',
        'touch-lg': '56px',
      },
      
      // 陰影系統
      boxShadow: {
        'small': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.15)',
        'large': '0 10px 15px rgba(0, 0, 0, 0.2)',
        'rainbow': '0 4px 14px 0 rgba(255, 107, 53, 0.25)',
        'rainbow-lg': '0 10px 30px 0 rgba(255, 107, 53, 0.35)',
      },
      
      // 邊框圓角
      borderRadius: {
        'small': '4px',
        'medium': '8px',
        'large': '12px',
        'xlarge': '16px',
      },
      
      // 背景漸變
      backgroundImage: {
        'rainbow-horizontal': 'linear-gradient(90deg, #FF3B30 0%, #FF9500 14.28%, #FFCC00 28.56%, #34C759 42.84%, #007AFF 57.12%, #5856D6 71.4%, #AF52DE 85.68%, #FF2D92 100%)',
        'rainbow-diagonal': 'linear-gradient(135deg, #FF3B30 0%, #FF9500 14.28%, #FFCC00 28.56%, #34C759 42.84%, #007AFF 57.12%, #5856D6 71.4%, #AF52DE 85.68%, #FF2D92 100%)',
        'rainbow-soft': 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 215, 0, 0.1) 50%, rgba(46, 139, 87, 0.1) 100%)',
        'gradient-primary': 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #2E8B57 0%, #4CAF50 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFD700 0%, #FFED4A 100%)',
      },
      
      // Z-Index層級
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'header': '1035',
        'bottom-nav': '1040',
        'modal-backdrop': '1050',
        'modal': '1060',
        'popover': '1070',
        'tooltip': '1080',
        'toast': '1090',
      },
      
      // 動畫與過渡
      transitionDuration: {
        'fast': '150ms',
        'base': '300ms',
        'slow': '500ms',
      },
      
      // 自定義動畫
      keyframes: {
        'rainbow-float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.8'
          },
          '50%': { 
            transform: 'translateY(-10px) rotate(180deg)',
            opacity: '1'
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.8)',
            transform: 'scale(1.05)'
          },
        },
        'slide-in-right': {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
        },
        'slide-out-right': {
          '0%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
          },
        },
      },
      
      animation: {
        'rainbow-float': 'rainbow-float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-gentle': 'bounce-gentle 1s infinite',
      },
      
      // 響應式斷點
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1200px',
        '2xl': '1920px',
      },
      
      // 最大寬度
      maxWidth: {
        'container': '1200px',
      },
    },
  },
  plugins: [
    // 自定義工具類
    function({ addUtilities }) {
      const newUtilities = {
        // Glass morphism 效果
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        
        // 彩虹文字效果 - 加強對比度
        '.text-rainbow': {
          background: 'linear-gradient(90deg, #FF3B30 0%, #FF9500 14.28%, #FFCC00 28.56%, #34C759 42.84%, #007AFF 57.12%, #5856D6 71.4%, #AF52DE 85.68%, #FF2D92 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          backgroundClip: 'text',
          fontWeight: '800',
        },
        
        // 安全區域內邊距
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top, 0)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left, 0)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right, 0)',
        },
        
        // 觸控友善點擊區域
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-target-lg': {
          minHeight: '48px',
          minWidth: '48px',
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}