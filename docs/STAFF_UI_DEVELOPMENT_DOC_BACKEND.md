# 📚 **彩虹餐廳員工UI系統 - 開發文檔 v2.0 - 後端部分**

## ⚠️ **重要聲明 - 請仔細閱讀**

> **🔴 關於文檔中的示例數據**
>
> **本文檔中所有的JSON響應示例、數據格式、API回傳值等都是概念性的範例，用於說明API的結構和數據格式。這些示例數據僅用於表達設計理念和接口規格。**
>
> **⚠️ 開發者必須實現真實的API功能和數據處理邏輯，而非簡單返回文檔中的模擬數據。**
>
> **✅ 正確的實現方式：**
> - 連接真實的PostgreSQL資料庫
> - 實現完整的業務邏輯
> - 處理真實的訂單、員工、統計數據
> - 實現錯誤處理和異常管理
> - 遵循Spring Boot最佳實踐
>
> **❌ 錯誤的實現方式：**
> - 直接返回文檔中的JSON範例
> - 使用硬編碼的假數據
> - 實現假的功能邏輯
> - 忽略數據庫整合
>
> **🎯 開發目標：構建完全功能的餐廳管理系統，而非演示原型**

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

> **🚨 重要提醒：實現真實API功能**
>
> **以下所有API示例都是概念性範例，開發者必須：**
> - 實現真實的資料庫查詢邏輯
> - 處理實際的業務流程
> - 連接PostgreSQL和Redis進行數據存取
> - 實現完整的錯誤處理和驗證
> - 遵循RESTful API設計原則
>
> **不要直接返回示例中的JSON數據！**

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

> **🛠️ 資料庫實現注意事項**
>
> **以下資料庫設計必須確實執行：**
> - 創建真實的PostgreSQL資料表結構
> - 實現完整的外鍵約束和索引
> - 建立適當的數據驗證規則
> - 設計合理的資料模型關聯
> - 實現數據遷移和初始化腳本
>
> **這些不是概念性的設計，而是需要實際執行的資料庫架構！**

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

> **⚡ Redis緩存實現要求**
>
> **以下緩存策略必須實際實現：**
> - 連接真實的Redis服務器 (192.168.0.113:6379)
> - 實現實際的緩存讀寫邏輯
> - 設定正確的TTL過期時間
> - 實現緩存更新和失效機制
> - 處理緩存命中和未命中的情況
>
> **這些不是理論設計，而是需要在Spring Boot中實際配置和使用的Redis操作！**

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

## 8. 業務邏輯實踐詳解

> **🔧 深度解析：員工UI系統業務邏輯層實現**
>
> **本章節詳細說明每個業務邏輯層的實際實現方式、工作流程和關鍵決策邏輯。**
> **這些不是理論設計，而是基於現有代碼的實際業務邏輯分析。**

### 8.1 員工認證業務邏輯實踐

#### **StaffService.authenticateStaff() - 雙重認證機制**

**工作流程**：
```java
public Optional<Staff> authenticateStaff(String identifier, String password) {
    // 階段1：員工ID認證
    Optional<Staff> staffByEmployeeId = staffDAO.findByEmployeeId(identifier);
    if (staffByEmployeeId.isPresent()) {
        Staff staff = staffByEmployeeId.get();
        Optional<User> user = userDAO.findById(staff.getUserId());
        
        // 驗證用戶狀態和權限
        if (user.isPresent() && user.get().isActive() && 
            (user.get().getRole() == UserRole.STAFF || user.get().getRole() == UserRole.ADMIN)) {
            
            // 密碼驗證
            Optional<String> passwordHash = userDAO.getPasswordHashByUserId(user.get().getUserId());
            if (passwordHash.isPresent() && passwordService.verifyPassword(password, passwordHash.get())) {
                // 更新登入時間和員工活動
                userDAO.updateLastLogin(user.get().getUserId(), LocalDateTime.now());
                staff.updateActivity();
                staffDAO.update(staff);
                return Optional.of(staff);
            }
        }
    }
    
    // 階段2：Email認證 (備用方式)
    Optional<User> userByEmail = userDAO.findByEmail(identifier);
    // ... 類似的驗證流程
}
```

