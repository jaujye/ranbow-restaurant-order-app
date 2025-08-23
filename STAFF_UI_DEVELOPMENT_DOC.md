# 📚 **彩虹餐廳員工UI系統 - 開發文檔 v2.0**

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

### 1.1 技術選型與配置

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

#### **🔧 API客戶端核心配置**

**Axios客戶端設置** (`src/shared/services/api/client.ts`)
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenManager } from '../auth/tokenManager';
import { API_CONFIG } from '../../../config/api.config';

// 創建Axios實例
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL, // http://localhost:8081 (開發) | http://192.168.0.113:8087 (生產)
  timeout: API_CONFIG.TIMEOUT, // 10000ms
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
    if (process.env.NODE_ENV === 'development') {
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
    if (process.env.NODE_ENV === 'development') {
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

export class AuthApiService {
  // 員工登入
  static async login(credentials: StaffLoginRequest): Promise<ApiResponse<{
    staff: StaffProfile;
    unreadNotifications: number;
  }>> {
    const response = await apiClient.post('/api/staff/login', credentials);
    return response.data;
  }

  // 獲取員工資料
  static async getProfile(staffId: string): Promise<ApiResponse<{
    profile: StaffProfile;
    todayStats: any;
    unreadNotifications: number;
  }>> {
    const response = await apiClient.get(`/api/staff/profile/${staffId}`);
    return response.data;
  }

  // 快速切換員工
  static async switchStaff(switchData: StaffSwitchRequest): Promise<ApiResponse<{
    newStaff: StaffProfile;
  }>> {
    const response = await apiClient.post('/api/staff/switch', switchData);
    return response.data;
  }

  // 獲取可切換員工列表
  static async getAvailableStaff(currentStaffId: string): Promise<StaffProfile[]> {
    const response = await apiClient.get(`/api/staff/available/${currentStaffId}`);
    return response.data;
  }
}
```

**訂單管理服務** (`src/features/orders/services/ordersApi.ts`)
```typescript
import { apiClient } from '../../../shared/services/api/client';
import { OrderStatusUpdateRequest } from '../types/orders.types';
import { ApiResponse } from '../../../shared/types/api.types';

export class OrdersApiService {
  // 獲取待處理訂單
  static async getPendingOrders(): Promise<ApiResponse<{
    pending: Order[];
    confirmed: Order[];
    total: number;
  }>> {
    const response = await apiClient.get('/api/staff/orders/pending');
    return response.data;
  }

  // 獲取進行中訂單
  static async getInProgressOrders(): Promise<ApiResponse<{
    preparing: Order[];
    ready: Order[];
    total: number;
  }>> {
    const response = await apiClient.get('/api/staff/orders/in-progress');
    return response.data;
  }

  // 獲取已完成訂單
  static async getCompletedOrders(): Promise<ApiResponse<{
    delivered: Order[];
    completed: Order[];
    total: number;
  }>> {
    const response = await apiClient.get('/api/staff/orders/completed');
    return response.data;
  }

  // 更新訂單狀態
  static async updateOrderStatus(
    orderId: string, 
    updateData: OrderStatusUpdateRequest
  ): Promise<ApiResponse<{
    order: Order;
  }>> {
    const response = await apiClient.put(`/api/staff/orders/${orderId}/status`, updateData);
    return response.data;
  }

  // 獲取訂單詳情
  static async getOrderDetails(orderId: string): Promise<ApiResponse<{
    order: Order;
    kitchenDetails: any;
    hasKitchenInfo: boolean;
  }>> {
    const response = await apiClient.get(`/api/staff/orders/${orderId}/details`);
    return response.data;
  }
}
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
    refetchInterval: 30000, // 30秒自動刷新
    staleTime: 10000, // 10秒內數據視為新鮮
  });

  // 獲取進行中訂單
  const {
    data: inProgressOrders,
    isLoading: isLoadingInProgress,
    error: inProgressError
  } = useQuery({
    queryKey: ['orders', 'in-progress'],
    queryFn: OrdersApiService.getInProgressOrders,
    refetchInterval: 15000, // 15秒自動刷新
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

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor(private staffId: string) {}

  // 連接WebSocket
  connect() {
    const wsUrl = `ws://localhost:8081/ws/staff/${this.staffId}`;
    
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
    toast.success(`新訂單 #${orderData.orderNumber} - 桌號${orderData.tableNumber}`, {
      duration: 5000,
      icon: '🔔',
    });
    
    // 播放音效
    this.playNotificationSound('new-order');
    
    // 添加到通知中心
    notificationsStore.getState().addNotification({
      type: 'NEW_ORDER',
      title: '新訂單',
      message: `桌號${orderData.tableNumber}有新訂單 #${orderData.orderNumber}`,
      priority: 'HIGH',
      relatedOrderId: orderData.orderId,
    });
  }

  // 處理緊急訂單警報
  private handleUrgentOrder(alertData: any) {
    // 緊急通知 - 持續顯示直到用戶確認
    toast.error(`🚨 緊急訂單！訂單 #${alertData.orderNumber} 已超時 ${alertData.overdueMinutes} 分鐘`, {
      duration: Infinity, // 持續顯示
      id: `urgent-order-${alertData.orderId}`, // 防止重複
    });
    
    // 播放緊急音效
    this.playNotificationSound('urgent-alert');
    
    // 更新訂單狀態為緊急
    ordersStore.getState().markOrderAsUrgent(alertData.orderId);
  }

  // 播放通知音效
  private playNotificationSound(soundType: 'new-order' | 'urgent-alert' | 'order-ready' | 'notification') {
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
      toast.error('即時通訊連接失敗，請刷新頁面重試');
    }
  }

  // 發送心跳包
  private sendHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'HEARTBEAT' }));
      }
    }, 30000);
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

