# 📚 **彩虹餐廳員工UI系統 - 開發文檔 v2.0 - 前端部分**

---

## 📋 **文檔概述**

- **項目名稱**: Ranbow Restaurant Staff UI System  
- **版本**: 2.0.0 🚀 **重大架構優化版本**
- **更新日期**: 2025-01-23
- **最新更新內容**:
  - ✅ **v1.1**: 根據現有Java Spring後端結構重新設計前端目錄規範
  - ✅ **v1.1**: 更新API接口定義以對應實際的StaffController實現
  - ✅ **v1.1**: 前端目錄結構現在完全對應後端架構（Controller/Service/Model）
  - ✅ **v1.1**: API接口設計已與現有後端完全同步
  - ✅ **v1.2**: 制定後端架構整合計劃，建議刪除冗餘staff資料夾
  - ✅ **v1.2**: 在現有MVC架構中整合員工UI功能的具體實施方案
  - 🚀 **v2.0 NEW**: **完全重構前端架構** - Feature模組化設計，對應StaffController API分組
  - 🚀 **v2.0 NEW**: **完整API調用策略** - 包含Axios配置、Hook整合、WebSocket即時通訊
  - 🚀 **v2.0 NEW**: **狀態管理最佳實踐** - Zustand + React Query + TypeScript嚴格類型
  - 🚀 **v2.0 NEW**: **錯誤處理與性能優化** - ErrorBoundary、樂觀更新、請求去重
  - 🚀 **v2.0 NEW**: **生產級前端工程師實施指南** - 完整的代碼範例和最佳實踐
- **目標**: 建立高效、直觀的員工端操作界面，支援訂單管理、廚房工作流程、即時通訊
- **技術棧**: React + TypeScript + Tailwind CSS (前端) | Spring Boot + PostgreSQL + Redis + WebSocket (後端)

---

# 🎨 **第一部分：前端開發規範**

## 1. 前端架構要求

### 1.1 環境配置管理 🔧

#### **環境變量配置策略**

**基於客戶端應用模式的環境變量設計** (參考 `customer-ui-react/.env`)

**開發環境配置檔案** (`.env.development`):
```bash
# API Configuration - 開發環境
VITE_API_BASE_URL=http://localhost:8081/api
VITE_WS_BASE_URL=ws://localhost:8081/ws
VITE_API_TIMEOUT=10000

# WebSocket Configuration
VITE_WS_RECONNECT_INTERVAL=5000
VITE_WS_MAX_RECONNECT_ATTEMPTS=10
VITE_WS_HEARTBEAT_INTERVAL=30000

# Application Configuration
VITE_APP_TITLE=Ranbow Restaurant Staff UI
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=development
VITE_APP_DESCRIPTION=彩虹餐廳員工作業系統

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_VIBRATION=true

# Query Configuration  
VITE_QUERY_STALE_TIME=10000
VITE_QUERY_CACHE_TIME=300000
VITE_ORDERS_REFETCH_INTERVAL=30000
VITE_KITCHEN_REFETCH_INTERVAL=15000

# Development Settings
VITE_MOCK_API=false
VITE_DEBUG_MODE=true
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug

# Performance Configuration
VITE_REQUEST_TIMEOUT=8000
VITE_MAX_CONCURRENT_REQUESTS=10
VITE_CACHE_DURATION=300000

# Security Configuration
VITE_SESSION_TIMEOUT=28800000  # 8 hours in milliseconds
VITE_IDLE_TIMEOUT=1800000     # 30 minutes in milliseconds
```

**生產環境配置檔案** (`.env.production`):
```bash
# API Configuration - 生產環境
VITE_API_BASE_URL=http://192.168.0.113:8087/api
VITE_WS_BASE_URL=ws://192.168.0.113:8087/ws
VITE_API_TIMEOUT=12000

# WebSocket Configuration
VITE_WS_RECONNECT_INTERVAL=3000
VITE_WS_MAX_RECONNECT_ATTEMPTS=15
VITE_WS_HEARTBEAT_INTERVAL=20000

# Application Configuration
VITE_APP_TITLE=Ranbow Restaurant Staff UI
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production
VITE_APP_DESCRIPTION=彩虹餐廳員工作業系統

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_VIBRATION=true

# Query Configuration
VITE_QUERY_STALE_TIME=5000
VITE_QUERY_CACHE_TIME=600000
VITE_ORDERS_REFETCH_INTERVAL=20000
VITE_KITCHEN_REFETCH_INTERVAL=10000

# Development Settings
VITE_MOCK_API=false
VITE_DEBUG_MODE=false
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=warn

# Performance Configuration
VITE_REQUEST_TIMEOUT=10000
VITE_MAX_CONCURRENT_REQUESTS=15
VITE_CACHE_DURATION=600000

# Security Configuration
VITE_SESSION_TIMEOUT=14400000  # 4 hours in milliseconds
VITE_IDLE_TIMEOUT=900000       # 15 minutes in milliseconds
```

**測試環境配置檔案** (`.env.test`):
```bash
# API Configuration - 測試環境
VITE_API_BASE_URL=http://localhost:8081/api
VITE_WS_BASE_URL=ws://localhost:8081/ws
VITE_API_TIMEOUT=5000

# Application Configuration
VITE_APP_TITLE=Ranbow Restaurant Staff UI (Test)
VITE_APP_VERSION=2.0.0-test
VITE_ENVIRONMENT=test

# Feature Flags (Testing)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
VITE_ENABLE_NOTIFICATIONS=false
VITE_ENABLE_SOUND_EFFECTS=false
VITE_ENABLE_VIBRATION=false

# Development Settings
VITE_MOCK_API=true
VITE_DEBUG_MODE=true
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug

# Test Configuration
VITE_TEST_TIMEOUT=10000
VITE_TEST_USER_ID=test-staff-001
```

#### **環境變數類型定義** (`src/config/env.config.ts`)
```typescript
interface EnvironmentConfig {
  // API Configuration
  API_BASE_URL: string;
  WS_BASE_URL: string;
  API_TIMEOUT: number;
  
  // WebSocket Configuration
  WS_RECONNECT_INTERVAL: number;
  WS_MAX_RECONNECT_ATTEMPTS: number;
  WS_HEARTBEAT_INTERVAL: number;
  
  // Application Configuration
  APP_TITLE: string;
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'production' | 'test';
  APP_DESCRIPTION: string;
  
  // Feature Flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_PWA: boolean;
  ENABLE_DARK_MODE: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_SOUND_EFFECTS: boolean;
  ENABLE_VIBRATION: boolean;
  
  // Query Configuration
  QUERY_STALE_TIME: number;
  QUERY_CACHE_TIME: number;
  ORDERS_REFETCH_INTERVAL: number;
  KITCHEN_REFETCH_INTERVAL: number;
  
  // Development Settings
  MOCK_API: boolean;
  DEBUG_MODE: boolean;
  ENABLE_DEVTOOLS: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // Performance Configuration
  REQUEST_TIMEOUT: number;
  MAX_CONCURRENT_REQUESTS: number;
  CACHE_DURATION: number;
  
  // Security Configuration
  SESSION_TIMEOUT: number;
  IDLE_TIMEOUT: number;
}

export const ENV_CONFIG: EnvironmentConfig = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8081/ws',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // WebSocket Configuration
  WS_RECONNECT_INTERVAL: Number(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 5000,
  WS_MAX_RECONNECT_ATTEMPTS: Number(import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS) || 10,
  WS_HEARTBEAT_INTERVAL: Number(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL) || 30000,
  
  // Application Configuration
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Ranbow Restaurant Staff UI',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0',
  ENVIRONMENT: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'production' | 'test') || 'development',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || '彩虹餐廳員工作業系統',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA !== 'false', // Default true
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false', // Default true
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false', // Default true
  ENABLE_SOUND_EFFECTS: import.meta.env.VITE_ENABLE_SOUND_EFFECTS !== 'false', // Default true
  ENABLE_VIBRATION: import.meta.env.VITE_ENABLE_VIBRATION !== 'false', // Default true
  
  // Query Configuration
  QUERY_STALE_TIME: Number(import.meta.env.VITE_QUERY_STALE_TIME) || 10000,
  QUERY_CACHE_TIME: Number(import.meta.env.VITE_QUERY_CACHE_TIME) || 300000,
  ORDERS_REFETCH_INTERVAL: Number(import.meta.env.VITE_ORDERS_REFETCH_INTERVAL) || 30000,
  KITCHEN_REFETCH_INTERVAL: Number(import.meta.env.VITE_KITCHEN_REFETCH_INTERVAL) || 15000,
  
  // Development Settings
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  
  // Performance Configuration
  REQUEST_TIMEOUT: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 8000,
  MAX_CONCURRENT_REQUESTS: Number(import.meta.env.VITE_MAX_CONCURRENT_REQUESTS) || 10,
  CACHE_DURATION: Number(import.meta.env.VITE_CACHE_DURATION) || 300000,
  
  // Security Configuration
  SESSION_TIMEOUT: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 28800000, // 8 hours
  IDLE_TIMEOUT: Number(import.meta.env.VITE_IDLE_TIMEOUT) || 1800000, // 30 minutes
};

// 環境驗證函數
export const validateEnvironment = (): void => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_WS_BASE_URL',
    'VITE_APP_TITLE',
    'VITE_APP_VERSION'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error('缺少必要的環境變數:', missingVars);
    throw new Error(`缺少環境變數: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ 環境變數驗證通過');
  console.log('🌍 當前環境:', ENV_CONFIG.ENVIRONMENT);
  console.log('🔗 API Base URL:', ENV_CONFIG.API_BASE_URL);
  console.log('🔌 WebSocket URL:', ENV_CONFIG.WS_BASE_URL);
};