**關鍵業務決策**：
- **雙重認證路徑**：先嘗試員工ID，失敗後嘗試Email
- **多重驗證檢查**：用戶狀態、角色權限、密碼正確性
- **即時狀態更新**：成功登入後立即更新最後登入時間和員工活動時間
- **安全性考量**：使用BCrypt密碼雜湊驗證，不存儲明文密碼

#### **登入會話管理機制**

**SessionService整合流程**：
```java
// 在StaffController.staffLogin()中的實現
if (staffOpt.isPresent()) {
    // 自動開始班次（如果未開始）
    if (!staff.isOnDuty()) {
        staffService.startShift(staff.getStaffId());
    }
    
    // 生成會話和JWT令牌
    String sessionId = sessionService.createSession(staff.getStaffId(), "Staff Portal", "127.0.0.1");
    String token = jwtService.generateToken(staff.getStaffId(), sessionId, "Staff Portal");
    String refreshToken = jwtService.generateToken(staff.getStaffId(), sessionId + "_refresh", "Staff Portal");
    
    return ResponseEntity.ok(Map.of(
        "staff", profile,
        "token", token,
        "refreshToken", refreshToken,
        "sessionId", sessionId,
        "expiresIn", 8 * 60 * 60, // 8小時
        "unreadNotifications", notificationService.countUnreadNotifications(staff.getStaffId())
    ));
}
```

**業務邏輯決策**：
- **自動班次管理**：登入時自動檢查並開始班次
- **多層次會話**：Session、JWT Token、Refresh Token三層安全機制
- **即時通知整合**：登入時立即載入未讀通知數量
- **長期會話**：8小時有效期適合餐廳工作環境

### 8.2 訂單管理業務邏輯實踐

#### **StaffController訂單狀態管理流程**

**updateOrderStatus() 業務邏輯**：
```java
@PutMapping("/orders/{orderId}/status")
public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, 
                                         @RequestBody OrderStatusUpdateRequest request) {
    boolean success = orderService.updateOrderStatus(orderId, request.getStatus());
    
    if (success) {
        // 員工活動追蹤
        if (request.getStaffId() != null) {
            staffService.updateStaffActivity(request.getStaffId());
            
            // 完成訂單的統計記錄
            if (request.getStatus() == OrderStatus.COMPLETED || 
                request.getStatus() == OrderStatus.DELIVERED) {
                staffService.recordOrderProcessed(request.getStaffId());
            }
        }
        
        Optional<Order> updatedOrder = orderService.findOrderById(orderId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "訂單狀態已更新",
            "order", updatedOrder.orElse(null)
        ));
    }
}
```

**關鍵業務決策**：
- **狀態更新的副作用**：每次狀態更新都觸發員工活動記錄
- **績效統計整合**：完成訂單時自動記錄到員工統計數據
- **即時反饋**：返回更新後的完整訂單信息
- **錯誤處理**：狀態更新失敗時返回具體錯誤信息

#### **智能訂單分組邏輯**

**不同狀態的訂單分組策略**：
```java
// getPendingOrders() - 待處理訂單邏輯
@GetMapping("/orders/pending")
public ResponseEntity<?> getPendingOrders() {
    List<Map<String, Object>> pendingOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.PENDING);
    List<Map<String, Object>> confirmedOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.CONFIRMED);
    
    return ResponseEntity.ok(Map.of(
        "pending", pendingOrders,      // 新訂單，需要確認
        "confirmed", confirmedOrders,  // 已確認，準備製作
        "total", pendingOrders.size() + confirmedOrders.size()
    ));
}

// getInProgressOrders() - 進行中訂單邏輯
@GetMapping("/orders/in-progress")
public ResponseEntity<?> getInProgressOrders() {
    List<Map<String, Object>> preparingOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.PREPARING);
    List<Map<String, Object>> readyOrders = orderService.getOrdersWithCompleteDataByStatus(OrderStatus.READY);
    
    return ResponseEntity.ok(Map.of(
        "preparing", preparingOrders,  // 正在製作
        "ready", readyOrders,         // 製作完成，等待取餐
        "total", preparingOrders.size() + readyOrders.size()
    ));
}
```