---

# 🔧 **第二部分：後端開發規範**

## 0. 後端架構整合計劃 📋

### 0.1 現有架構分析與整合建議

#### **現狀評估**

**✅ 現有員工功能已完整實現**
- **API層**: `StaffController.java` (完整的REST API)
- **服務層**: `StaffService.java`, `StaffStatisticsService.java` (完整業務邏輯)
- **DAO層**: `StaffDAO.java`, `StaffStatisticsDAO.java` (完整資料存取)
- **模型層**: `Staff.java`, `StaffStatistics.java` (完整資料模型)
- **支援服務**: `KitchenService.java`, `NotificationService.java` (相關功能)

**🗑️ 需要清理的冗餘結構**
```
❌ 建議刪除: src/main/java/com/ranbow/restaurant/staff/
├── config/StaffRedisConfig.java.tmp          # 臨時檔案
├── repository/StaffAuthRepository.java.bak   # 備份檔案  
└── service/StaffSessionRedisService.java.tmp # 臨時檔案
```

**原因**:
- 只包含 .tmp 和 .bak 臨時/備份檔案
- 所有實際功能已整合在主要架構中
- 遵循單一來源原則，避免重複

#### **整合策略：在現有MVC架構中擴展**

**🏗️ 架構原則**
```
現有結構 (保持不變):
src/main/java/com/ranbow/restaurant/
├── api/           # REST Controllers
├── services/      # Business Logic  
├── dao/           # Data Access Objects
├── models/        # Entity Models
├── config/        # Configuration Classes
└── utils/         # Utility Classes
```

### 0.2 員工UI功能擴展計劃

#### **需要新增/加強的檔案**

**🔧 配置層 (config/)**
```java
// 新增WebSocket配置 (已有備份檔案可參考)
✅ WebSocketConfig.java           # 統一的WebSocket配置
✅ StaffNotificationHandler.java  # 員工通知WebSocket處理器
✅ KitchenWebSocketHandler.java   # 廚房即時更新處理器

// Redis配置優化
✅ RedisConfig.java               # 已存在，需要加強員工會話管理
```

**📡 API層 (api/)**
```java
✅ StaffController.java           # 已完整實現
   - 員工登入認證 ✅
   - 訂單管理 ✅  
   - 廚房操作 ✅
   - 統計報表 ✅
   - 通知管理 ✅
   
// 可能需要新增的專用控制器
🔄 StaffWebSocketController.java # WebSocket連接管理
🔄 StaffDashboardController.java # 員工儀表板專用API
```

**⚙️ 服務層 (services/)**
```java
✅ StaffService.java              # 已完整實現
✅ StaffStatisticsService.java    # 已完整實現  
✅ KitchenService.java            # 已完整實現
✅ NotificationService.java       # 已完整實現

// 需要新增的服務
🔄 StaffWebSocketService.java    # WebSocket訊息廣播服務
🔄 StaffSessionService.java      # 員工會話管理服務
```

**💾 DAO層 (dao/)**
```java  
✅ StaffDAO.java                  # 已完整實現
✅ StaffStatisticsDAO.java        # 已完整實現
✅ KitchenOrderDAO.java           # 已完整實現
✅ NotificationDAO.java           # 已完整實現

// 可能需要新增
🔄 StaffSessionDAO.java           # 員工會話資料存取
```

**📊 模型層 (models/)**
```java
✅ Staff.java                     # 已完整實現
✅ StaffStatistics.java           # 已完整實現
✅ KitchenOrder.java              # 已完整實現  
✅ Notification.java              # 已完整實現

// 需要新增的模型
🔄 StaffSession.java              # 員工會話模型
🔄 WebSocketMessage.java          # WebSocket訊息模型
🔄 StaffWorkshift.java            # 員工班表模型
```

### 0.3 實施步驟建議

#### **第一階段：清理與優化 🧹**
```bash
1. 刪除冗餘staff資料夾
   rm -rf src/main/java/com/ranbow/restaurant/staff/

2. 驗證現有功能完整性
   - 測試StaffController所有端點
   - 確認Service層業務邏輯正確
   - 驗證DAO層資料存取功能
```