// 開發模式下的配置檢查
if (ENV_CONFIG.DEBUG_MODE) {
  console.table({
    '環境': ENV_CONFIG.ENVIRONMENT,
    'API URL': ENV_CONFIG.API_BASE_URL,
    'WebSocket URL': ENV_CONFIG.WS_BASE_URL,
    '除錯模式': ENV_CONFIG.DEBUG_MODE,
    'Mock API': ENV_CONFIG.MOCK_API,
  });
}
```

### 1.2 技術選型與配置

#### **核心依賴版本**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.5.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "react-hot-toast": "^2.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0"
  }
}
```

### 1.2 優化後的前端架構設計 🏗️

#### **基於後端API分析的最佳前端架構**

**🔍 後端API結構分析**：
```
✅ StaffController (/api/staff/*) - 員工UI的主要API
├── 員工認證: /login, /profile/{id}, /switch, /available/{id}  
├── 訂單管理: /orders/pending, /orders/in-progress, /orders/completed, /orders/{id}/status, /orders/{id}/details
├── 廚房操作: /kitchen/queue, /kitchen/start/{id}, /kitchen/timer/{id}, /kitchen/complete/{id}
├── 統計報表: /{id}/stats/daily, /{id}/stats/weekly, /{id}/stats/monthly, /team/stats, /leaderboard  
└── 通知管理: /notifications/{id}, /notifications/{id}/mark-read

✅ 相關支援API:
├── OrderController (/orders/*) - 完整訂單CRUD
├── MenuController (/menu/*) - 菜單資料
├── PaymentController (/payments/*) - 支付處理  
└── HealthController (/health/*) - 系統健康檢查
```

#### **重構後的前端目錄結構**
```
staff-ui-react/
├── public/
│   ├── icons/              # 應用圖標
│   │   ├── favicon.ico     # 網站圖標
│   │   ├── logo192.png     # PWA圖標
│   │   └── logo512.png     # PWA圖標
│   ├── sounds/             # 音效檔案
│   │   ├── new-order.mp3   # 新訂單提示音
│   │   ├── urgent-alert.mp3 # 緊急訂單警報
│   │   ├── order-ready.mp3 # 訂單完成提示音
│   │   └── notification.mp3 # 一般通知音
│   ├── manifest.json       # PWA配置
│   └── robots.txt          # SEO配置
│
├── src/
│   ├── app/               # 🎯 應用核心配置（類似Next.js結構）
│   │   ├── App.tsx        # 主應用元件  
│   │   ├── router.tsx     # 路由配置
│   │   ├── providers.tsx  # 全局Provider配置
│   │   └── store.ts       # 全局狀態管理整合
│   │
│   ├── features/          # 🎨 功能模組化架構（對應StaffController分組）
│   │   ├── auth/          # 員工認證模組
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── QuickSwitchPanel.tsx
│   │   │   │   ├── StaffProfileCard.tsx
│   │   │   │   └── AvailableStaffList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useStaffAuth.ts
│   │   │   │   ├── useQuickSwitch.ts
│   │   │   │   └── useStaffProfile.ts
│   │   │   ├── services/
│   │   │   │   └── authApi.ts          # 對應 /api/staff/login, /profile, /switch
│   │   │   ├── store/
│   │   │   │   └── authStore.ts        # 認證狀態管理
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts       # 認證相關類型
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       └── ProfilePage.tsx
│   │   │
│   │   ├── orders/        # 訂單管理模組
│   │   │   ├── components/
│   │   │   │   ├── OrderQueue.tsx      # 訂單隊列視圖
│   │   │   │   ├── OrderCard.tsx       # 訂單卡片
│   │   │   │   ├── OrderDetails.tsx    # 訂單詳情
│   │   │   │   ├── StatusUpdater.tsx   # 狀態更新器
│   │   │   │   ├── OrderFilters.tsx    # 訂單篩選器
│   │   │   │   └── OrderSearch.tsx     # 訂單搜尋
│   │   │   ├── hooks/
│   │   │   │   ├── useOrderQueue.ts    # 訂單隊列管理
│   │   │   │   ├── useOrderStatus.ts   # 狀態更新管理
│   │   │   │   └── useOrderDetails.ts  # 訂單詳情獲取
│   │   │   ├── services/
│   │   │   │   └── ordersApi.ts        # 對應 /api/staff/orders/*
│   │   │   ├── store/
│   │   │   │   └── ordersStore.ts      # 訂單狀態管理
│   │   │   ├── types/
│   │   │   │   └── orders.types.ts     # 訂單相關類型
│   │   │   └── pages/
│   │   │       ├── OrderManagementPage.tsx
│   │   │       ├── PendingOrdersPage.tsx
│   │   │       ├── InProgressOrdersPage.tsx
│   │   │       └── CompletedOrdersPage.tsx
│   │   │
│   │   ├── kitchen/       # 廚房操作模組
│   │   │   ├── components/
│   │   │   │   ├── KitchenQueue.tsx    # 廚房隊列
│   │   │   │   ├── CookingTimer.tsx    # 烹飪計時器
│   │   │   │   ├── WorkstationView.tsx # 工作台視圖
│   │   │   │   ├── PreparationList.tsx # 準備清單
│   │   │   │   └── KitchenDisplay.tsx  # 廚房顯示屏
│   │   │   ├── hooks/
│   │   │   │   ├── useKitchenQueue.ts  # 廚房隊列管理
│   │   │   │   ├── useCookingTimer.ts  # 計時器管理
│   │   │   │   └── useKitchenOperations.ts # 廚房操作
│   │   │   ├── services/
│   │   │   │   └── kitchenApi.ts       # 對應 /api/staff/kitchen/*
│   │   │   ├── store/
│   │   │   │   └── kitchenStore.ts     # 廚房狀態管理
│   │   │   ├── types/
│   │   │   │   └── kitchen.types.ts    # 廚房相關類型
│   │   │   └── pages/
│   │   │       ├── KitchenWorkstationPage.tsx
│   │   │       └── KitchenDisplayPage.tsx
│   │   │
│   │   ├── statistics/    # 統計報表模組
│   │   │   ├── components/
│   │   │   │   ├── DailyStatsCard.tsx  # 每日統計卡片
│   │   │   │   ├── PerformanceChart.tsx # 績效圖表
│   │   │   │   ├── TeamLeaderboard.tsx # 團隊排行榜
│   │   │   │   ├── EfficiencyMetrics.tsx # 效率指標
│   │   │   │   └── StatsFilters.tsx    # 統計篩選器
│   │   │   ├── hooks/
│   │   │   │   ├── useStaffStats.ts    # 員工統計
│   │   │   │   ├── useTeamStats.ts     # 團隊統計
│   │   │   │   └── useLeaderboard.ts   # 排行榜
│   │   │   ├── services/
│   │   │   │   └── statisticsApi.ts    # 對應 /api/staff/{id}/stats/*
│   │   │   ├── store/
│   │   │   │   └── statisticsStore.ts  # 統計狀態管理
│   │   │   ├── types/
│   │   │   │   └── statistics.types.ts # 統計相關類型
│   │   │   └── pages/
│   │   │       ├── PerformanceReportPage.tsx
│   │   │       ├── DailyStatsPage.tsx
│   │   │       ├── WeeklyStatsPage.tsx
│   │   │       ├── MonthlyStatsPage.tsx
│   │   │       └── TeamStatsPage.tsx
│   │   │
│   │   ├── notifications/ # 通知管理模組  
│   │   │   ├── components/
│   │   │   │   ├── NotificationCenter.tsx # 通知中心
│   │   │   │   ├── NotificationBadge.tsx  # 通知徽章
│   │   │   │   ├── NotificationItem.tsx   # 通知項目
│   │   │   │   ├── ToastNotification.tsx  # 彈窗通知
│   │   │   │   └── NotificationSettings.tsx # 通知設置
│   │   │   ├── hooks/
│   │   │   │   ├── useNotifications.ts    # 通知管理
│   │   │   │   ├── useToast.ts           # Toast通知
│   │   │   │   └── useWebSocket.ts       # WebSocket連接
│   │   │   ├── services/
│   │   │   │   ├── notificationsApi.ts   # 對應 /api/staff/notifications/*
│   │   │   │   └── websocketService.ts   # WebSocket服務
│   │   │   ├── store/
│   │   │   │   └── notificationsStore.ts # 通知狀態管理
│   │   │   ├── types/
│   │   │   │   └── notifications.types.ts # 通知相關類型
│   │   │   └── providers/
│   │   │       └── NotificationProvider.tsx # 通知上下文
│   │   │
│   │   └── dashboard/     # 儀表板模組
│   │       ├── components/
│   │       │   ├── DashboardGrid.tsx    # 儀表板網格
│   │       │   ├── QuickActions.tsx     # 快速操作
│   │       │   ├── StaffOverview.tsx    # 員工概覽
│   │       │   └── SystemStatus.tsx     # 系統狀態
│   │       ├── hooks/
│   │       │   └── useDashboard.ts      # 儀表板數據
│   │       ├── services/
│   │       │   └── dashboardApi.ts      # 儀表板API整合
│   │       ├── store/
│   │       │   └── dashboardStore.ts    # 儀表板狀態
│   │       ├── types/
│   │       │   └── dashboard.types.ts   # 儀表板類型
│   │       └── pages/
│   │           └── DashboardPage.tsx
│   │
│   ├── shared/            # 🔧 共享資源
│   │   ├── components/    # 通用UI組件
│   │   │   ├── ui/        # 基礎UI元件
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.types.ts
│   │   │   │   │   ├── Button.stories.tsx
│   │   │   │   │   └── Button.test.tsx
│   │   │   │   ├── Card/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Input/
│   │   │   │   ├── Select/
│   │   │   │   ├── Table/
│   │   │   │   └── Loading/
│   │   │   ├── layout/    # 佈局組件
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Footer/
│   │   │   │   └── PageLayout/
│   │   │   └── feedback/  # 反饋組件
│   │   │       ├── Toast/
│   │   │       ├── Alert/
│   │   │       └── ErrorBoundary/
│   │   │
│   │   ├── hooks/         # 通用Hooks
│   │   │   ├── useApi.ts           # API請求Hook
│   │   │   ├── useDebounce.ts      # 防抖Hook
│   │   │   ├── useLocalStorage.ts  # 本地存儲Hook
│   │   │   ├── usePermissions.ts   # 權限檢查Hook
│   │   │   └── useBreakpoint.ts    # 響應式斷點Hook
│   │   │
│   │   ├── services/      # 核心服務
│   │   │   ├── api/       # API核心服務
│   │   │   │   ├── client.ts       # Axios客戶端配置
│   │   │   │   ├── interceptors.ts # 請求/響應攔截器
│   │   │   │   ├── endpoints.ts    # API端點常量
│   │   │   │   └── types.ts        # API通用類型
│   │   │   ├── storage/   # 存儲服務
│   │   │   │   ├── localStorage.ts
│   │   │   │   ├── sessionStorage.ts
│   │   │   │   └── cache.ts
│   │   │   ├── auth/      # 認證服務
│   │   │   │   ├── tokenManager.ts
│   │   │   │   ├── permissions.ts
│   │   │   │   └── session.ts
│   │   │   └── utils/     # 工具服務
│   │   │       ├── validation.ts
│   │   │       ├── formatting.ts
│   │   │       ├── dateTime.ts
│   │   │       └── constants.ts
│   │   │
│   │   ├── types/         # 全局類型定義
│   │   │   ├── api.types.ts        # API相關類型
│   │   │   ├── common.types.ts     # 通用類型
│   │   │   ├── staff.types.ts      # 員工類型
│   │   │   ├── order.types.ts      # 訂單類型
│   │   │   ├── kitchen.types.ts    # 廚房類型
│   │   │   ├── notification.types.ts # 通知類型
│   │   │   └── statistics.types.ts # 統計類型
│   │   │
│   │   └── constants/     # 應用常量
│   │       ├── api.constants.ts    # API相關常量
│   │       ├── ui.constants.ts     # UI相關常量
│   │       ├── routes.constants.ts # 路由常量
│   │       └── app.constants.ts    # 應用配置常量
│   │
│   ├── assets/            # 靜態資源
│   │   ├── images/        # 圖片資源
│   │   │   ├── icons/     # SVG圖標
│   │   │   ├── logos/     # Logo文件
│   │   │   └── illustrations/ # 插圖
│   │   ├── fonts/         # 字體文件
│   │   └── styles/        # 全局樣式
│   │       ├── globals.css        # 全局CSS
│   │       ├── variables.css      # CSS變量
│   │       ├── components.css     # 組件樣式
│   │       └── animations.css     # 動畫效果
│   │
│   ├── config/            # 配置文件
│   │   ├── env.config.ts          # 環境配置
│   │   ├── api.config.ts          # API配置
│   │   ├── theme.config.ts        # 主題配置
│   │   ├── routes.config.ts       # 路由配置
│   │   └── app.config.ts          # 應用配置
│   │
│   ├── main.tsx           # 應用入口點
│   └── vite-env.d.ts      # Vite環境類型定義
│
├── tests/                 # 測試文件
│   ├── __mocks__/         # Mock文件
│   ├── setup.ts           # 測試設置
│   ├── utils.tsx          # 測試工具
│   └── coverage/          # 覆蓋率報告
│
├── docs/                  # 項目文檔
│   ├── api.md             # API文檔
│   ├── components.md      # 組件文檔
│   └── deployment.md      # 部署文檔
│
├── package.json           # 項目配置
├── vite.config.ts         # Vite配置
├── tailwind.config.js     # Tailwind配置
├── tsconfig.json          # TypeScript配置
├── eslint.config.js       # ESLint配置
├── prettier.config.js     # Prettier配置
├── vitest.config.ts       # 測試配置
└── README.md              # 項目說明
```

