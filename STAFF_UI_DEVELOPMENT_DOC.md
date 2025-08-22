# 📚 **彩虹餐廳員工UI系統 - 開發文檔 v1.0**

---

## 📋 **文檔概述**

- **項目名稱**: Ranbow Restaurant Staff UI System
- **版本**: 1.0.0
- **更新日期**: 2025-01-22
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

```
staff-ui-react/
├── public/
│   ├── icons/              # 應用圖標
│   ├── sounds/             # 提示音效檔案
│   └── manifest.json       # PWA配置
│
├── src/
│   ├── assets/            # 靜態資源
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/        # 組件庫
│   │   ├── common/       # 通用組件
│   │   ├── auth/        # 認證相關
│   │   ├── orders/      # 訂單管理
│   │   ├── kitchen/     # 廚房功能
│   │   ├── stats/       # 統計圖表
│   │   └── notifications/ # 通知系統
│   │
│   ├── pages/            # 頁面組件
│   ├── layouts/          # 佈局模板
│   ├── hooks/            # 自定義Hooks
│   ├── store/            # Zustand狀態管理
│   ├── services/         # API服務
│   ├── utils/            # 工具函數
│   ├── types/            # TypeScript定義
│   ├── styles/           # 全局樣式
│   └── config/           # 配置文件
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

### 2.1 員工認證API

#### **POST /api/staff/auth/login**
**功能**: 員工登入
```json
// Request
{
  "loginId": "ST001",  // 工號或Email
  "password": "password123",
  "deviceInfo": {
    "deviceId": "POS-001",
    "deviceType": "TABLET",
    "appVersion": "1.0.0"
  }
}

// Response 200
{
  "success": true,
  "data": {
    "staff": {
      "staffId": "550e8400-e29b-41d4-a716-446655440000",
      "employeeNumber": "ST001",
      "name": "李小華",
      "role": "KITCHEN",
      "department": "廚房",
      "permissions": ["ORDER_VIEW", "ORDER_UPDATE", "KITCHEN_MANAGE"],
      "avatar": "/avatars/st001.jpg"
    },
    "auth": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    },
    "workShift": {
      "shiftId": "shift-001",
      "startTime": "2024-01-22T09:00:00",
      "endTime": "2024-01-22T18:00:00",
      "breakTime": 60
    }
  }
}
```

#### **POST /api/staff/auth/quick-switch**
**功能**: 快速切換員工
```json
// Request
{
  "currentStaffId": "550e8400-e29b-41d4-a716-446655440000",
  "targetStaffId": "660e8400-e29b-41d4-a716-446655440001",
  "pin": "1234"
}

// Response 200
{
  "success": true,
  "data": {
    "newStaff": { /* 員工信息 */ },
    "newToken": "eyJhbGciOiJIUzI1NiIs...",
    "switchTime": "2024-01-22T14:30:00"
  }
}
```

### 2.2 訂單管理API

#### **GET /api/staff/orders/queue**
**功能**: 獲取訂單隊列
```json
// Request Query Parameters
{
  "status": "PENDING,PROCESSING",  // 狀態篩選
  "priority": "HIGH,URGENT",        // 優先級篩選
  "assignedTo": "ST001",           // 負責人篩選
  "page": 0,
  "size": 20,
  "sort": "priority,desc"
}

// Response 200
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": 12347,
        "orderNumber": "ORD-20240122-001",
        "tableNumber": "3",
        "customerName": "王先生",
        "customerPhone": "0912345678",
        "status": "PENDING",
        "priority": "URGENT",
        "items": [
          {
            "itemId": 101,
            "name": "招牌牛排",
            "quantity": 2,
            "specialRequests": "不要洋蔥",
            "preparationTime": 25
          }
        ],
        "totalAmount": 940,
        "orderTime": "2024-01-22T14:25:00",
        "estimatedCompleteTime": "2024-01-22T14:50:00",
        "assignedStaff": null,
        "isOverdue": true,
        "overdueMinutes": 5
      }
    ],
    "pagination": {
      "currentPage": 0,
      "totalPages": 5,
      "totalElements": 98,
      "hasNext": true
    },
    "summary": {
      "pendingCount": 8,
      "processingCount": 3,
      "urgentCount": 2,
      "averageWaitTime": 12.5
    }
  }
}
```

#### **PUT /api/staff/orders/{orderId}/status**
**功能**: 更新訂單狀態
```json
// Request
{
  "newStatus": "PROCESSING",
  "staffId": "ST001",
  "note": "開始製作",
  "estimatedCompleteTime": "2024-01-22T14:45:00"
}