#### **第二階段：WebSocket整合 🔌**
```bash
1. 啟用現有WebSocket配置
   - 移除 .bak 後綴，啟用WebSocketConfig.java
   - 配置StaffNotificationHandler
   - 配置KitchenWebSocketHandler

2. 整合即時通訊功能
   - 新訂單即時推送
   - 廚房狀態同步  
   - 員工通知系統
```

#### **第三階段：前端整合 🎨**
```bash
1. 建立前端專案
   npx create-react-app staff-ui-react --template typescript

2. 配置API客戶端
   - Axios配置指向現有StaffController端點
   - WebSocket客戶端連接配置

3. 實現UI組件
   - 對應後端API的前端組件
   - WebSocket即時更新功能
```

### 0.4 檔案清理建議

#### **立即執行的清理操作**
```bash
# 刪除冗餘的staff資料夾 (只含臨時檔案)
rm -rf src/main/java/com/ranbow/restaurant/staff/

# 啟用WebSocket配置檔案
mv config/WebSocketConfig.java.bak config/WebSocketConfig.java
mv config/StaffNotificationHandler.java.bak config/StaffNotificationHandler.java  
mv config/KitchenWebSocketHandler.java.bak config/KitchenWebSocketHandler.java
```

#### **保持現有架構的優勢**
- ✅ 遵循Spring Boot最佳實踐
- ✅ 清晰的MVC分層架構  
- ✅ 單一來源原則
- ✅ 易於維護和擴展
- ✅ 代碼重用性高

---

## 1. 後端架構要求

### 1.1 技術棧與版本

```xml
<!-- Maven Dependencies -->
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.1.0</version>
    </dependency>
    
    <!-- WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
</dependencies>
```

### 1.2 包結構規範（基於現有架構）

#### **✅ 現有架構（已實現且運行中）**
```
com.ranbow.restaurant/
├── RestaurantApplication.java  # Spring Boot主應用程式類
│
├── api/                        # REST API控制器
│   ├── StaffController.java    # ✅ 員工相關API（完整實現）
│   ├── OrderController.java    # ✅ 訂單管理API
│   ├── MenuController.java     # 菜單管理API
│   ├── PaymentController.java  # 支付處理API
│   ├── UserController.java     # 用戶管理API
│   ├── AdminController.java    # 管理員API
│   ├── ReportController.java   # 報表API
│   └── HealthController.java   # 健康檢查API
│
├── services/                   # 業務邏輯層
│   ├── StaffService.java       # ✅ 員工業務邏輯（完整實現）
│   ├── StaffStatisticsService.java # ✅ 員工統計服務（完整實現）
│   ├── KitchenService.java     # ✅ 廚房管理服務（完整實現）
│   ├── NotificationService.java # ✅ 通知服務（完整實現）
│   ├── OrderService.java       # 訂單業務邏輯
│   ├── MenuService.java        # 菜單業務邏輯
│   ├── PaymentService.java     # 支付業務邏輯
│   ├── UserService.java        # 用戶業務邏輯
│   ├── AdminService.java       # 管理員業務邏輯
│   ├── ReportService.java      # 報表業務邏輯
│   ├── JwtService.java         # JWT認證服務
│   ├── SessionService.java     # 會話管理服務
│   └── AuditService.java       # 審計服務
│
├── dao/                        # 數據訪問層
│   ├── StaffDAO.java           # ✅ 員工資料存取（完整實現）
│   ├── StaffStatisticsDAO.java # ✅ 員工統計資料存取（完整實現）
│   ├── KitchenOrderDAO.java    # ✅ 廚房訂單資料存取（完整實現）
│   ├── NotificationDAO.java    # ✅ 通知資料存取（完整實現）
│   ├── OrderDAO.java           # 訂單資料存取
│   ├── MenuDAO.java            # 菜單資料存取
│   ├── PaymentDAO.java         # 支付資料存取
│   └── UserDAO.java            # 用戶資料存取
│
├── models/                     # 資料模型
│   ├── Staff.java              # ✅ 員工模型（完整實現）
│   ├── StaffStatistics.java    # ✅ 員工統計模型（完整實現）
│   ├── KitchenOrder.java       # ✅ 廚房訂單模型（完整實現）
│   ├── KitchenStatus.java      # ✅ 廚房狀態模型（完整實現）
│   ├── Notification.java       # ✅ 通知模型（完整實現）
│   ├── NotificationType.java   # ✅ 通知類型模型（完整實現）
│   ├── NotificationPriority.java # ✅ 通知優先級模型（完整實現）
│   ├── StatisticsPeriod.java   # ✅ 統計週期模型（完整實現）
│   ├── Order.java              # 訂單模型
│   ├── OrderItem.java          # 訂單項目模型
│   ├── OrderStatus.java        # 訂單狀態模型
│   ├── MenuItem.java           # 菜單項目模型
│   ├── MenuCategory.java       # 菜單分類模型
│   ├── Payment.java            # 支付模型
│   ├── PaymentMethod.java      # 支付方式模型
│   ├── PaymentStatus.java      # 支付狀態模型
│   ├── User.java               # 用戶模型
│   ├── UserRole.java           # 用戶角色模型
│   ├── UserAddress.java        # 用戶地址模型
│   ├── Coupon.java             # 優惠券模型
│   ├── CouponType.java         # 優惠券類型模型
│   ├── MemberLevel.java        # 會員等級模型
│   ├── AdminPermission.java    # 管理員權限模型
│   ├── AdminSession.java       # 管理員會話模型
│   ├── AuditLog.java           # 審計日誌模型
│   └── DashboardOverview.java  # 儀表板概覽模型
│
├── config/                     # 配置類
│   ├── DatabaseConfig.java     # 資料庫配置
│   ├── DatabaseInitializer.java # 資料庫初始化
│   ├── RedisConfig.java        # Redis配置
│   ├── SecurityConfig.java     # 安全配置
│   ├── AuthenticationInterceptor.java # 認證攔截器
│   ├── WebConfig.java          # Web配置
│   ├── WebSocketConfig.java.bak # WebSocket配置（備份檔，待啟用）
│   ├── StaffNotificationHandler.java.bak # 員工通知處理器（備份檔，待啟用）
│   └── KitchenWebSocketHandler.java.bak # 廚房WebSocket處理器（備份檔，待啟用）
│
├── core/                       # 核心組件
│   └── RestaurantApp.java      # 核心應用程式類
│
└── utils/                      # 工具類（空資料夾，待擴展）
```