#### **架構設計亮點 ✨**

**🎯 特色功能模組化**
- 每個功能模組完全自包含（components, hooks, services, store, types, pages）
- 對應後端API的清晰映射
- 高內聚低耦合的設計原則

**🔧 共享資源集中化**
- UI組件庫統一管理
- 通用Hook可重複使用
- 核心服務統一配置

**📱 現代化React模式**
- 基於Hook的函數式組件
- TypeScript嚴格類型檢查
- 模組化狀態管理（Zustand）
- 響應式設計優先

## 1.3 API調用策略與最佳實踐 🚀

### **前端工程師API調用完整指南**

### 1.5 環境配置管理策略

#### **環境變數使用最佳實踐**

**1️⃣ 環境檢測與驗證** (`src/config/env.validation.ts`):
```typescript
import { ENV_CONFIG } from './env.config';

// 環境配置驗證規則
const ENV_VALIDATION_RULES = {
  API_BASE_URL: {
    required: true,
    pattern: /^https?:\/\/.+\/api$/,
    message: 'API_BASE_URL must be a valid URL ending with /api'
  },
  WS_BASE_URL: {
    required: true,
    pattern: /^wss?:\/\/.+\/ws$/,
    message: 'WS_BASE_URL must be a valid WebSocket URL ending with /ws'
  },
  API_TIMEOUT: {
    required: true,
    min: 1000,
    max: 30000,
    message: 'API_TIMEOUT must be between 1000-30000ms'
  },
  APP_VERSION: {
    required: true,
    pattern: /^\d+\.\d+\.\d+/,
    message: 'APP_VERSION must follow semantic versioning (x.y.z)'
  }
};

// 驗證函數
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 檢查 API URL 是否有效
  if (!ENV_CONFIG.API_BASE_URL.match(ENV_VALIDATION_RULES.API_BASE_URL.pattern)) {
    errors.push(ENV_VALIDATION_RULES.API_BASE_URL.message);
  }
  
  // 檢查 WebSocket URL 是否有效
  if (!ENV_CONFIG.WS_BASE_URL.match(ENV_VALIDATION_RULES.WS_BASE_URL.pattern)) {
    errors.push(ENV_VALIDATION_RULES.WS_BASE_URL.message);
  }
  
  // 檢查超時設定
  if (ENV_CONFIG.API_TIMEOUT < 1000 || ENV_CONFIG.API_TIMEOUT > 30000) {
    errors.push(ENV_VALIDATION_RULES.API_TIMEOUT.message);
  }
  
  // 檢查版本號格式
  if (!ENV_CONFIG.APP_VERSION.match(ENV_VALIDATION_RULES.APP_VERSION.pattern)) {
    errors.push(ENV_VALIDATION_RULES.APP_VERSION.message);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 開發模式環境變數警告
export const checkDevelopmentWarnings = (): void => {
  if (ENV_CONFIG.ENVIRONMENT === 'development') {
    const warnings: string[] = [];
    
    if (ENV_CONFIG.DEBUG_MODE) {
      warnings.push('⚠️ Debug mode is enabled - performance may be impacted');
    }
    
    if (ENV_CONFIG.MOCK_API) {
      warnings.push('🧪 Mock API is enabled - using simulated data');
    }
    
    if (!ENV_CONFIG.ENABLE_ANALYTICS) {
      warnings.push('📊 Analytics is disabled in development mode');
    }
    
    warnings.forEach(warning => console.warn(warning));
  }
};
```

