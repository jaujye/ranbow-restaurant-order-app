# 📚 **彩虹餐廳員工UI系統 - 開發文檔 v2.0 - 後端部分**

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