#### **❌ 需要刪除的冗餘結構**
```
com.ranbow.restaurant.staff/    # 🗑️ 建議完全刪除
├── config/
│   └── StaffRedisConfig.java.tmp       # 臨時檔案，無實際功能
├── repository/
│   └── StaffAuthRepository.java.bak    # 備份檔案，功能已整合到主架構
└── service/
    └── StaffSessionRedisService.java.tmp # 臨時檔案，無實際功能
```

#### **整合優勢分析**
✅ **現有架構優勢**：
- 遵循標準Spring Boot MVC架構
- 清晰的分層設計（API → Service → DAO → Model）
- 單一來源原則，避免重複代碼
- 易於維護和擴展
- 所有員工相關功能已完整實現並運行中

✅ **員工UI功能覆蓋完整性**：
- StaffController：完整REST API端點 ✅
- StaffService：完整業務邏輯 ✅
- StaffDAO：完整資料存取 ✅
- 相關支援服務（Kitchen, Notification）已實現 ✅
- 統計功能完整實現 ✅

## 2. API接口定義

### 2.1 員工認證API（基於現有StaffController）

#### **POST /api/staff/login**
**功能**: 員工登入
```json
// Request
{
  "identifier": "ST001",  // 工號或Email
  "password": "password123"
}

// Response 200
{
  "success": true,
  "message": "登入成功",
  "staff": {
    "staffId": "550e8400-e29b-41d4-a716-446655440000",
    "employeeNumber": "ST001",
    "name": "李小華",
    "role": "KITCHEN",
    "department": "廚房",
    "email": "li.xiaohua@ranbow.com",
    "phone": "0912345678",
    "isOnDuty": true,
    "currentShiftStart": "2024-01-22T09:00:00",
    "todayOrdersProcessed": 15,
    "averageProcessingTime": 18.5
  },
  "unreadNotifications": 3
}
```

#### **GET /api/staff/profile/{staffId}**
**功能**: 獲取員工資料
```json
// Response 200
{
  "profile": {
    "staffId": "550e8400-e29b-41d4-a716-446655440000",
    "employeeNumber": "ST001",
    "name": "李小華",
    "role": "KITCHEN",
    "department": "廚房",
    "isOnDuty": true,
    "todayOrdersProcessed": 15,
    "averageProcessingTime": 18.5
  },
  "todayStats": {
    "ordersCompleted": 15,
    "averageTime": 18.5,
    "efficiencyScore": 95.5
  },
  "unreadNotifications": 3
}
```

#### **POST /api/staff/switch**
**功能**: 快速切換員工
```json
// Request
{
  "fromStaffId": "550e8400-e29b-41d4-a716-446655440000",
  "toStaffId": "660e8400-e29b-41d4-a716-446655440001"
}

// Response 200
{
  "success": true,
  "message": "員工切換成功",
  "newStaff": {
    "staffId": "660e8400-e29b-41d4-a716-446655440001",
    "name": "王大明",
    "role": "SERVICE"
  }
}
```