**2️⃣ 環境切換工具** (`src/config/env.switcher.ts`):
```typescript
// 動態環境切換工具
type EnvironmentMode = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  API_BASE_URL: string;
  WS_BASE_URL: string;
  APP_TITLE: string;
  ENABLE_DEBUG: boolean;
}

const ENVIRONMENT_CONFIGS: Record<EnvironmentMode, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:8081/api',
    WS_BASE_URL: 'ws://localhost:8081/ws',
    APP_TITLE: 'Staff UI (Dev)',
    ENABLE_DEBUG: true,
  },
  staging: {
    API_BASE_URL: 'http://192.168.0.113:8087/api',
    WS_BASE_URL: 'ws://192.168.0.113:8087/ws',
    APP_TITLE: 'Staff UI (Staging)',
    ENABLE_DEBUG: true,
  },
  production: {
    API_BASE_URL: 'http://192.168.0.113:8087/api',
    WS_BASE_URL: 'ws://192.168.0.113:8087/ws',
    APP_TITLE: 'Staff UI',
    ENABLE_DEBUG: false,
  },
};

// 環境切換函數
export const switchEnvironment = (mode: EnvironmentMode): EnvironmentConfig => {
  const config = ENVIRONMENT_CONFIGS[mode];
  
  // 更新海量標題
  if (typeof document !== 'undefined') {
    document.title = config.APP_TITLE;
  }
  
  // 發出環境切換事件
  window.dispatchEvent(new CustomEvent('environment-changed', { 
    detail: { mode, config } 
  }));
  
  return config;
};
```

#### **🔧 API客戶端核心配置**

**Axios客戶端設置** (`src/shared/services/api/client.ts`)
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenManager } from '../auth/tokenManager';
import { ENV_CONFIG } from '../../../config/env.config';

// 創建Axios實例 - 使用環境變數配置
export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV_CONFIG.API_BASE_URL, // 動態載入: development | production | test
  timeout: ENV_CONFIG.API_TIMEOUT, // 動態載入: 8000-12000ms
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 請求攔截器 - 自動添加認證Token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加請求ID用於追蹤
    config.headers['X-Request-ID'] = generateRequestId();
    
    // 開發環境記錄請求
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 響應攔截器 - 統一錯誤處理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 成功響應處理
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    // 401 未授權 - Token過期處理
    if (response?.status === 401) {
      tokenManager.removeToken();
      window.location.href = '/staff-login';
      return Promise.reject(new Error('認證已過期，請重新登入'));
    }
    
    // 403 權限不足
    if (response?.status === 403) {
      return Promise.reject(new Error('權限不足，無法執行此操作'));
    }
    
    // 404 資源未找到
    if (response?.status === 404) {
      return Promise.reject(new Error('請求的資源不存在'));
    }
    
    // 500 伺服器錯誤
    if (response?.status >= 500) {
      return Promise.reject(new Error('伺服器錯誤，請稍後再試'));
    }
    
    // 網路錯誤
    if (!response) {
      return Promise.reject(new Error('網路連接失敗，請檢查網路狀態'));
    }
    
    return Promise.reject(error);
  }
);
```

#### **🎯 功能模組API服務設計**

**員工認證服務** (`src/features/auth/services/authApi.ts`)
```typescript
import { apiClient } from '../../../shared/services/api/client';
import { StaffLoginRequest, StaffProfile, StaffSwitchRequest } from '../types/auth.types';
import { ApiResponse } from '../../../shared/types/api.types';
import { API_ENDPOINTS } from '../../../shared/services/api/config';

export class AuthApiService {
  // 員工登入
  static async login(credentials: StaffLoginRequest): Promise<ApiResponse<{
    staff: StaffProfile;
    unreadNotifications: number;
  }>> {
    const response = await apiClient.post(API_ENDPOINTS.STAFF_LOGIN, credentials);
    return response.data;
  }

  // 獲取員工資料
  static async getProfile(staffId: string): Promise<ApiResponse<{
    profile: StaffProfile;
    todayStats: any;
    unreadNotifications: number;
  }>> {
    const response = await apiClient.get(API_ENDPOINTS.STAFF_PROFILE(staffId));
    return response.data;
  }

  // 快速切換員工
  static async switchStaff(switchData: StaffSwitchRequest): Promise<ApiResponse<{
    newStaff: StaffProfile;
  }>> {
    const response = await apiClient.post(API_ENDPOINTS.STAFF_SWITCH, switchData);
    return response.data;
  }

  // 獲取可切換員工列表
  static async getAvailableStaff(currentStaffId: string): Promise<StaffProfile[]> {
    const response = await apiClient.get(API_ENDPOINTS.STAFF_AVAILABLE(currentStaffId));
    return response.data;
  }
}
```

**訂單管理服務** (`src/features/orders/services/ordersApi.ts`)
```typescript
import { apiClient } from '../../../shared/services/api/client';
import { OrderStatusUpdateRequest } from '../types/orders.types';
import { ApiResponse } from '../../../shared/types/api.types';
import { API_ENDPOINTS } from '../../../shared/services/api/config';

export class OrdersApiService {
  // 獲取待處理訂單
  static async getPendingOrders(): Promise<ApiResponse<{
    pending: Order[];
    confirmed: Order[];
    total: number;
  }>> {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS_PENDING);
    return response.data;
  }

  // 獲取進行中訂單
  static async getInProgressOrders(): Promise<ApiResponse<{
    preparing: Order[];
    ready: Order[];
    total: number;
  }>> {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS_IN_PROGRESS);
    return response.data;
  }

  // 獲取已完成訂單
  static async getCompletedOrders(): Promise<ApiResponse<{
    delivered: Order[];
    completed: Order[];
    total: number;
  }>> {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS_COMPLETED);
    return response.data;
  }

  // 更新訂單狀態
  static async updateOrderStatus(
    orderId: string, 
    updateData: OrderStatusUpdateRequest
  ): Promise<ApiResponse<{
    order: Order;
  }>> {
    const response = await apiClient.put(API_ENDPOINTS.ORDER_STATUS_UPDATE(orderId), updateData);
    return response.data;
  }

  // 獲取訂單詳情
  static async getOrderDetails(orderId: string): Promise<ApiResponse<{
    order: Order;
    kitchenDetails: any;
    hasKitchenInfo: boolean;
  }>> {
    const response = await apiClient.get(API_ENDPOINTS.ORDER_DETAILS(orderId));
    return response.data;
  }
}
```

#### **📡 API 端點統一管理** (`src/shared/services/api/config.ts`)
```typescript
import { ENV_CONFIG } from '../../config/env.config';

// API 端點常量定義
export const API_ENDPOINTS = {
  // 員工認證相關
  STAFF_LOGIN: '/staff/login',
  STAFF_PROFILE: (staffId: string) => `/staff/profile/${staffId}`,
  STAFF_SWITCH: '/staff/switch',
  STAFF_AVAILABLE: (staffId: string) => `/staff/available/${staffId}`,
  
  // 訂單管理相關
  ORDERS_PENDING: '/staff/orders/pending',
  ORDERS_IN_PROGRESS: '/staff/orders/in-progress',
  ORDERS_COMPLETED: '/staff/orders/completed',
  ORDER_STATUS_UPDATE: (orderId: string) => `/staff/orders/${orderId}/status`,
  ORDER_DETAILS: (orderId: string) => `/staff/orders/${orderId}/details`,
  
  // 廚房操作相關
  KITCHEN_QUEUE: '/staff/kitchen/queue',
  KITCHEN_START: (orderId: string) => `/staff/kitchen/start/${orderId}`,
  KITCHEN_TIMER: (orderId: string) => `/staff/kitchen/timer/${orderId}`,
  KITCHEN_COMPLETE: (orderId: string) => `/staff/kitchen/complete/${orderId}`,
  
  // 統計報表相關
  STATS_DAILY: (staffId: string) => `/staff/${staffId}/stats/daily`,
  STATS_WEEKLY: (staffId: string) => `/staff/${staffId}/stats/weekly`,
  STATS_MONTHLY: (staffId: string) => `/staff/${staffId}/stats/monthly`,
  TEAM_STATS: '/staff/team/stats',
  LEADERBOARD: '/staff/leaderboard',
  
  // 通知管理相關
  NOTIFICATIONS: (staffId: string) => `/staff/notifications/${staffId}`,
  NOTIFICATIONS_MARK_READ: (staffId: string) => `/staff/notifications/${staffId}/mark-read`,
} as const;