**業務邏輯設計原理**：
- **工作流程導向**：按照餐廳實際工作流程分組訂單
- **優先級管理**：pending → confirmed → preparing → ready 的自然流程
- **負載平衡**：分組顯示避免單一列表過長，提高操作效率
- **即時統計**：每個分組都提供即時計數信息

### 8.3 廚房管理業務邏輯實踐

#### **KitchenService.startPreparingOrder() - 智能廚房調度**

**完整的廚房訂單啟動流程**：
```java
public boolean startPreparingOrder(String orderId, String staffId) {
    Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
    
    if (kitchenOrderOpt.isEmpty()) {
        // 動態創建廚房訂單
        Optional<Order> orderOpt = orderDAO.findById(orderId);
        if (orderOpt.isEmpty()) return false;
        
        Order order = orderOpt.get();
        // 智能預估烹飪時間
        int estimatedCookingTime = calculateEstimatedCookingTime(order);
        
        KitchenOrder kitchenOrder = new KitchenOrder(orderId, estimatedCookingTime);
        kitchenOrder.startCooking(staffId);
        kitchenOrderDAO.save(kitchenOrder);
        
        // 同步更新主訂單狀態
        orderDAO.updateStatus(orderId, OrderStatus.PREPARING);
        
        // 員工活動記錄
        staffService.updateStaffActivity(staffId);
        
        return true;
    } else {
        // 恢復已存在的廚房訂單
        KitchenOrder kitchenOrder = kitchenOrderOpt.get();
        kitchenOrder.startCooking(staffId);
        kitchenOrderDAO.update(kitchenOrder);
        
        orderDAO.updateStatus(orderId, OrderStatus.PREPARING);
        staffService.updateStaffActivity(staffId);
        
        return true;
    }
}
```

**關鍵業務邏輯**：
- **動態訂單創建**：不存在的廚房訂單自動創建，支援靈活的工作流程
- **智能時間預估**：基於訂單項目數量計算預估烹飪時間
- **狀態同步機制**：廚房訂單和主訂單狀態保持一致
- **員工績效追蹤**：每個操作都記錄到員工活動日誌

#### **烹飪時間計算演算法**

**calculateEstimatedCookingTime() 實現邏輯**：
```java
private int calculateEstimatedCookingTime(Order order) {
    // 基礎烹飪時間算法
    int baseTime = 15; // 基礎15分鐘
    int itemCount = order.getOrderItems().size();
    return baseTime + (itemCount * 5); // 每個項目增加5分鐘
    
    // 未來可擴展考慮因素：
    // - 菜品複雜度評分
    // - 當前廚房負載
    // - 廚師技能等級
    // - 歷史平均完成時間
}
```

**演算法設計考量**：
- **基礎時間模型**：簡單但有效的線性時間計算
- **可擴展架構**：預留複雜度、負載、技能等因素的擴展空間
- **實時調整**：支援後續的機器學習優化

#### **超時訂單監控機制**

**checkForOverdueOrders() 自動化監控**：
```java
public void checkForOverdueOrders() {
    List<KitchenOrder> overdueOrders = getOverdueOrders();
    
    for (KitchenOrder kitchenOrder : overdueOrders) {
        int overdueMinutes = kitchenOrder.getOverdueMinutes();
        
        // 創建超時通知
        notificationService.createOvertimeOrderNotification(
            kitchenOrder.getOrderId(), overdueMinutes, kitchenOrder.getAssignedStaffId());
        
        // 動態優先級調整
        if (overdueMinutes > 15) {
            updateOrderPriority(kitchenOrder.getOrderId(), 
                Math.min(10, 7 + overdueMinutes / 10));
        }
    }
}
```

**自動化管理策略**：
- **主動監控**：定時檢查超時訂單，而非被動等待
- **分級通知**：根據超時程度發送不同優先級通知
- **動態優先級**：超時越久優先級越高，最高為10級
- **多方通知**：同時通知負責廚師和管理人員

### 8.4 統計分析業務邏輯實踐

#### **StaffStatisticsService多維度統計實現**