#### **GET /api/staff/available/{currentStaffId}**
**功能**: 獲取可切換員工列表
```json
// Response 200
[
  {
    "staffId": "660e8400-e29b-41d4-a716-446655440001",
    "employeeNumber": "ST002",
    "name": "王大明",
    "role": "SERVICE",
    "isOnDuty": true
  },
  {
    "staffId": "770e8400-e29b-41d4-a716-446655440002",
    "employeeNumber": "ST003",
    "name": "張小美",
    "role": "CASHIER",
    "isOnDuty": false
  }
]
```

### 2.2 訂單管理API（基於現有StaffController）

#### **GET /api/staff/orders/pending**
**功能**: 獲取待處理訂單
```json
// Response 200
{
  "pending": [
    {
      "id": 12347,
      "userId": 101,
      "status": "PENDING",
      "totalAmount": 940.00,
      "items": [
        {
          "menuItemId": 1,
          "quantity": 2,
          "price": 470.00,
          "specialRequests": "不要洋蔥"
        }
      ],
      "createdAt": "2024-01-22T14:25:00",
      "tableNumber": "3",
      "customerName": "王先生",
      "customerPhone": "0912345678"
    }
  ],
  "confirmed": [
    {
      "id": 12346,
      "status": "CONFIRMED",
      "totalAmount": 580.00
    }
  ],
  "total": 2
}
```

#### **GET /api/staff/orders/in-progress**
**功能**: 獲取進行中訂單
```json
// Response 200
{
  "preparing": [
    {
      "id": 12345,
      "status": "PREPARING",
      "totalAmount": 780.00,
      "items": [...],
      "assignedStaff": "ST001",
      "estimatedCompleteTime": "2024-01-22T14:45:00"
    }
  ],
  "ready": [
    {
      "id": 12344,
      "status": "READY",
      "totalAmount": 450.00,
      "completedAt": "2024-01-22T14:20:00"
    }
  ],
  "total": 2
}
```

#### **GET /api/staff/orders/completed**
**功能**: 獲取已完成訂單
```json
// Response 200
{
  "delivered": [
    {
      "id": 12343,
      "status": "DELIVERED",
      "totalAmount": 680.00,
      "deliveredAt": "2024-01-22T14:00:00"
    }
  ],
  "completed": [
    {
      "id": 12342,
      "status": "COMPLETED",
      "totalAmount": 320.00,
      "completedAt": "2024-01-22T13:45:00"
    }
  ],
  "total": 2
}
```

#### **PUT /api/staff/orders/{orderId}/status**
**功能**: 更新訂單狀態
```json
// Request
{
  "status": "PREPARING",  // PENDING, CONFIRMED, PREPARING, READY, DELIVERED, COMPLETED, CANCELLED
  "staffId": "ST001",
  "notes": "開始製作"
}

// Response 200
{
  "success": true,
  "message": "訂單狀態已更新",
  "order": {
    "id": 12347,
    "status": "PREPARING",
    "updatedAt": "2024-01-22T14:30:00"
  }
}
```

#### **GET /api/staff/orders/{orderId}/details**
**功能**: 獲取訂單詳細資訊
```json
// Response 200
{
  "order": {
    "id": 12347,
    "userId": 101,
    "status": "PREPARING",
    "totalAmount": 940.00,
    "items": [
      {
        "menuItemId": 1,
        "menuItemName": "招牌牛排",
        "quantity": 2,
        "price": 470.00,
        "specialRequests": "不要洋蔥"
      }
    ],
    "createdAt": "2024-01-22T14:25:00",
    "tableNumber": "3",
    "customerName": "王先生",
    "customerPhone": "0912345678",
    "paymentMethod": "CASH",
    "paymentStatus": "PENDING"
  },
  "kitchenDetails": {
    "orderId": 12347,
    "staffId": "ST001",
    "startTime": "2024-01-22T14:30:00",
    "estimatedMinutesRemaining": 15,
    "status": "COOKING"
  },
  "hasKitchenInfo": true
}
```

### 2.3 廚房工作台API（基於現有StaffController）

#### **GET /api/staff/kitchen/queue**
**功能**: 獲取廚房隊列
```json
// Response 200
{
  "queued": [
    {
      "kitchenOrderId": "ko-001",
      "orderId": 12347,
      "status": "QUEUED",
      "priority": "NORMAL",
      "estimatedPrepTime": 25,
      "queuePosition": 1
    }
  ],
  "active": [
    {
      "kitchenOrderId": "ko-002",
      "orderId": 12346,
      "status": "COOKING",
      "staffId": "ST001",
      "startTime": "2024-01-22T14:25:00",
      "estimatedMinutesRemaining": 10
    }
  ],
  "overdue": [
    {
      "kitchenOrderId": "ko-003",
      "orderId": 12345,
      "status": "OVERDUE",
      "overdueMinutes": 5
    }
  ],
  "totalQueued": 1,
  "totalActive": 1,
  "totalOverdue": 1
}
```

#### **POST /api/staff/kitchen/start/{orderId}**
**功能**: 開始製作訂單
```json
// Request
{
  "staffId": "ST001"
}

// Response 200
{
  "success": true,
  "message": "開始準備訂單",
  "orderId": "12347",
  "staffId": "ST001"
}
```