// WebSocket 端點常量
export const WS_ENDPOINTS = {
  STAFF_CHANNEL: (staffId: string) => `/staff/${staffId}`,
  KITCHEN_CHANNEL: '/kitchen',
  NOTIFICATIONS_CHANNEL: '/notifications',
  BROADCAST_CHANNEL: '/broadcast',
} as const;

// HTTP 狀態碼常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// 錯誤訊息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '網路連接失敗，請檢查網路狀態',
  TIMEOUT_ERROR: '請求超時，請稍後再試',
  UNAUTHORIZED: '認證已過期，請重新登入',
  FORBIDDEN: '權限不足，無法執行此操作',
  NOT_FOUND: '請求的資源不存在',
  SERVER_ERROR: '伺服器錯誤，請稍後再試',
  VALIDATION_ERROR: '資料驗證失敗，請檢查輸入',
  CONFLICT_ERROR: '資源衝突，請重新操作',
  UNKNOWN_ERROR: '發生未知錯誤，請聯絡技術支援',
} as const;

// API 配置常量
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  TIMEOUT: ENV_CONFIG.API_TIMEOUT,
  RETRY_ATTEMPTS: ENV_CONFIG.ENVIRONMENT === 'production' ? 3 : 1,
  RETRY_DELAY: ENV_CONFIG.ENVIRONMENT === 'production' ? 1000 : 500,
  
  // 請求攔截器配置
  ENABLE_REQUEST_LOGGING: ENV_CONFIG.DEBUG_MODE,
  ENABLE_RESPONSE_LOGGING: ENV_CONFIG.DEBUG_MODE,
  ENABLE_ERROR_TRACKING: ENV_CONFIG.ENABLE_ANALYTICS,
  
  // 快取配置
  CACHE_ENABLED: ENV_CONFIG.ENVIRONMENT === 'production',
  CACHE_DURATION: ENV_CONFIG.CACHE_DURATION,
  
  // 安全配置
  ENABLE_CSRF_PROTECTION: ENV_CONFIG.ENVIRONMENT === 'production',
  ENABLE_RATE_LIMITING: ENV_CONFIG.ENVIRONMENT === 'production',
} as const;

// WebSocket 配置常量
export const WS_CONFIG = {
  BASE_URL: ENV_CONFIG.WS_BASE_URL,
  RECONNECT_INTERVAL: ENV_CONFIG.WS_RECONNECT_INTERVAL,
  MAX_RECONNECT_ATTEMPTS: ENV_CONFIG.WS_MAX_RECONNECT_ATTEMPTS,
  HEARTBEAT_INTERVAL: ENV_CONFIG.WS_HEARTBEAT_INTERVAL,
  
  // 訊息處理配置
  ENABLE_MESSAGE_LOGGING: ENV_CONFIG.DEBUG_MODE,
  MESSAGE_QUEUE_SIZE: ENV_CONFIG.ENVIRONMENT === 'production' ? 1000 : 100,
  
  // 通知配置
  ENABLE_SOUND: ENV_CONFIG.ENABLE_SOUND_EFFECTS,
  ENABLE_VIBRATION: ENV_CONFIG.ENABLE_VIBRATION,
  SOUND_VOLUME: ENV_CONFIG.ENVIRONMENT === 'production' ? 0.7 : 0.5,
  
  // 安全配置
  ENABLE_MESSAGE_VALIDATION: true,
  ENABLE_ORIGIN_CHECK: ENV_CONFIG.ENVIRONMENT === 'production',
} as const;

// React Query 配置
export const QUERY_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: ENV_CONFIG.QUERY_STALE_TIME,
      cacheTime: ENV_CONFIG.QUERY_CACHE_TIME,
      refetchOnWindowFocus: ENV_CONFIG.ENVIRONMENT === 'production',
      refetchOnReconnect: true,
      retry: ENV_CONFIG.ENVIRONMENT === 'production' ? 3 : 1,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: ENV_CONFIG.ENVIRONMENT === 'production' ? 2 : 0,
      onError: (error: any) => {
        if (ENV_CONFIG.DEBUG_MODE) {
          console.error('Mutation Error:', error);
        }
      },
    },
  },
};

// 輸出類型定義
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type WsEndpoint = typeof WS_ENDPOINTS[keyof typeof WS_ENDPOINTS];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
```

#### **🔗 React Hook整合模式**

**訂單隊列Hook** (`src/features/orders/hooks/useOrderQueue.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrdersApiService } from '../services/ordersApi';
import { useToast } from '../../../shared/hooks/useToast';
import { OrderStatusUpdateRequest } from '../types/orders.types';

export const useOrderQueue = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // 獲取待處理訂單
  const {
    data: pendingOrders,
    isLoading: isLoadingPending,
    error: pendingError,
    refetch: refetchPending
  } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: OrdersApiService.getPendingOrders,
    refetchInterval: ENV_CONFIG.ORDERS_REFETCH_INTERVAL, // 動態配置刷新間隔
    staleTime: ENV_CONFIG.QUERY_STALE_TIME, // 動態配置數據新鮮度
  });

  // 獲取進行中訂單
  const {
    data: inProgressOrders,
    isLoading: isLoadingInProgress,
    error: inProgressError
  } = useQuery({
    queryKey: ['orders', 'in-progress'],
    queryFn: OrdersApiService.getInProgressOrders,
    refetchInterval: ENV_CONFIG.KITCHEN_REFETCH_INTERVAL, // 動態配置廚房刷新間隔
  });

  // 更新訂單狀態
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updateData }: {
      orderId: string;
      updateData: OrderStatusUpdateRequest;
    }) => OrdersApiService.updateOrderStatus(orderId, updateData),
    onSuccess: (data) => {
      // 樂觀更新 - 立即更新本地狀態
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('訂單狀態更新成功');
    },
    onError: (error) => {
      toast.error(`訂單狀態更新失敗: ${error.message}`);
    },
  });

  // 批量操作
  const batchUpdateOrders = async (orderIds: string[], status: OrderStatus) => {
    const promises = orderIds.map(orderId => 
      updateOrderMutation.mutateAsync({
        orderId,
        updateData: { status, staffId: 'current-staff-id' }
      })
    );
    
    try {
      await Promise.all(promises);
      toast.success(`成功更新 ${orderIds.length} 個訂單狀態`);
    } catch (error) {
      toast.error('批量更新失敗');
    }
  };

  return {
    // 數據
    pendingOrders: pendingOrders?.data,
    inProgressOrders: inProgressOrders?.data,
    
    // 載入狀態
    isLoading: isLoadingPending || isLoadingInProgress,
    
    // 錯誤處理
    error: pendingError || inProgressError,
    
    // 操作方法
    updateOrderStatus: updateOrderMutation.mutate,
    batchUpdateOrders,
    refetchPending,
    
    // 狀態
    isUpdating: updateOrderMutation.isPending,
  };
};
```

#### **⚡ 即時通訊WebSocket整合**

**WebSocket服務** (`src/features/notifications/services/websocketService.ts`)
```typescript
import { toast } from 'react-hot-toast';
import { notificationsStore } from '../store/notificationsStore';
import { ordersStore } from '../../orders/store/ordersStore';
import { ENV_CONFIG } from '../../../shared/config/env.config';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = ENV_CONFIG.WS_MAX_RECONNECT_ATTEMPTS; // 動態配置
  private reconnectInterval = ENV_CONFIG.WS_RECONNECT_INTERVAL; // 動態配置

  constructor(private staffId: string) {}

  // 連接WebSocket
  connect() {
    const wsUrl = `${ENV_CONFIG.WS_BASE_URL}/staff/${this.staffId}`; // 動態WebSocket URL
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket 連接成功');
        this.reconnectAttempts = 0;
        this.sendHeartbeat();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket 連接關閉');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket 錯誤:', error);
      };

    } catch (error) {
      console.error('WebSocket 連接失敗:', error);
    }
  }

  // 處理接收到的訊息
  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'NEW_ORDER':
        this.handleNewOrder(message.data);
        break;
      case 'ORDER_STATUS_UPDATE':
        this.handleOrderStatusUpdate(message.data);
        break;
      case 'URGENT_ORDER_ALERT':
        this.handleUrgentOrder(message.data);
        break;
      case 'KITCHEN_CAPACITY_WARNING':
        this.handleKitchenWarning(message.data);
        break;
      case 'STAFF_NOTIFICATION':
        this.handleStaffNotification(message.data);
        break;
      default:
        console.warn('未知的WebSocket訊息類型:', message.type);
    }
  }

  // 處理新訂單通知
  private handleNewOrder(orderData: any) {
    // 更新訂單store
    ordersStore.getState().addNewOrder(orderData);
    
    // 顯示通知
    if (ENV_CONFIG.ENABLE_NOTIFICATIONS) {
      toast.success(`新訂單 #${orderData.orderNumber} - 桌號${orderData.tableNumber}`, {
        duration: 5000,
        icon: '🔔',
      });
    }
    
    // 播放音效
    this.playNotificationSound('new-order');
    
    // 震動提醒
    if (ENV_CONFIG.ENABLE_VIBRATION && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // 短震動
    }
    
    // 添加到通知中心
    notificationsStore.getState().addNotification({
      type: 'NEW_ORDER',
      title: '新訂單',
      message: `桌號${orderData.tableNumber}有新訂單 #${orderData.orderNumber}`,
      priority: 'HIGH',
      relatedOrderId: orderData.orderId,
      timestamp: new Date().toISOString(),
    });
  }

  // 處理緊急訂單警報
  private handleUrgentOrder(alertData: any) {
    // 緊急通知 - 持續顯示直到用戶確認
    if (ENV_CONFIG.ENABLE_NOTIFICATIONS) {
      toast.error(`🚨 緊急訂單！訂單 #${alertData.orderNumber} 已超時 ${alertData.overdueMinutes} 分鐘`, {
        duration: Infinity, // 持續顯示
        id: `urgent-order-${alertData.orderId}`, // 防止重複
      });
    }
    
    // 播放緊急音效
    this.playNotificationSound('urgent-alert');
    
    // 震動提醒
    if (ENV_CONFIG.ENABLE_VIBRATION && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]); // 緊急震動模式
    }
    
    // 更新訂單狀態為緊急
    ordersStore.getState().markOrderAsUrgent(alertData.orderId);
  }

  // 播放通知音效
  private playNotificationSound(soundType: 'new-order' | 'urgent-alert' | 'order-ready' | 'notification') {
    // 檢查音效功能是否啟用
    if (!ENV_CONFIG.ENABLE_SOUND_EFFECTS) {
      return;
    }
    
    const audio = new Audio(`/sounds/${soundType}.mp3`);
    audio.volume = 0.7;
    audio.play().catch(error => {
      console.warn('無法播放通知音效:', error);
    });
  }

  // 斷線重連
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`嘗試重新連接 WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('WebSocket 重連失敗，已達最大嘗試次數');
      if (ENV_CONFIG.ENABLE_NOTIFICATIONS) {
        toast.error('即時通訊連接失敗，請刷新頁面重試');
      }
    }
  }

  // 發送心跳包
  private sendHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'HEARTBEAT' }));
      }
    }, ENV_CONFIG.WS_HEARTBEAT_INTERVAL); // 動態配置心跳間隔
  }

  // 斷開連接
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

#### **🎨 狀態管理最佳實踐**

**訂單Store設計** (`src/features/orders/store/ordersStore.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Order, OrderStatus } from '../types/orders.types';