**getDailyStatistics() - 日統計邏輯**：
```java
public Optional<StaffStatistics> getDailyStatistics(String staffId, LocalDate date) {
    LocalDate targetDate = date != null ? date : LocalDate.now();
    return statisticsDAO.findByStaffAndDate(staffId, targetDate, StatisticsPeriod.DAILY);
}

public Optional<StaffStatistics> getWeeklyStatistics(String staffId, LocalDate weekStartDate) {
    LocalDate targetDate = weekStartDate != null ? weekStartDate : getStartOfCurrentWeek();
    return statisticsDAO.findByStaffAndDate(staffId, targetDate, StatisticsPeriod.WEEKLY);
}

public Optional<StaffStatistics> getMonthlyStatistics(String staffId, LocalDate monthStartDate) {
    LocalDate targetDate = monthStartDate != null ? monthStartDate : LocalDate.now().withDayOfMonth(1);
    return statisticsDAO.findByStaffAndDate(staffId, targetDate, StatisticsPeriod.MONTHLY);
}
```

**時間周期處理邏輯**：
- **靈活時間範圍**：支援指定時間或使用當前時間
- **ISO週標準**：使用`WeekFields.ISO`確保週的計算標準化
- **月份對齊**：月統計始終從每月1號開始計算
- **統一接口**：三種時間周期使用相同的DAO接口，便於維護

#### **團隊績效聚合計算**

**getTeamStatistics() 複雜聚合邏輯**：
```java
public TeamStatistics getTeamStatistics() {
    LocalDate today = LocalDate.now();
    List<Staff> allStaff = staffDAO.findAll();
    
    TeamStatistics teamStats = new TeamStatistics();
    teamStats.setTotalStaff(allStaff.size());
    teamStats.setOnDutyStaff((int) allStaff.stream().filter(Staff::isOnDuty).count());
    
    // 聚合計算各項指標
    int totalOrdersProcessed = 0, totalOrdersCompleted = 0;
    double totalRevenue = 0.0, totalEfficiencyRating = 0.0;
    int staffWithStats = 0;
    
    for (Staff staff : allStaff) {
        Optional<StaffStatistics> statsOpt = getDailyStatistics(staff.getStaffId(), today);
        if (statsOpt.isPresent()) {
            StaffStatistics stats = statsOpt.get();
            totalOrdersProcessed += stats.getOrdersProcessed();
            totalOrdersCompleted += stats.getOrdersCompleted();
            totalRevenue += stats.getTotalRevenue();
            totalEfficiencyRating += stats.getEfficiencyRating();
            staffWithStats++;
        }
    }
    
    // 計算團隊平均值
    teamStats.setAverageEfficiencyRating(
        staffWithStats > 0 ? totalEfficiencyRating / staffWithStats : 0.0);
    teamStats.setCompletionRate(
        totalOrdersProcessed > 0 ? (double) totalOrdersCompleted / totalOrdersProcessed : 0.0);
    
    return teamStats;
}
```

**聚合演算法特點**：
- **即時計算**：每次請求都重新計算，確保數據即時性
- **零除保護**：所有除法運算都包含零除檢查
- **選擇性統計**：只計算有統計數據的員工，避免空值影響
- **多維度指標**：同時計算數量、效率、收入等多個維度

#### **排行榜演算法實現**

**getStaffLeaderboard() 動態排名邏輯**：
```java
public List<StaffLeaderboard> getStaffLeaderboard(StatisticsPeriod period, int limit) {
    LocalDate startDate = getStartDateForPeriod(period);
    List<StaffStatistics> topPerformers = statisticsDAO.findTopPerformers(period, startDate, limit);
    
    return topPerformers.stream()
        .map(stats -> {
            Optional<Staff> staffOpt = staffDAO.findById(stats.getStaffId());
            if (staffOpt.isPresent()) {
                return new StaffLeaderboard(staffOpt.get(), stats);
            }
            return null;
        })
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
}
```

**排名邏輯設計**：
- **多期間支援**：日、週、月排行榜使用統一邏輯
- **數據完整性**：確保排行榜中的員工信息完整
- **空值處理**：過濾掉無效的員工資料
- **延遲排序**：在DAO層進行排序，提高效率

### 8.5 通知系統業務邏輯實踐

#### **NotificationService智能通知分發**