#### **PUT /api/staff/kitchen/timer/{orderId}**
**功能**: 更新製作計時器
```json
// Request
{
  "estimatedMinutesRemaining": 15,
  "notes": "正在烹飪主菜"
}

// Response 200
{
  "success": true,
  "message": "計時器已更新",
  "orderId": "12347",
  "estimatedMinutesRemaining": 15
}
```

#### **POST /api/staff/kitchen/complete/{orderId}**
**功能**: 完成訂單製作
```json
// Request
{
  "staffId": "ST001"
}

// Response 200
{
  "success": true,
  "message": "訂單製作完成",
  "orderId": "12347",
  "completedBy": "ST001"
}
```

### 2.4 統計與報表API（基於現有StaffController）

#### **GET /api/staff/{staffId}/stats/daily**
**功能**: 獲取每日績效統計
```json
// Request Query Parameters
?date=2024-01-22  // 可選，預設為今天

// Response 200
{
  "date": "2024-01-22",
  "statistics": {
    "staffId": "ST001",
    "statisticsId": "stat-001",
    "period": "DAILY",
    "ordersProcessed": 24,
    "ordersCompleted": 22,
    "ordersCancelled": 1,
    "averageProcessingTime": 18.5,
    "efficiencyScore": 95.5,
    "totalRevenue": 12580.00,
    "hoursWorked": 5.5,
    "overtimeHours": 0.0,
    "customerRating": 4.8,
    "periodStart": "2024-01-22T00:00:00",
    "periodEnd": "2024-01-22T23:59:59"
  },
  "hasData": true
}
```

#### **GET /api/staff/{staffId}/stats/weekly**
**功能**: 獲取每週績效統計
```json
// Request Query Parameters
?weekStart=2024-01-15  // 可選，預設為本週

// Response 200
{
  "statistics": {
    "staffId": "ST001",
    "period": "WEEKLY",
    "ordersProcessed": 145,
    "ordersCompleted": 140,
    "ordersCancelled": 3,
    "averageProcessingTime": 17.2,
    "efficiencyScore": 96.8,
    "totalRevenue": 78450.00,
    "hoursWorked": 38.5,
    "overtimeHours": 2.5,
    "customerRating": 4.7,
    "periodStart": "2024-01-15T00:00:00",
    "periodEnd": "2024-01-21T23:59:59"
  },
  "hasData": true
}
```

#### **GET /api/staff/{staffId}/stats/monthly**
**功能**: 獲取每月績效統計
```json
// Request Query Parameters
?monthStart=2024-01-01  // 可選，預設為本月

// Response 200
{
  "statistics": {
    "staffId": "ST001",
    "period": "MONTHLY",
    "ordersProcessed": 580,
    "ordersCompleted": 565,
    "ordersCancelled": 10,
    "averageProcessingTime": 16.8,
    "efficiencyScore": 97.4,
    "totalRevenue": 325600.00,
    "hoursWorked": 168.0,
    "overtimeHours": 12.0,
    "customerRating": 4.6,
    "periodStart": "2024-01-01T00:00:00",
    "periodEnd": "2024-01-31T23:59:59"
  },
  "hasData": true
}
```

#### **GET /api/staff/team/stats**
**功能**: 獲取團隊績效指標
```json
// Response 200
{
  "totalStaff": 8,
  "activeStaff": 5,
  "todayOrdersProcessed": 125,
  "todayAverageProcessingTime": 17.5,
  "todayEfficiencyScore": 94.2,
  "todayRevenue": 58900.00,
  "topPerformers": [
    {
      "staffId": "ST001",
      "name": "李小華",
      "ordersProcessed": 24,
      "efficiencyScore": 95.5
    },
    {
      "staffId": "ST002",
      "name": "王大明",
      "ordersProcessed": 20,
      "efficiencyScore": 93.2
    }
  ],
  "departmentStats": {
    "KITCHEN": {
      "staffCount": 3,
      "ordersProcessed": 75,
      "averageTime": 18.5
    },
    "SERVICE": {
      "staffCount": 3,
      "ordersProcessed": 30,
      "averageTime": 12.3
    },
    "CASHIER": {
      "staffCount": 2,
      "ordersProcessed": 20,
      "averageTime": 5.5
    }
  }
}
```

#### **GET /api/staff/leaderboard**
**功能**: 獲取員工排行榜
```json
// Request Query Parameters
?period=DAILY&limit=10

// Response 200
{
  "period": "DAILY",
  "leaderboard": [
    {
      "rank": 1,
      "staffId": "ST001",
      "name": "李小華",
      "department": "KITCHEN",
      "ordersProcessed": 24,
      "efficiencyScore": 95.5,
      "averageTime": 18.5
    },
    {
      "rank": 2,
      "staffId": "ST002",
      "name": "王大明",
      "department": "SERVICE",
      "ordersProcessed": 20,
      "efficiencyScore": 93.2,
      "averageTime": 12.3
    }
  ],
  "totalEntries": 2
}
```