interface OrdersState {
  // 狀態
  pendingOrders: Order[];
  inProgressOrders: Order[];
  completedOrders: Order[];
  selectedOrder: Order | null;
  
  // UI狀態
  isLoading: boolean;
  error: string | null;
  filters: {
    status: OrderStatus[];
    dateRange: [Date, Date] | null;
    searchQuery: string;
  };
  
  // 操作方法
  setPendingOrders: (orders: Order[]) => void;
  setInProgressOrders: (orders: Order[]) => void;
  setCompletedOrders: (orders: Order[]) => void;
  addNewOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
  selectOrder: (order: Order | null) => void;
  markOrderAsUrgent: (orderId: string) => void;
  
  // 過濾和搜尋
  setFilters: (filters: Partial<OrdersState['filters']>) => void;
  getFilteredOrders: () => Order[];
  
  // 統計
  getOrderStats: () => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    urgent: number;
  };
  
  // 清理
  clearError: () => void;
  reset: () => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    immer((set, get) => ({
      // 初始狀態
      pendingOrders: [],
      inProgressOrders: [],
      completedOrders: [],
      selectedOrder: null,
      isLoading: false,
      error: null,
      filters: {
        status: [],
        dateRange: null,
        searchQuery: '',
      },

      // 設置訂單數據
      setPendingOrders: (orders) => set((state) => {
        state.pendingOrders = orders;
        state.isLoading = false;
        state.error = null;
      }),

      setInProgressOrders: (orders) => set((state) => {
        state.inProgressOrders = orders;
      }),

      setCompletedOrders: (orders) => set((state) => {
        state.completedOrders = orders;
      }),

      // 添加新訂單
      addNewOrder: (order) => set((state) => {
        if (order.status === 'PENDING') {
          state.pendingOrders.unshift(order);
        }
      }),

      // 更新訂單狀態
      updateOrderStatus: (orderId, status) => set((state) => {
        // 從所有列表中找到並更新訂單
        const allOrders = [
          ...state.pendingOrders,
          ...state.inProgressOrders,
          ...state.completedOrders
        ];
        
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
          order.status = status;
          order.updatedAt = new Date().toISOString();
          
          // 移動訂單到對應的列表
          state.pendingOrders = state.pendingOrders.filter(o => o.id !== orderId);
          state.inProgressOrders = state.inProgressOrders.filter(o => o.id !== orderId);
          state.completedOrders = state.completedOrders.filter(o => o.id !== orderId);
          
          if (status === 'PENDING' || status === 'CONFIRMED') {
            state.pendingOrders.push(order);
          } else if (status === 'PREPARING' || status === 'READY') {
            state.inProgressOrders.push(order);
          } else if (status === 'COMPLETED' || status === 'DELIVERED') {
            state.completedOrders.push(order);
          }
        }
      }),

      // 標記為緊急訂單
      markOrderAsUrgent: (orderId) => set((state) => {
        const allOrders = [
          ...state.pendingOrders,
          ...state.inProgressOrders,
          ...state.completedOrders
        ];
        
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
          order.priority = 'URGENT';
          order.isOverdue = true;
        }
      }),

      // 獲取過濾後的訂單
      getFilteredOrders: () => {
        const state = get();
        const allOrders = [
          ...state.pendingOrders,
          ...state.inProgressOrders,
          ...state.completedOrders
        ];

        return allOrders.filter(order => {
          // 狀態過濾
          if (state.filters.status.length > 0 && 
              !state.filters.status.includes(order.status)) {
            return false;
          }

          // 搜尋過濾
          if (state.filters.searchQuery) {
            const query = state.filters.searchQuery.toLowerCase();
            return (
              order.id.toString().includes(query) ||
              order.tableNumber?.toLowerCase().includes(query) ||
              order.customerName?.toLowerCase().includes(query)
            );
          }

          return true;
        });
      },

      // 獲取統計數據
      getOrderStats: () => {
        const state = get();
        const allOrders = [
          ...state.pendingOrders,
          ...state.inProgressOrders,
          ...state.completedOrders
        ];

        return {
          total: allOrders.length,
          pending: state.pendingOrders.length,
          inProgress: state.inProgressOrders.length,
          completed: state.completedOrders.length,
          urgent: allOrders.filter(o => o.priority === 'URGENT').length,
        };
      },

      // 工具方法
      selectOrder: (order) => set({ selectedOrder: order }),
      setFilters: (newFilters) => set((state) => {
        state.filters = { ...state.filters, ...newFilters };
      }),
      clearError: () => set({ error: null }),
      reset: () => set({
        pendingOrders: [],
        inProgressOrders: [],
        completedOrders: [],
        selectedOrder: null,
        error: null,
      }),
    })),
    {
      name: 'orders-store',
      partialize: (state) => ({
        // 只持久化必要的數據，排除敏感信息
        filters: state.filters,
      }),
    }
  )
);
```

#### **📱 錯誤處理與使用者體驗**

**全域錯誤邊界** (`src/shared/components/feedback/ErrorBoundary/ErrorBoundary.tsx`)
```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 錯誤上報
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 可以在這裡添加錯誤上報服務
    // errorReportingService.reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                系統發生錯誤
              </h1>
              <p className="text-gray-600 mb-4">
                抱歉，系統遇到了未預期的錯誤。請刷新頁面重試。
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  刷新頁面
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  重試
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-red-500">
                    開發模式：查看錯誤詳情
                  </summary>
                  <pre className="text-xs bg-red-50 p-2 rounded mt-2 overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### **🚀 性能優化策略**

**API請求優化技巧**：
1. **請求去重**: 使用React Query的重複請求去除
2. **預取數據**: 在路由切換前預載數據
3. **背景更新**: 使用staleTime和cacheTime優化
4. **樂觀更新**: 立即更新UI，後台同步API
5. **分頁載入**: 大量數據使用分頁或虛擬滾動
6. **請求取消**: 離開頁面時自動取消未完成請求

