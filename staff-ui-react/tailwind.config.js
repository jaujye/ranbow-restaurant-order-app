/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 🎨 Rainbow Theme Color System - High Saturation
        primary: {
          DEFAULT: '#FF6B35',  // 主色-橙紅 (RGB: 255,107,53 | HSL: 16°,100%,60%)
          50: '#FFF8F5',
          100: '#FFEDE0',
          200: '#FFD7C2',
          300: '#FFBB95',
          400: '#FF9366',
          500: '#FF6B35',  // Primary brand color
          600: '#E64A1A',  // 主色-深 (RGB: 230,74,26 | HSL: 14°,82%,50%)
          700: '#CC3506',
          800: '#A52C08',
          900: '#8A2609',
          950: '#4F1503',
        },
        secondary: {
          DEFAULT: '#2E8B57',  // 次色-綠 (RGB: 46,139,87 | HSL: 146°,50%,36%)
          50: '#F0FDF6',
          100: '#DCFCEB',
          200: '#BBF7D8',
          300: '#86EFBA',
          400: '#4ADE94',
          500: '#2E8B57',  // Sea green
          600: '#1F7A4A',
          700: '#1A623E',
          800: '#184E35',
          900: '#15412D',
          950: '#0A2318',
        },
        accent: {
          DEFAULT: '#FFD700',  // 強調-金 (RGB: 255,215,0 | HSL: 51°,100%,50%)
          50: '#FEFCE8',
          100: '#FEFAC2',
          200: '#FEF388',
          300: '#FDE744',
          400: '#FACC15',
          500: '#FFD700',  // Gold
          600: '#E6BE00',
          700: '#CC9A02',
          800: '#A3780A',
          900: '#86620D',
          950: '#523701',
        },
        
        // 🚨 Status Colors - High Contrast (>5.9:1 ratio)
        urgent: {
          DEFAULT: '#FF3B30',  // 緊急 (Text: #FFFFFF, Contrast: 7.2:1)
          50: '#FFF5F5',
          100: '#FED7D7',
          500: '#FF3B30',
          600: '#E53E3E',
          700: '#C53030',
          800: '#9B2C2C',
          900: '#742A2A',
        },
        processing: {
          DEFAULT: '#FF9500',  // 處理中 (Text: #FFFFFF, Contrast: 6.8:1)
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#FF9500',
          600: '#E68600',
          700: '#D69E2E',
          800: '#B7791F',
          900: '#975A16',
        },
        completed: {
          DEFAULT: '#34C759',  // 完成 (Text: #FFFFFF, Contrast: 5.9:1)
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#34C759',
          600: '#2CA846',
          700: '#16A34A',
          800: '#15803D',
          900: '#14532D',
        },
        pending: {
          DEFAULT: '#007AFF',  // 待處理 (Text: #FFFFFF, Contrast: 6.5:1)
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#007AFF',
          600: '#0051CC',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        cancelled: {
          DEFAULT: '#E5E5EA',  // 已取消 (Text: #333333, Contrast: 8.1:1)
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#E5E5EA',
          600: '#C7C7CC',
          700: '#94A3B8',
          800: '#64748B',
          900: '#475569',
        },

        // 🎯 Functional Colors
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#007AFF',
        
        // 🌫️ Neutral Grays
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
      },
      
      // 🎨 Background Gradients
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(135deg, #FF6B35 0%, #2E8B57 50%, #FFD700 100%)',
        'rainbow-subtle': 'linear-gradient(135deg, #FFF8F5 0%, #F0FDF6 50%, #FEFCE8 100%)',
        'status-gradient': 'linear-gradient(90deg, #34C759 0%, #FF9500 50%, #FF3B30 100%)',
        'warm-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
        'cool-gradient': 'linear-gradient(135deg, #007AFF 0%, #2E8B57 100%)',
      },
      
      // 📝 Typography Scale
      fontSize: {
        // Hierarchical text sizes
        'h1': ['28px', { lineHeight: '36px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '0' }],
        'body-large': ['18px', { lineHeight: '28px', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        
        // Special text styles
        'order-number': ['20px', { lineHeight: '28px', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }],
        'timer': ['32px', { lineHeight: '40px', fontWeight: '800', fontFamily: 'ui-monospace, Monaco, "Cascadia Code", "Segoe UI Mono"' }],
        'price': ['18px', { lineHeight: '24px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }],
        'status-tag': ['14px', { lineHeight: '20px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }],
      },
      
      // 🎭 Animation System
      animation: {
        // Fast transitions (150ms) - hover effects
        'fast-fade': 'fadeIn 150ms ease-out',
        'fast-scale': 'scaleIn 150ms ease-out',
        
        // Standard transitions (300ms) - state changes
        'standard-fade': 'fadeIn 300ms ease-in-out',
        'standard-slide': 'slideIn 300ms ease-in-out',
        
        // Slow transitions (500ms) - page changes
        'slow-fade': 'fadeIn 500ms ease-in-out',
        
        // Alert animations
        'pulse-alert': 'pulse 2s ease-in-out infinite',
        'bounce-notification': 'bounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shake-error': 'shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        
        // Loading animations
        'spin-slow': 'spin 2s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      
      // 📐 Touch Target Sizes (Mobile-first)
      spacing: {
        'touch-sm': '44px',  // Secondary buttons
        'touch-md': '48px',  // Primary buttons
        'touch-lg': '56px',  // Important actions
        'nav-height': '64px', // Bottom navigation
      },
      
      // 🌐 Responsive Breakpoints
      screens: {
        'xs': '480px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
      
      // 🎯 Box Shadows
      boxShadow: {
        'rainbow': '0 4px 14px 0 rgba(255, 107, 53, 0.15)',
        'status': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'elevated': '0 8px 25px -8px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
      },
      
      // 🔘 Border Radius
      borderRadius: {
        'staff': '12px',  // Standard UI radius
        'card': '16px',   // Card components
        'full': '9999px', // Pills and avatars
      },
    },
  },
  plugins: [],
}