### 2.5 通知管理API（基於現有StaffController）

#### **GET /api/staff/notifications/{staffId}**
**功能**: 獲取員工通知
```json
// Request Query Parameters
?unreadOnly=false  // 是否只獲取未讀通知

// Response 200
{
  "notifications": [
    {
      "notificationId": "notif-001",
      "staffId": "ST001",
      "type": "NEW_ORDER",
      "priority": "HIGH",
      "title": "新訂單",
      "message": "桌號3有新訂單 #12347",
      "isRead": false,
      "createdAt": "2024-01-22T14:30:00",
      "relatedOrderId": 12347
    },
    {
      "notificationId": "notif-002",
      "staffId": "ST001",
      "type": "ORDER_OVERDUE",
      "priority": "URGENT",
      "title": "訂單超時",
      "message": "訂單 #12345 已超時5分鐘",
      "isRead": false,
      "createdAt": "2024-01-22T14:35:00",
      "relatedOrderId": 12345
    }
  ],
  "unreadCount": 2,
  "totalCount": 2
}
```

#### **POST /api/staff/notifications/{staffId}/mark-read**
**功能**: 標記通知為已讀
```json
// Request (標記單個通知)
{
  "notificationId": "notif-001"
}

// Response 200
{
  "success": true,
  "message": "通知已標記為已讀"
}

// Request (標記所有通知) - 不傳送body
// Response 200
{
  "success": true,
  "message": "所有通知已標記為已讀",
  "markedCount": 5
}
```

### 2.6 WebSocket即時通訊

#### **WebSocket端點: ws://localhost:8081/ws/staff/{staffId}**

**訂閱訊息類型**
```javascript
// 1. 新訂單通知
{
  "type": "NEW_ORDER",
  "timestamp": "2024-01-22T14:30:00",
  "priority": "HIGH",
  "data": {
    "orderId": 12348,
    "orderNumber": "ORD-20240122-002",
    "tableNumber": "5",
    "itemCount": 3,
    "totalAmount": 580,
    "isUrgent": false
  }
}

// 2. 訂單狀態更新
{
  "type": "ORDER_STATUS_UPDATE",
  "timestamp": "2024-01-22T14:35:00",
  "data": {
    "orderId": 12347,
    "previousStatus": "PENDING",
    "newStatus": "PROCESSING",
    "updatedBy": "王大明"
  }
}

// 3. 緊急訂單警報
{
  "type": "URGENT_ORDER_ALERT",
  "timestamp": "2024-01-22T14:40:00",
  "priority": "URGENT",
  "data": {
    "orderId": 12349,
    "reason": "OVERTIME",
    "overdueMinutes": 10,
    "tableNumber": "8",
    "requiresImmediate": true
  }
}

// 4. 廚房容量警告
{
  "type": "KITCHEN_CAPACITY_WARNING",
  "timestamp": "2024-01-22T14:45:00",
  "data": {
    "currentCapacity": 95,
    "queueLength": 15,
    "estimatedDelay": 10  // 分鐘
  }
}
```

## 3. 資料庫設計

### 3.1 員工相關表結構

#### **staff_members表**
```sql
CREATE TABLE staff_members (
    staff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    quick_switch_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    INDEX idx_employee_number (employee_number),
    INDEX idx_role (role),
    INDEX idx_department (department)
);
```

#### **work_shifts表**
```sql
CREATE TABLE work_shifts (
    shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff_members(staff_id),
    shift_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    break_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_staff_date (staff_id, shift_date),
    INDEX idx_status (status)
);
```

#### **staff_activities表**
```sql
CREATE TABLE staff_activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff_members(staff_id),
    activity_type VARCHAR(50) NOT NULL,
    order_id INTEGER,
    description TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_staff_activity (staff_id, activity_type),
    INDEX idx_created_at (created_at)
);
```

### 3.2 訂單擴展表結構

#### **order_assignments表**
```sql
CREATE TABLE order_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id INTEGER REFERENCES orders(id),
    staff_id UUID REFERENCES staff_members(staff_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ASSIGNED',
    notes TEXT,
    
    INDEX idx_order_staff (order_id, staff_id),
    INDEX idx_status (status)
);
```

#### **cooking_timers表**
```sql
CREATE TABLE cooking_timers (
    timer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id INTEGER REFERENCES orders(id),
    staff_id UUID REFERENCES staff_members(staff_id),
    start_time TIMESTAMP NOT NULL,
    pause_time TIMESTAMP,
    resume_time TIMESTAMP,
    end_time TIMESTAMP,
    estimated_duration INTEGER NOT NULL,  -- 秒
    actual_duration INTEGER,
    status VARCHAR(20) DEFAULT 'RUNNING',
    
    INDEX idx_order_timer (order_id),
    INDEX idx_status (status)
);
```

