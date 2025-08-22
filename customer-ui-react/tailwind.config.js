/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 彩虹主題色彩系統
      colors: {
        // 主要色彩
        primary: {
          50: '#FFF5F1',
          100: '#FFE8DD',
          200: '#FFD1BB',
          300: '#FFB088',
          400: '#FF8A5C',
          500: '#FF6B35', // --primary-color
          600: '#E64A1A', // --primary-dark
          700: '#CC3F17',
          800: '#A63314',
          900: '#7A2610',
          950: '#4F1809',
        },
        secondary: {
          50: '#F0F9F4',
          100: '#DCF2E4',
          200: '#BBE5CA',
          300: '#8DD3A5',
          400: '#5ABB7A',
          500: '#4CAF50', // --secondary-light
          600: '#2E8B57', // --secondary-color
          700: '#1E5A3A', // --secondary-dark
          800: '#16472D',
          900: '#0F3320',
          950: '#081F13',
        },
        accent: {
          50: '#FEFCE8',
          100: '#FEFBCC',
          200: '#FEF798',
          300: '#FFED4A', // --accent-light
          400: '#FDE047',
          500: '#FFD700', // --accent-color
          600: '#DAB500', // --accent-dark
          700: '#B8A00E',
          800: '#8A7A0A',
          900: '#5C5107',
          950: '#2E2A04',
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
        
        // 狀態色彩
        success: {
          50: '#F0F9F4',
          100: '#DCF2E4',
          500: '#4CAF50',
          600: '#45A049',
          700: '#3D8B40',
        },
        warning: {
          50: '#FFF8E1',
          100: '#FFECB3',
          500: '#FF9800',
          600: '#F57C00',
          700: '#EF6C00',
        },
        error: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#F44336',
          600: '#E53935',
          700: '#D32F2F',
        },
        info: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
        },
        
        // 文字色彩
        text: {
          primary: '#333333',
          secondary: '#666666',
          disabled: '#999999',
        },
        
        // 邊框色彩
        border: {
          light: '#E0E0E0',
          medium: '#CCCCCC',
          dark: '#999999',
        },
        
        // 背景色彩
        background: {
          default: '#FAFAFA',
          card: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
      },
      
      // 字體系統
      fontFamily: {
        'noto': ['Noto Sans TC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      
      // 字體大小
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
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
          filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 6px rgba(0, 0, 0, 0.6))',
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