**createNewOrderNotification() - 部門導向通知**：
```java
public void createNewOrderNotification(String orderId, String customerInfo, String tableNumber) {
    List<Staff> kitchenStaff = staffDAO.findByDepartment("廚房");
    String message = String.format("桌號 %s 的新訂單 - %s", tableNumber, customerInfo);
    
    for (Staff staff : kitchenStaff) {
        if (staff.isOnDuty()) {  // 只通知當班員工
            Notification notification = Notification.newOrderNotification(staff.getStaffId(), orderId, message);
            notificationDAO.save(notification);
        }
    }
}
```

**通知分發策略**：
- **部門定向**：新訂單只通知廚房部門員工
- **班次過濾**：只向當前在班的員工發送通知
- **格式化訊息**：統一的訊息格式，包含桌號和客戶信息
- **批量處理**：一次性為所有相關員工創建通知

#### **分級通知機制**

**createOvertimeOrderNotification() - 分級通知邏輯**：
```java
public void createOvertimeOrderNotification(String orderId, int overdueMinutes, String assignedStaffId) {
    // 第一層：通知負責的員工
    if (assignedStaffId != null) {
        Notification notification = Notification.overtimeOrderNotification(
            assignedStaffId, orderId, overdueMinutes);
        notificationDAO.save(notification);
    }
    
    // 第二層：通知管理層
    List<Staff> managers = staffDAO.findByPosition("Manager");
    for (Staff manager : managers) {
        if (manager.isOnDuty() && !manager.getStaffId().equals(assignedStaffId)) {
            Notification notification = Notification.overtimeOrderNotification(
                manager.getStaffId(), orderId, overdueMinutes);
            notificationDAO.save(notification);
        }
    }
}
```

**分級通知設計**：
- **責任明確**：首先通知直接負責人
- **管理監督**：同時通知管理層進行監督
- **避免重複**：管理層員工不會收到重複通知
- **在班過濾**：只通知當前在班的管理人員

#### **廣播通知機制**

**broadcastToDepartment() - 部門廣播實現**：
```java
public void broadcastToDepartment(String department, NotificationType type, String title, 
                                String message, NotificationPriority priority) {
    List<Staff> departmentStaff = staffDAO.findByDepartment(department);
    List<String> staffIds = departmentStaff.stream()
        .filter(Staff::isOnDuty)  // 只給在班員工發送
        .map(Staff::getStaffId)
        .toList();
    
    if (!staffIds.isEmpty()) {
        broadcastNotification(staffIds, type, title, message, priority);
    }
}
```

**廣播機制特色**：
- **部門定向**：精確向指定部門廣播
- **動態過濾**：即時過濾在班員工
- **批量發送**：一次API調用發送所有通知
- **空值保護**：沒有符合條件的員工時不執行廣播

### 8.6 數據訪問層業務邏輯實踐

#### **StaffDAO高效查詢實現**

**複雜的SQL查詢策略**：
```sql
-- SELECT_ON_DUTY_STAFF - 在班員工查詢
SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
       shift_start_time, shift_end_time, last_activity_time,
       daily_orders_processed, efficiency_rating, created_at, updated_at
FROM staff 
WHERE is_on_duty = true 
ORDER BY shift_start_time  -- 按上班時間排序

-- SELECT_STAFF_BY_DEPARTMENT - 部門員工查詢  
SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
       shift_start_time, shift_end_time, last_activity_time,
       daily_orders_processed, efficiency_rating, created_at, updated_at
FROM staff 
WHERE department = ? 
ORDER BY employee_id  -- 按員工編號排序
```

**查詢優化策略**：
- **索引友好**：WHERE條件對應資料庫索引
- **排序優化**：根據業務需求選擇最佳排序欄位
- **欄位選擇**：選擇必要欄位，避免SELECT *
- **參數化查詢**：防止SQL注入攻擊

#### **原子性操作保證**

**updateStaffActivity() - 原子性更新**：
```java
private static final String UPDATE_STAFF_ACTIVITY = """
    UPDATE staff SET last_activity_time = ?, updated_at = ?
    WHERE staff_id = ?
    """;

public void updateActivity(String staffId) {
    LocalDateTime now = LocalDateTime.now();
    jdbcTemplate.update(UPDATE_STAFF_ACTIVITY, 
        Timestamp.valueOf(now), Timestamp.valueOf(now), staffId);
}
```