**狀態管理優化**：
1. **選擇性持久化**: 只持久化必要數據
2. **狀態分割**: 按功能模組分割store
3. **計算屬性**: 使用selector避免不必要的重新計算
4. **批次更新**: 合併多個狀態更新操作

## 2. UI/UX設計實施規範

### 2.1 彩虹主題色彩系統

#### **主色調定義（高飽和度）**
| 色彩用途 | HEX值 | RGB | HSL | 使用場景 |
|---------|-------|-----|-----|---------|
| 主色-橙紅 | #FF6B35 | 255,107,53 | 16°,100%,60% | 主要按鈕、重要標識 |
| 主色-深 | #E64A1A | 230,74,26 | 14°,82%,50% | 按鈕按下、active狀態 |
| 次色-綠 | #2E8B57 | 46,139,87 | 146°,50%,36% | 成功狀態、完成標記 |
| 強調-金 | #FFD700 | 255,215,0 | 51°,100%,50% | 星級、重要提示 |

#### **狀態色彩（高對比度）**
| 狀態 | 文字色 | 背景色 | 邊框色 | 對比度 |
|-----|--------|--------|--------|--------|
| 緊急 | #FFFFFF | #FF3B30 | #CC0000 | 7.2:1 |
| 處理中 | #FFFFFF | #FF9500 | #E68600 | 6.8:1 |
| 完成 | #FFFFFF | #34C759 | #2CA846 | 5.9:1 |
| 待處理 | #FFFFFF | #007AFF | #0051CC | 6.5:1 |
| 已取消 | #333333 | #E5E5EA | #C7C7CC | 8.1:1 |

### 2.2 字體與文字規範

#### **字體層級系統**
| 層級 | 字體大小 | 行高 | 字重 | 使用場景 |
|-----|---------|------|------|---------|
| H1 | 28px | 36px | 800 | 頁面標題 |
| H2 | 24px | 32px | 700 | 區塊標題 |
| H3 | 20px | 28px | 600 | 子標題 |
| Body Large | 18px | 28px | 500 | 重要內容 |
| Body | 16px | 24px | 400 | 一般內容 |
| Caption | 14px | 20px | 400 | 輔助說明 |
| Small | 12px | 16px | 400 | 次要信息 |

#### **特殊文字樣式**
- **訂單編號**: 20px, font-weight: 700, font-variant-numeric: tabular-nums
- **計時器**: 32px, font-weight: 800, font-family: monospace
- **金額**: 18px, font-weight: 600, font-variant-numeric: tabular-nums
- **狀態標籤**: 14px, font-weight: 600, text-transform: uppercase

### 2.3 互動元素規範

#### **觸控目標尺寸**
| 元素類型 | 最小尺寸 | 推薦尺寸 | 間距要求 |
|---------|---------|---------|---------|
| 主要按鈕 | 48×48px | 56×56px | 8px |
| 次要按鈕 | 44×44px | 48×48px | 8px |
| 圖標按鈕 | 44×44px | 48×48px | 8px |
| 列表項目 | 48px高 | 56px高 | 4px |
| 底部導航 | 56px高 | 64px高 | 0px |

#### **動畫與過渡**
| 動畫類型 | 持續時間 | 緩動函數 | 使用場景 |
|---------|---------|---------|---------|
| 快速過渡 | 150ms | ease-out | hover效果 |
| 標準過渡 | 300ms | ease-in-out | 狀態切換 |
| 緩慢過渡 | 500ms | ease-in-out | 頁面切換 |
| 脈動提醒 | 2000ms | ease-in-out | 緊急提示 |
| 彈跳動畫 | 1000ms | cubic-bezier | 新訂單提醒 |

## 3. 核心功能模組開發

### 3.1 員工認證模組

#### **登入頁面要求**
- 支援工號/Email + 密碼登入
- 提供快速員工切換功能（顯示最近4位員工）
- PIN碼快速登入選項
- 記住登入狀態功能
- 自動登出倒計時（閒置30分鐘）

#### **狀態管理結構**
```typescript
interface StaffAuthState {
  currentStaff: StaffMember | null
  isAuthenticated: boolean
  authToken: string | null
  refreshToken: string | null
  sessionStartTime: Date | null
  lastActivityTime: Date | null
  availableStaff: StaffMember[]
  workShift: WorkShift | null
}

interface StaffMember {
  staffId: string
  employeeNumber: string
  name: string
  role: 'KITCHEN' | 'SERVICE' | 'CASHIER' | 'MANAGER'
  department: string
  avatar?: string
  permissions: string[]
  quickSwitchEnabled: boolean
}
```

### 3.2 訂單管理模組

#### **訂單列表功能**
- 分類顯示：全部/待處理/進行中/已完成/已取消
- 排序選項：時間/桌號/金額/優先級
- 篩選功能：日期範圍/狀態/負責人
- 搜索功能：訂單號/桌號/顧客名
- 批量操作：批量接受/批量更新狀態

#### **訂單卡片顯示內容**
```typescript
interface OrderCardDisplay {
  // 必要信息
  orderNumber: string        // #12347
  tableNumber: string        // 桌號3
  orderStatus: OrderStatus   // 狀態標記
  totalAmount: number        // NT$ 580
  itemCount: number          // 3項商品
  
  // 時間信息
  orderTime: Date           // 下單時間
  elapsedTime: number       // 已過時間（分鐘）
  estimatedTime: number     // 預計完成時間
  isOverdue: boolean        // 是否超時
  
  // 優先級標記
  priority: 'NORMAL' | 'HIGH' | 'URGENT'
  hasSpecialRequest: boolean
  
  // 快捷操作
  quickActions: QuickAction[]
}
```

### 3.3 廚房工作台模組

#### **廚房隊列顯示**
- 區分顯示：正在製作/等待製作/即將完成
- 自動排序：按優先級和等待時間
- 計時器功能：每個訂單獨立計時
- 進度指示：顯示預計完成時間
- 容量管理：顯示當前製作能力

#### **製作計時器功能**
```typescript
interface CookingTimer {
  orderId: number
  startTime: Date
  pausedTime?: Date
  totalPausedDuration: number
  estimatedDuration: number
  actualDuration?: number
  
  // 狀態
  status: 'IDLE' | 'COOKING' | 'PAUSED' | 'COMPLETED'
  
  // 提醒設置
  alerts: {
    halfTime: boolean      // 時間過半提醒
    nearComplete: boolean  // 即將完成提醒
    overdue: boolean      // 超時提醒
  }
}
```

### 3.4 即時通訊模組

#### **WebSocket連接管理**
```typescript
interface WebSocketConfig {
  url: string                    // ws://localhost:8081/ws/staff
  reconnectInterval: number      // 5000ms
  maxReconnectAttempts: number   // 10
  heartbeatInterval: number      // 30000ms
  
  events: {
    onConnect: () => void
    onDisconnect: () => void
    onMessage: (data: WSMessage) => void
    onError: (error: Error) => void
  }
}

interface WSMessage {
  type: MessageType
  timestamp: Date
  data: any
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

type MessageType = 
  | 'NEW_ORDER'
  | 'ORDER_UPDATE' 
  | 'URGENT_ORDER'
  | 'KITCHEN_ALERT'
  | 'STAFF_MESSAGE'
  | 'SYSTEM_NOTIFICATION'
```

### 3.5 通知系統

#### **通知類型與處理**
| 通知類型 | 顯示方式 | 持續時間 | 音效 | 震動 |
|---------|---------|---------|------|------|
| 新訂單 | Toast + Badge | 5秒 | ✓ | ✓ |
| 緊急訂單 | Modal + Toast | 持續顯示 | ✓ (循環) | ✓ (長) |
| 狀態更新 | Badge | 3秒 | ✗ | ✗ |
| 系統消息 | Toast | 5秒 | ✗ | ✗ |
| 錯誤提示 | Modal | 需確認 | ✓ | ✓ |

## 4. 性能與優化要求

### 4.1 性能指標

| 指標 | 目標值 | 測量方法 |
|-----|--------|---------|
| 首次內容繪製(FCP) | < 1.5秒 | Lighthouse |
| 可交互時間(TTI) | < 2.5秒 | Lighthouse |
| 最大內容繪製(LCP) | < 2秒 | Web Vitals |
| 累積佈局偏移(CLS) | < 0.1 | Web Vitals |
| 首次輸入延遲(FID) | < 100ms | Web Vitals |

### 4.2 優化策略

- **代碼分割**: 路由級別懶加載
- **資源優化**: 圖片壓縮、WebP格式
- **緩存策略**: Service Worker、HTTP緩存
- **狀態管理**: 避免不必要的重新渲染
- **虛擬滾動**: 長列表性能優化

## 📦 **環境變數總結與對照表**