// Response 200
{
  "success": true,
  "data": {
    "orderId": 12347,
    "previousStatus": "PENDING",
    "currentStatus": "PROCESSING",
    "updatedBy": "李小華",
    "updatedAt": "2024-01-22T14:30:00",
    "statusHistory": [
      {
        "status": "PENDING",
        "timestamp": "2024-01-22T14:25:00",
        "staffName": "系統"
      },
      {
        "status": "PROCESSING",
        "timestamp": "2024-01-22T14:30:00",
        "staffName": "李小華"
      }
    ]
  }
}
```

### 2.3 廚房工作台API

#### **POST /api/staff/kitchen/cooking/start**
**功能**: 開始製作訂單
```json
// Request
{
  "orderId": 12347,
  "staffId": "ST001",
  "workstationId": "KITCHEN-01",
  "estimatedMinutes": 25,
  "items": [101, 102]  // 開始製作的項目ID
}

// Response 200
{
  "success": true,
  "data": {
    "cookingSessionId": "cook-001",
    "orderId": 12347,
    "startTime": "2024-01-22T14:30:00",
    "estimatedCompleteTime": "2024-01-22T14:55:00",
    "timer": {
      "timerId": "timer-001",
      "duration": 1500,  // 秒
      "status": "RUNNING"
    },
    "assignedChef": "李小華"
  }
}
```

#### **GET /api/staff/kitchen/workload**
**功能**: 獲取廚房工作負載
```json
// Response 200
{
  "success": true,
  "data": {
    "currentCapacity": 75,  // 百分比
    "activeOrders": 8,
    "queuedOrders": 12,
    "averageCookingTime": 18.5,  // 分鐘
    "stations": [
      {
        "stationId": "GRILL",
        "name": "燒烤區",
        "capacity": 90,
        "activeOrders": 3,
        "assignedStaff": ["ST001", "ST002"]
      },
      {
        "stationId": "WOK",
        "name": "炒鍋區",
        "capacity": 60,
        "activeOrders": 2,
        "assignedStaff": ["ST003"]
      }
    ],
    "estimatedWaitTime": {
      "newOrder": 25,  // 新訂單預計等待時間（分鐘）
      "inQueue": 15   // 隊列中訂單平均等待時間
    }
  }
}
```

### 2.4 統計與報表API

#### **GET /api/staff/stats/{staffId}/performance**
**功能**: 獲取員工績效統計
```json
// Request Query Parameters
{
  "period": "DAILY",  // DAILY, WEEKLY, MONTHLY
  "date": "2024-01-22"
}

// Response 200
{
  "success": true,
  "data": {
    "staffId": "ST001",
    "staffName": "李小華",
    "period": {
      "type": "DAILY",
      "date": "2024-01-22",
      "workHours": 5.5
    },
    "orderStats": {
      "totalProcessed": 24,
      "completed": 22,
      "cancelled": 1,
      "inProgress": 1,
      "completionRate": 91.7,
      "averageProcessTime": 18.5  // 分鐘
    },
    "efficiency": {
      "score": 95.5,
      "rank": 1,
      "totalStaff": 8,
      "overdueOrders": 0,
      "onTimeRate": 100
    },
    "achievements": [
      {
        "type": "ZERO_OVERTIME",
        "name": "零超時達人",
        "earnedAt": "2024-01-22T18:00:00"
      },
      {
        "type": "EFFICIENCY_CHAMPION",
        "name": "效率冠軍",
        "earnedAt": "2024-01-22T18:00:00"
      }
    ],
    "customerFeedback": {
      "averageRating": 4.8,
      "totalReviews": 15,
      "compliments": 12
    }
  }
}
```

### 2.5 WebSocket即時通訊

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

## 📝 **協作開發指南**

### GitHub協作開發規則

#### 🌳 **分支管理策略**

**主要分支結構**
```
main
├── develop                    # 開發主分支
├── feature/staff-ui-auth     # 功能分支：員工認證
├── feature/staff-ui-orders   # 功能分支：訂單管理
├── feature/staff-ui-kitchen  # 功能分支：廚房工作台
├── feature/staff-ui-stats    # 功能分支：統計報表
├── hotfix/critical-bug-fix   # 緊急修復分支
└── release/v1.0.0           # 發布分支
```

#### 📋 **分支命名規範**

| 分支類型 | 命名格式 | 範例 | 用途 |
|---------|---------|------|------|
| 功能開發 | `feature/描述` | `feature/staff-ui-login` | 新功能開發 |
| 錯誤修復 | `bugfix/描述` | `bugfix/order-status-update` | 一般錯誤修復 |
| 緊急修復 | `hotfix/描述` | `hotfix/security-patch` | 緊急問題修復 |
| 發布準備 | `release/版本號` | `release/v1.0.0` | 發布前準備 |
| 實驗功能 | `experiment/描述` | `experiment/new-ui-design` | 實驗性功能 |

#### 🔀 **開發工作流程**

**1. 建立新功能分支**
```bash
# 從develop分支建立新功能分支
git checkout develop
git pull origin develop
git checkout -b feature/staff-ui-orders