## 4. Redis緩存設計

### 4.1 緩存鍵設計

```yaml
# 員工會話緩存
staff:session:{staffId}:
  - token: JWT token
  - loginTime: 登入時間
  - lastActivity: 最後活動時間
  - deviceInfo: 設備信息
  TTL: 8小時

# 訂單隊列緩存
orders:queue:pending:
  - 待處理訂單列表（有序集合）
  - Score: 優先級 + 時間戳
  TTL: 5分鐘

orders:queue:processing:
  - 處理中訂單列表
  TTL: 5分鐘

# 員工狀態緩存
staff:status:{staffId}:
  - currentOrder: 當前處理訂單
  - workload: 工作負載
  - efficiency: 即時效率
  TTL: 1分鐘

# 廚房容量緩存
kitchen:capacity:
  - current: 當前容量百分比
  - stations: 各工作站狀態
  - estimatedWait: 預計等待時間
  TTL: 30秒

# 通知隊列
notifications:staff:{staffId}:
  - 未讀通知列表（列表結構）
  TTL: 24小時
```

### 4.2 緩存更新策略

| 數據類型 | 更新策略 | 失效時機 |
|---------|---------|---------|
| 員工會話 | Write-through | 登出/超時 |
| 訂單隊列 | Write-behind (1秒) | 狀態變更 |
| 員工狀態 | 實時更新 | 每分鐘刷新 |
| 廚房容量 | 實時計算 | 30秒過期 |
| 通知隊列 | Write-through | 讀取後刪除 |

## 5. 安全性要求

### 5.1 認證與授權

#### **JWT Token結構**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "employeeNumber": "ST001",
    "name": "李小華",
    "role": "KITCHEN",
    "permissions": ["ORDER_VIEW", "ORDER_UPDATE"],
    "iat": 1705920000,
    "exp": 1705923600,
    "deviceId": "POS-001"
  }
}
```

#### **權限矩陣**
| 角色 | 訂單查看 | 訂單更新 | 廚房管理 | 統計查看 | 系統設置 |
|-----|---------|---------|---------|---------|---------|
| KITCHEN | ✓ | ✓ | ✓ | ✓ | ✗ |
| SERVICE | ✓ | ✓ | ✗ | ✓ | ✗ |
| CASHIER | ✓ | ✗ | ✗ | ✓ | ✗ |
| MANAGER | ✓ | ✓ | ✓ | ✓ | ✓ |

### 5.2 API安全措施

- **請求限流**: 每分鐘100次/IP
- **Token刷新**: AccessToken 1小時，RefreshToken 7天
- **設備綁定**: Token與設備ID綁定
- **操作審計**: 記錄所有狀態變更操作
- **敏感數據加密**: PIN碼、密碼使用BCrypt
- **HTTPS強制**: 生產環境強制HTTPS

## 6. 性能優化要求

### 6.1 API響應時間要求

| API類型 | 目標響應時間 | 最大響應時間 |
|---------|------------|-------------|
| 認證登入 | < 200ms | 500ms |
| 訂單列表 | < 150ms | 300ms |
| 狀態更新 | < 100ms | 200ms |
| 統計查詢 | < 300ms | 600ms |
| WebSocket推送 | < 50ms | 100ms |

### 6.2 數據庫優化

- **索引優化**: 所有查詢欄位建立索引
- **查詢優化**: 使用分頁、避免N+1查詢
- **連接池**: HikariCP，最小10，最大50
- **讀寫分離**: 主從複製，讀操作走從庫
- **定期維護**: 每週執行VACUUM和ANALYZE

### 6.3 緩存策略

- **多級緩存**: 本地緩存 + Redis
- **預加載**: 熱門數據預加載
- **異步更新**: 非關鍵數據異步更新
- **緩存預熱**: 系統啟動時預熱關鍵數據

## 7. 監控與日誌

### 7.1 監控指標

```yaml
# 應用監控
- API響應時間（P50, P95, P99）
- API錯誤率
- 並發請求數
- WebSocket連接數

# 業務監控
- 訂單處理時間
- 員工在線數
- 訂單積壓數
- 廚房容量使用率

# 系統監控
- CPU使用率
- 內存使用率
- 數據庫連接池狀態
- Redis命中率
```

### 7.2 日誌規範

```java
// 日誌級別使用
ERROR - 系統錯誤、異常
WARN  - 性能問題、潛在風險
INFO  - 重要業務操作
DEBUG - 調試信息

// 日誌格式
{
  "timestamp": "2024-01-22T14:30:00.123Z",
  "level": "INFO",
  "service": "StaffOrderService",
  "staffId": "ST001",
  "action": "UPDATE_ORDER_STATUS",
  "orderId": 12347,
  "details": {
    "previousStatus": "PENDING",
    "newStatus": "PROCESSING"
  },
  "duration": 45,
  "traceId": "abc-123-def"
}
```

---