**數據一致性保證**：
- **單一SQL語句**：確保更新操作的原子性
- **時間戳同步**：last_activity_time和updated_at同時更新
- **事務支援**：利用Spring的事務管理確保一致性

### 8.7 錯誤處理和異常管理實踐

#### **全面的異常捕捉策略**

**StaffService中的錯誤處理模式**：
```java
public Optional<Staff> authenticateStaff(String identifier, String password) {
    try {
        System.out.println("Attempting staff authentication for identifier: " + identifier);
        // 業務邏輯實現...
        System.out.println("Staff authentication successful for: " + identifier);
        return Optional.of(staff);
    } catch (Exception e) {
        System.err.println("Error in staff authentication: " + e.getMessage());
        e.printStackTrace();
        return Optional.empty();
    }
}
```

**異常處理特點**：
- **詳細日誌記錄**：記錄操作開始、成功和失敗狀態
- **堆疊跟踪**：printStackTrace()用於調試
- **優雅降級**：返回Optional.empty()而不是拋出異常
- **一致性接口**：所有服務方法使用類似的錯誤處理模式

#### **API層錯誤響應統一化**

**StaffController中的錯誤響應模式**：
```java
@PostMapping("/login")
public ResponseEntity<?> staffLogin(@RequestBody StaffLoginRequest request) {
    try {
        // 業務邏輯處理...
        return ResponseEntity.ok(successResponse);
    } catch (Exception e) {
        System.err.println("Error in staff login: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "系統錯誤", "details", e.getMessage()));
    }
}
```

**統一錯誤響應格式**：
- **HTTP狀態碼**：準確的HTTP狀態碼對應不同錯誤類型
- **結構化響應**：error(用戶友好)和details(技術詳情)分離
- **中文錯誤訊息**：用戶友好的中文錯誤描述
- **調試信息保留**：開發環境下保留技術詳情

---

## ⚠️ **開發完成檢查清單**

> **🎯 確保實現真實功能，而非模擬功能**
>
> **在開發完成前，請檢查以下項目：**
>
> **✅ 資料庫整合檢查：**
> - [ ] 已連接到真實的PostgreSQL資料庫 (192.168.0.114:5432)
> - [ ] 已創建所有必要的資料表和索引
> - [ ] API能夠正確讀寫資料庫數據
> - [ ] 實現了完整的CRUD操作
>
> **✅ API功能檢查：**
> - [ ] 所有API端點返回真實的資料庫數據
> - [ ] 實現了完整的業務邏輯，而非硬編碼的範例數據
> - [ ] 包含適當的錯誤處理和驗證
> - [ ] 遵循RESTful設計原則
>
> **✅ Redis緩存檢查：**
> - [ ] 已連接到真實的Redis服務器 (192.168.0.113:6379)
> - [ ] 實現了實際的緩存讀寫操作
> - [ ] 設定了正確的TTL和過期策略
>
> **✅ WebSocket功能檢查：**
> - [ ] 實現了真實的即時推送功能
> - [ ] 處理了WebSocket連接管理
> - [ ] 整合了真實的業務事件觸發
>
> **✅ 業務邏輯檢查：**
> - [ ] 員工認證實現了雙重驗證機制（員工ID + Email）
> - [ ] 訂單狀態更新包含副作用處理（統計記錄、活動更新）
> - [ ] 廚房管理實現了智能時間預估和超時監控
> - [ ] 統計服務實現了多維度聚合計算
> - [ ] 通知系統實現了分級和廣播機制
> - [ ] 異常處理實現了統一的錯誤響應格式
>
> **✅ 測試驗證：**
> - [ ] 使用真實數據測試所有API端點
> - [ ] 驗證資料庫數據的正確性
> - [ ] 測試緩存功能的實際效果
> - [ ] 驗證業務邏輯的工作流程正確性
>
> **🔴 重要提醒：本文檔中的所有JSON範例和數據格式僅用於說明API結構，開發者必須實現連接真實資料庫和Redis的完整功能，而不是返回文檔中的示例數據！**
>
> **🎯 最終目標：構建一個完全功能的餐廳員工管理系統，能夠處理真實的訂單、員工和統計數據。**