# 推送到遠端
git push -u origin feature/staff-ui-orders
```

**2. 開發期間同步**
```bash
# 定期同步develop分支的最新變更
git checkout develop
git pull origin develop
git checkout feature/staff-ui-orders
git rebase develop  # 或使用 git merge develop
```

**3. 提交規範**
```bash
# 提交訊息格式：<類型>(<範圍>): <描述>
git commit -m "feat(staff-ui): implement order status update component"
git commit -m "fix(api): resolve authentication token expiry issue"
git commit -m "docs(readme): update installation instructions"
```

**4. Pull Request流程**
```bash
# 推送分支並建立PR
git push origin feature/staff-ui-orders

# PR標題格式
"Staff UI: Implement Order Management System"

# PR描述模板
## 功能描述
- [ ] 實現訂單列表顯示
- [ ] 實現狀態更新功能
- [ ] 實現篩選和搜索

## 測試項目
- [ ] 單元測試通過
- [ ] 整合測試通過
- [ ] E2E測試通過

## 檢查清單
- [ ] 代碼審查完成
- [ ] 文檔更新完成
- [ ] API測試通過
```

#### ⚠️ **重要注意事項**

**🚫 禁止事項**
- **絕對不可直接推送到main分支**
- **不可強制推送（force push）到公共分支**
- **不可在main或develop分支直接提交**
- **不可刪除他人的分支（除非得到許可）**
- **不可提交包含密碼、API金鑰等敏感信息**

**✅ 必須事項**
- **所有功能開發必須在feature分支進行**
- **提交前必須執行測試確保通過**
- **PR必須經過至少一人審查才能合併**
- **合併前必須解決所有衝突**
- **功能完成後必須更新相關文檔**

**🔄 代碼審查要求**
```yaml
PR審查檢查項:
前端代碼:
  - [ ] TypeScript類型定義正確
  - [ ] 組件可重用性良好
  - [ ] CSS樣式符合設計規範
  - [ ] 無console.log或調試代碼
  - [ ] 錯誤處理完整

後端代碼:
  - [ ] API接口設計合理
  - [ ] 錯誤處理完整
  - [ ] 安全性檢查通過
  - [ ] 資料庫操作最佳化
  - [ ] 日誌記錄適當

通用檢查:
  - [ ] 符合專案編碼規範
  - [ ] 測試覆蓋率達標
  - [ ] 性能影響可接受
  - [ ] 向後相容性確認
```

**📊 分支保護規則**
```json
{
  "main分支": {
    "required_reviews": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_status_checks": [
      "CI/CD Pipeline",
      "Unit Tests",
      "Integration Tests"
    ]
  },
  "develop分支": {
    "required_reviews": 1,
    "required_status_checks": [
      "Unit Tests",
      "Lint Check"
    ]
  }
}
```

### 前後端聯調流程

1. **API文檔同步**: 使用Swagger/OpenAPI維護最新文檔
2. **Mock數據**: 前端使用MSW進行本地Mock
3. **聯調環境**: 提供穩定的開發環境
4. **錯誤碼規範**: 統一錯誤碼和消息格式
5. **版本管理**: API版本控制（/api/v1/）
6. **分支同步**: 前後端功能分支同步開發進度

### 開發規範檢查清單

#### 前端檢查項
- [ ] TypeScript類型完整定義
- [ ] 組件Props接口明確
- [ ] 錯誤邊界處理
- [ ] Loading狀態處理
- [ ] 響應式設計測試
- [ ] 無障礙性支援

#### 後端檢查項
- [ ] API參數驗證
- [ ] 異常處理完整
- [ ] 事務管理正確
- [ ] 緩存更新及時
- [ ] 日誌記錄完整
- [ ] 單元測試覆蓋

### 測試要求

| 測試類型 | 覆蓋率要求 | 負責方 |
|---------|-----------|--------|
| 單元測試 | > 80% | 前端+後端 |
| 集成測試 | > 70% | 後端 |
| E2E測試 | 核心流程 | 前端 |
| 性能測試 | 全部API | 後端 |
| 壓力測試 | 核心功能 | 後端 |

---

這份開發文檔為前後端工程師提供了詳細的技術規範和實施指南，確保團隊能夠高效協作開發員工UI系統。