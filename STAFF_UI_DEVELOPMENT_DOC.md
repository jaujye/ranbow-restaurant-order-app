# 📚 **彩虹餐廳員工UI系統 - 開發文檔 v1.1**

---

## 📋 **文檔概述**

- **項目名稱**: Ranbow Restaurant Staff UI System
- **版本**: 1.1.0
- **更新日期**: 2025-01-23
- **最新更新內容**:
  - ✅ 根據現有Java Spring後端結構重新設計前端目錄規範
  - ✅ 更新API接口定義以對應實際的StaffController實現
  - ✅ 前端目錄結構現在完全對應後端架構（Controller/Service/Model）
  - ✅ API接口設計已與現有後端完全同步
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

### 1.2 目錄結構規範

#### **前端目錄結構（對應後端架構）**
```
staff-ui-react/
├── public/
│   ├── icons/              # 應用圖標
│   ├── sounds/             # 提示音效檔案
│   │   ├── new-order.mp3   # 新訂單音效
│   │   ├── urgent.mp3      # 緊急訂單音效
│   │   └── complete.mp3    # 完成音效
│   └── manifest.json       # PWA配置
│
├── src/
│   ├── assets/            # 靜態資源
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/        # 組件庫（對應後端Controller）
│   │   ├── common/        # 通用組件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── auth/          # 認證相關（對應StaffController認證部分）
│   │   │   ├── LoginForm.tsx
│   │   │   ├── QuickSwitch.tsx
│   │   │   └── StaffProfile.tsx
│   │   ├── orders/        # 訂單管理（對應OrderController）
│   │   │   ├── OrderQueue.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderDetails.tsx
│   │   │   └── StatusUpdater.tsx
│   │   ├── kitchen/       # 廚房功能（對應KitchenService）
│   │   │   ├── KitchenQueue.tsx
│   │   │   ├── CookingTimer.tsx
│   │   │   ├── WorkstationView.tsx
│   │   │   └── PreparationList.tsx
│   │   ├── stats/         # 統計圖表（對應StaffStatisticsService）
│   │   │   ├── DailyStats.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── TeamLeaderboard.tsx
│   │   │   └── EfficiencyMetrics.tsx
│   │   └── notifications/ # 通知系統（對應NotificationService）
│   │       ├── NotificationCenter.tsx
│   │       ├── NotificationBadge.tsx
│   │       └── ToastNotification.tsx
│   │
│   ├── pages/            # 頁面組件（對應API路由）
│   │   ├── auth/
│   │   │   └── StaffLogin.tsx
│   │   ├── dashboard/
│   │   │   └── StaffDashboard.tsx
│   │   ├── orders/
│   │   │   ├── OrderManagement.tsx
│   │   │   └── OrderTracking.tsx
│   │   ├── kitchen/
│   │   │   └── KitchenWorkstation.tsx
│   │   └── statistics/
│   │       └── PerformanceReport.tsx
│   │
│   ├── layouts/          # 佈局模板
│   │   ├── StaffLayout.tsx
│   │   ├── KitchenLayout.tsx
│   │   └── MobileLayout.tsx
│   │
│   ├── hooks/            # 自定義Hooks
│   │   ├── useStaffAuth.ts
│   │   ├── useOrderQueue.ts
│   │   ├── useKitchenTimer.ts
│   │   ├── useWebSocket.ts
│   │   └── useNotifications.ts
│   │
│   ├── store/            # Zustand狀態管理（對應後端Model）
│   │   ├── authStore.ts    # Staff認證狀態
│   │   ├── orderStore.ts   # Order訂單狀態
│   │   ├── kitchenStore.ts # KitchenOrder狀態
│   │   ├── notificationStore.ts # Notification狀態
│   │   └── statisticsStore.ts   # StaffStatistics狀態
│   │
│   ├── services/         # API服務（對應後端API Controller）
│   │   ├── api.ts           # Axios配置
│   │   ├── staffApi.ts      # 對應StaffController
│   │   ├── orderApi.ts      # 對應OrderController  
│   │   ├── kitchenApi.ts    # 對應KitchenService
│   │   ├── notificationApi.ts # 對應NotificationService
│   │   └── websocketService.ts # WebSocket連接管理
│   │
│   ├── utils/            # 工具函數
│   │   ├── dateUtils.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── types/            # TypeScript定義（對應後端Models）
│   │   ├── staff.ts         # Staff, StaffProfile類型
│   │   ├── order.ts         # Order, OrderStatus類型
│   │   ├── kitchen.ts       # KitchenOrder, KitchenStatus類型
│   │   ├── notification.ts  # Notification, NotificationType類型
│   │   └── statistics.ts    # StaffStatistics, StatisticsPeriod類型
│   │
│   ├── styles/           # 全局樣式
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── animations.css
│   │
│   └── config/           # 配置文件
│       ├── api.config.ts    # API端點配置
│       ├── theme.config.ts  # 主題配置
│       └── app.config.ts    # 應用配置
```

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

### 1.2 包結構規範

```
com.ranbow.restaurant.staff/
├── controller/          # REST控制器
│   ├── StaffAuthController.java
│   ├── StaffOrderController.java
│   ├── KitchenController.java
│   └── StaffStatsController.java
│
├── service/            # 業務邏輯層
│   ├── StaffAuthService.java
│   ├── OrderQueueService.java
│   ├── KitchenService.java
│   └── NotificationService.java
│
├── repository/         # 數據訪問層
│   ├── StaffRepository.java
│   ├── WorkShiftRepository.java
│   └── StaffActivityRepository.java
│
├── model/             # 數據模型
│   ├── entity/       # 數據庫實體
│   ├── dto/          # 數據傳輸對象
│   └── vo/           # 值對象
│
├── websocket/         # WebSocket相關
│   ├── WebSocketConfig.java
│   ├── StaffWebSocketHandler.java
│   └── MessageBroadcaster.java
│
├── security/          # 安全配置
│   ├── StaffSecurityConfig.java
│   └── JwtTokenProvider.java
│
└── utils/            # 工具類
```

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