### **API URL 環境變數轉換對照表**

#### **原硬編碼 URL 與新環境變數對照**

| 功能領域 | 原硬編碼 URL | 新環境變數配置 |
|---------|--------------|----------------|
| **API 基礎 URL** | | |
| 開發環境 | `http://localhost:8081/api` | `ENV_CONFIG.API_BASE_URL` |
| 生產環境 | `http://192.168.0.113:8087/api` | `ENV_CONFIG.API_BASE_URL` |
| **WebSocket URL** | | |
| 開發環境 | `ws://localhost:8081/ws/staff` | `ENV_CONFIG.WS_BASE_URL + '/staff'` |
| 生產環境 | `ws://192.168.0.113:8087/ws/staff` | `ENV_CONFIG.WS_BASE_URL + '/staff'` |
| **API 端點** | | |
| 員工登入 | `'/api/staff/login'` | `API_ENDPOINTS.STAFF_LOGIN` |
| 員工訊息 | `'/api/staff/profile/{id}'` | `API_ENDPOINTS.STAFF_PROFILE(id)` |
| 訂單列表 | `'/api/staff/orders/pending'` | `API_ENDPOINTS.ORDERS_PENDING` |
| 訂單狀態 | `'/api/staff/orders/{id}/status'` | `API_ENDPOINTS.ORDER_STATUS_UPDATE(id)` |
| 廚房隊列 | `'/api/staff/kitchen/queue'` | `API_ENDPOINTS.KITCHEN_QUEUE` |
| 統計報表 | `'/api/staff/{id}/stats/daily'` | `API_ENDPOINTS.STATS_DAILY(id)` |
| 通知管理 | `'/api/staff/notifications/{id}'` | `API_ENDPOINTS.NOTIFICATIONS(id)` |

#### **配置參數環境變數轉換**

| 配置類型 | 原硬編碼值 | 新環境變數 |
|----------|------------|-------------|
| **API 配置** | | |
| 請求超時 | `10000ms` | `ENV_CONFIG.API_TIMEOUT` |
| 重試次數 | `3 times` | `API_CONFIG.RETRY_ATTEMPTS` |
| **WebSocket 配置** | | |
| 重連間隔 | `5000ms` | `ENV_CONFIG.WS_RECONNECT_INTERVAL` |
| 最大重連 | `10 times` | `ENV_CONFIG.WS_MAX_RECONNECT_ATTEMPTS` |
| 心跳間隔 | `30000ms` | `ENV_CONFIG.WS_HEARTBEAT_INTERVAL` |
| **查詢配置** | | |
| 數據新鮮度 | `10000ms` | `ENV_CONFIG.QUERY_STALE_TIME` |
| 快取時間 | `300000ms` | `ENV_CONFIG.QUERY_CACHE_TIME` |
| 訂單刷新 | `30000ms` | `ENV_CONFIG.ORDERS_REFETCH_INTERVAL` |
| 廚房刷新 | `15000ms` | `ENV_CONFIG.KITCHEN_REFETCH_INTERVAL` |
| **功能開關** | | |
| 除錯模式 | `process.env.NODE_ENV === 'development'` | `ENV_CONFIG.DEBUG_MODE` |
| 音效功能 | `true` (硬編碼) | `ENV_CONFIG.ENABLE_SOUND_EFFECTS` |
| 震動功能 | `true` (硬編碼) | `ENV_CONFIG.ENABLE_VIBRATION` |
| 通知功能 | `true` (硬編碼) | `ENV_CONFIG.ENABLE_NOTIFICATIONS` |

### **完整 .env 配置檔案範例**

#### **開發環境配置** (`.env.development`)
```bash
# ==============================================
# 彩虹餐廳員工UI系統 - 開發環境配置
# Staff UI Development Environment Configuration  
# ==============================================

# 🌐 API 配置
VITE_API_BASE_URL=http://localhost:8081/api
VITE_WS_BASE_URL=ws://localhost:8081/ws
VITE_API_TIMEOUT=10000

# 🔌 WebSocket 配置
VITE_WS_RECONNECT_INTERVAL=5000
VITE_WS_MAX_RECONNECT_ATTEMPTS=10
VITE_WS_HEARTBEAT_INTERVAL=30000

# 🎨 應用程式配置
VITE_APP_TITLE=彩虹餐廳員工UI系統
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=development
VITE_APP_DESCRIPTION=彩虹餐廳員工作業系統

# 🚀 功能開關
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_VIBRATION=true

# 🔄 查詢配置
VITE_QUERY_STALE_TIME=10000
VITE_QUERY_CACHE_TIME=300000
VITE_ORDERS_REFETCH_INTERVAL=30000
VITE_KITCHEN_REFETCH_INTERVAL=15000

# 👻 開發設定
VITE_MOCK_API=false
VITE_DEBUG_MODE=true
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug

# ⚡ 性能配置
VITE_REQUEST_TIMEOUT=8000
VITE_MAX_CONCURRENT_REQUESTS=10
VITE_CACHE_DURATION=300000

# 🔒 安全配置
VITE_SESSION_TIMEOUT=28800000     # 8小時
VITE_IDLE_TIMEOUT=1800000         # 30分鐘
```

#### **生產環境配置** (`.env.production`)
```bash
# ==============================================
# 彩虹餐廳員工UI系統 - 生產環境配置
# Staff UI Production Environment Configuration
# ==============================================

# 🌐 API 配置
VITE_API_BASE_URL=http://192.168.0.113:8087/api
VITE_WS_BASE_URL=ws://192.168.0.113:8087/ws
VITE_API_TIMEOUT=12000

# 🔌 WebSocket 配置
VITE_WS_RECONNECT_INTERVAL=3000
VITE_WS_MAX_RECONNECT_ATTEMPTS=15
VITE_WS_HEARTBEAT_INTERVAL=20000

# 🎨 應用程式配置
VITE_APP_TITLE=彩虹餐廳員工UI系統
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production
VITE_APP_DESCRIPTION=彩虹餐廳員工作業系統

# 🚀 功能開關
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_SOUND_EFFECTS=true
VITE_ENABLE_VIBRATION=true

# 🔄 查詢配置
VITE_QUERY_STALE_TIME=5000
VITE_QUERY_CACHE_TIME=600000
VITE_ORDERS_REFETCH_INTERVAL=20000
VITE_KITCHEN_REFETCH_INTERVAL=10000

# 👻 生產設定
VITE_MOCK_API=false
VITE_DEBUG_MODE=false
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=warn

# ⚡ 性能配置
VITE_REQUEST_TIMEOUT=10000
VITE_MAX_CONCURRENT_REQUESTS=15
VITE_CACHE_DURATION=600000

# 🔒 安全配置
VITE_SESSION_TIMEOUT=14400000     # 4小時
VITE_IDLE_TIMEOUT=900000          # 15分鐘
```

### **環境變數化效益總結**

#### **✅ 已完成的轉換項目**
- [x] **API 基礎 URL** - 從硬編碼轉換為環境變數
- [x] **WebSocket URL** - 支援動態配置  
- [x] **API 端點** - 統一管理於常數檔案
- [x] **配置參數** - 所有超時和間隔參數可配置
- [x] **功能開關** - Debug、音效、震動、通知等可控制
- [x] **查詢設定** - React Query 刷新策略可調整
- [x] **日誌等級** - 根據環境自動調整詳細度
- [x] **安全配置** - 生產環境安全參數優化

#### **🎁 主要效益**

**1. 開發效率提升**
- ✨ 一鍵切換不同環境配置
- 🚀 快速部署測試環境
- 🛠️ 支援多種部署場景

**2. 維護成本降低**
- 🔧 統一配置管理中心
- 📝 配置變更可追蹤
- 🔍 環境驗證防止錯誤

**3. 安全性提高**
- 🔒 敏感資訊不再硬編碼
- 🌍 環境特定安全策略
- 🛡️ 生產環境自動安全優化

**4. 性能優化**
- ⚡ 環境特定性能調整
- 📈 生產環境優化配置
- 🗜️ 智慧日誌等級控制

### **使用指南**

#### **快速開始**
```bash
# 1. 複製環境配置範本
cp .env.development.example .env.development

# 2. 編輯本地API位址
# 修改 VITE_API_BASE_URL 和 VITE_WS_BASE_URL

# 3. 驗證環境配置
npm run env:validate

# 4. 啟動開發環境
npm run dev
```

#### **部署流程**
```bash
# 開發環境
npm run build:dev

# 生產環境
npm run build:prod

# 測試環境
npm run build:test
```

---

🎉 **環境變數整合完成！**

本文檔已將所有硬編碼的 API URL、配置參數和功能開關成功轉換為環境變數管理系統。現在您可以透過修改 `.env` 檔案輕鬆切換不同環境配置，無需修改任何程式碼，大幅提升開發效率和系統維護性！

---