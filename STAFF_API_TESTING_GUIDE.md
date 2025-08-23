# 🧪 **彩虹餐廳員工系統API測試指南**

## 📋 **文檔概述**

- **項目**: Ranbow Restaurant Staff API Testing Guide  
- **版本**: 1.0.0
- **更新日期**: 2025-08-23
- **目的**: 提供員工系統API接口的測試方法和部署驗證指南
- **環境**: 本地開發環境 + Ubuntu Server生產環境

---

## 🏠 **本地開發環境後端測試**

### 1. 環境配置

**🔧 本地開發環境信息:**
- **API Base URL**: `http://localhost:8081/api`
- **健康檢查端點**: `http://localhost:8081/api/health`
- **WebSocket端點**: `ws://localhost:8081/ws/staff/{staffId}`
- **數據庫**: PostgreSQL (192.168.0.114:5432)
- **緩存**: Redis (192.168.0.113:6379)

**🚀 啟動後端服務:**
```bash
# 進入專案根目錄
cd ranbow-restaurant-order-app

# 清理並編譯
mvn clean compile

# 啟動Spring Boot開發服務器
mvn spring-boot:run

# 或打包運行
mvn clean package
java -jar target/restaurant-order-app-1.0.0.jar
```

**✅ 服務健康檢查:**
```bash
# 檢查API服務是否啟動
curl http://localhost:8081/api/health

# 預期返回
{
  "status": "UP",
  "timestamp": "2025-08-23T10:30:00Z"
}
```

### 2. API接口測試

#### 🔐 **2.1 員工認證API測試**

**員工登入測試:**
```bash
# POST /api/staff/auth/login
curl -X POST http://localhost:8081/api/staff/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "ST001",
    "password": "password123",
    "deviceInfo": {
      "deviceId": "POS-001",
      "deviceType": "TABLET", 
      "appVersion": "1.0.0"
    }
  }'

# 預期返回 (200 OK)
{
  "success": true,
  "data": {
    "staff": {
      "staffId": "550e8400-e29b-41d4-a716-446655440000",
      "employeeNumber": "ST001",
      "name": "李小華",
      "role": "KITCHEN",
      "permissions": ["ORDER_VIEW", "ORDER_UPDATE", "KITCHEN_MANAGE"]
    },
    "auth": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

**快速切換員工測試:**
```bash
# POST /api/staff/auth/quick-switch
curl -X POST http://localhost:8081/api/staff/auth/quick-switch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentStaffId": "550e8400-e29b-41d4-a716-446655440000",
    "targetStaffId": "660e8400-e29b-41d4-a716-446655440001",
    "pin": "1234"
  }'
```

#### 📋 **2.2 訂單管理API測試**

**獲取訂單隊列:**
```bash
# GET /api/staff/orders/queue
curl -X GET "http://localhost:8081/api/staff/orders/queue?status=PENDING,PROCESSING&page=0&size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 預期返回
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": 12347,
        "orderNumber": "ORD-20250823-001",
        "tableNumber": "3",
        "status": "PENDING",
        "priority": "URGENT",
        "totalAmount": 940,
        "isOverdue": true
      }
    ],
    "summary": {
      "pendingCount": 8,
      "processingCount": 3,
      "urgentCount": 2
    }
  }
}
```

**更新訂單狀態:**
```bash
# PUT /api/staff/orders/{orderId}/status
curl -X PUT http://localhost:8081/api/staff/orders/12347/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "newStatus": "PROCESSING",
    "staffId": "ST001",
    "note": "開始製作",
    "estimatedCompleteTime": "2025-08-23T14:45:00"
  }'
```

#### 👨‍🍳 **2.3 廚房工作台API測試**

**開始製作訂單:**
```bash
# POST /api/staff/kitchen/cooking/start  
curl -X POST http://localhost:8081/api/staff/kitchen/cooking/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": 12347,
    "staffId": "ST001",
    "workstationId": "KITCHEN-01",
    "estimatedMinutes": 25
  }'
```

**獲取廚房工作負載:**
```bash
# GET /api/staff/kitchen/workload
curl -X GET http://localhost:8081/api/staff/kitchen/workload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 預期返回
{
  "success": true,
  "data": {
    "currentCapacity": 75,
    "activeOrders": 8,
    "queuedOrders": 12,
    "averageCookingTime": 18.5
  }
}
```

#### 📊 **2.4 統計報表API測試**

**獲取員工績效統計:**
```bash
# GET /api/staff/stats/{staffId}/performance
curl -X GET "http://localhost:8081/api/staff/stats/ST001/performance?period=DAILY&date=2025-08-23" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. WebSocket連接測試

**🔌 WebSocket連接測試:**
```javascript
// 使用瀏覽器開發者工具或Node.js測試
const socket = new WebSocket('ws://localhost:8081/ws/staff/ST001');

socket.onopen = function(event) {
    console.log('WebSocket連接建立成功');
};

socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('收到訊息:', message);
    
    // 新訂單通知範例
    if (message.type === 'NEW_ORDER') {
        console.log('新訂單:', message.data.orderNumber);
    }
};

socket.onerror = function(error) {
    console.error('WebSocket錯誤:', error);
};
```

### 4. 錯誤處理測試

**常見錯誤情況測試:**

```bash
# 401 未授權 - 無效Token
curl -X GET http://localhost:8081/api/staff/orders/queue \
  -H "Authorization: Bearer INVALID_TOKEN"

# 403 權限不足 - 角色權限
curl -X POST http://localhost:8081/api/staff/kitchen/cooking/start \
  -H "Authorization: Bearer CASHIER_TOKEN" \
  -d '{"orderId": 12347}'

# 404 資源不存在
curl -X PUT http://localhost:8081/api/staff/orders/999999/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 400 參數錯誤
curl -X POST http://localhost:8081/api/staff/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId": ""}'
```

---

## 🚀 **Ubuntu Server生產環境部署測試**

### 1. 生產環境配置

**🌐 生產環境信息:**
- **API Base URL**: `http://192.168.0.113:8087/api`
- **健康檢查端點**: `http://192.168.0.113:8087/api/health`
- **WebSocket端點**: `ws://192.168.0.113:8087/ws/staff/{staffId}`
- **容器名稱**: `ranbow-restaurant-backend`
- **Docker端口映射**: `8087:8087`

### 2. Docker部署流程

**🐳 完整部署指令:**
```bash
# 1. SSH連接到Ubuntu Server
ssh user@192.168.0.113

# 2. 創建部署目錄
mkdir -p /root/ranbow-restaurant-backend
cd /root/ranbow-restaurant-backend

# 3. 上傳專案文件 (使用ssh-server MCP工具)
# - Dockerfile
# - pom.xml
# - src/ 目錄
# - application.yml

# 4. 構建Docker映像
docker build -t ranbow-restaurant-backend:latest .

# 5. 停止舊容器
docker stop ranbow-restaurant-backend 2>/dev/null || true
docker rm ranbow-restaurant-backend 2>/dev/null || true

# 6. 啟動新容器
docker run -d \
  --name ranbow-restaurant-backend \
  -p 8087:8087 \
  -e SPRING_PROFILES_ACTIVE=production \
  ranbow-restaurant-backend:latest

# 7. 檢查容器狀態
docker ps | grep ranbow-restaurant-backend
docker logs ranbow-restaurant-backend --tail 50
```

### 3. 生產環境API測試

**✅ 健康檢查測試:**
```bash
# 本地測試生產環境API
curl http://192.168.0.113:8087/api/health

# SSH到Ubuntu Server本地測試
ssh user@192.168.0.113
curl http://localhost:8087/api/health

# 預期返回
{
  "status": "UP",
  "timestamp": "2025-08-23T10:30:00Z",
  "environment": "production"
}
```

**🔐 生產環境認證測試:**
```bash
# 員工登入測試 (生產環境)
curl -X POST http://192.168.0.113:8087/api/staff/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "ST001",
    "password": "production_password",
    "deviceInfo": {
      "deviceId": "POS-PROD-001",
      "deviceType": "TABLET",
      "appVersion": "1.0.0"
    }
  }'
```

**📋 生產環境訂單API測試:**
```bash
# 使用生產環境Token測試訂單隊列
curl -X GET "http://192.168.0.113:8087/api/staff/orders/queue?status=PENDING&page=0&size=10" \
  -H "Authorization: Bearer PRODUCTION_JWT_TOKEN"
```

### 4. 生產環境監控

**📊 容器運行狀態檢查:**
```bash
# 檢查容器狀態
docker ps -f name=ranbow-restaurant-backend

# 檢查容器資源使用
docker stats ranbow-restaurant-backend --no-stream

# 檢查應用日誌
docker logs ranbow-restaurant-backend --tail 100 -f

# 檢查端口監聽
netstat -tlnp | grep 8087
```

**💾 數據庫連接測試:**
```bash
# SSH到Ubuntu Server
ssh user@192.168.0.113

# 進入容器檢查數據庫連接
docker exec -it ranbow-restaurant-backend sh

# 在容器內測試數據庫連接
curl -X GET http://localhost:8087/api/health/db
```

**🔴 Redis緩存測試:**
```bash
# 測試Redis連接
curl -X GET http://192.168.0.113:8087/api/health/redis

# 或在Ubuntu Server上直接連接Redis
redis-cli -h 192.168.0.113 -p 6379 ping
```

### 5. 部署驗證清單

**✅ 部署後驗證檢查項:**

**基礎檢查:**
- [ ] Docker容器狀態為 `Up`
- [ ] 端口8087正常監聽
- [ ] 健康檢查返回 `UP` 狀態
- [ ] 容器日誌無ERROR級別錯誤

**功能檢查:**
- [ ] 員工登入API正常工作
- [ ] 訂單隊列API返回數據
- [ ] WebSocket連接建立成功
- [ ] 狀態更新API正常響應

**性能檢查:**
- [ ] API響應時間 < 500ms
- [ ] CPU使用率 < 80%
- [ ] 內存使用率 < 80%
- [ ] 數據庫連接池正常

**安全檢查:**
- [ ] JWT Token認證有效
- [ ] 權限控制正常工作
- [ ] HTTPS強制啟用（如已配置）
- [ ] 敏感數據已加密

### 6. 故障排除

**🔧 常見問題與解決方案:**

**容器啟動失敗:**
```bash
# 檢查容器日誌
docker logs ranbow-restaurant-backend

# 檢查端口占用
lsof -i:8087

# 重建映像
docker build --no-cache -t ranbow-restaurant-backend:latest .
```

**API連接超時:**
```bash
# 檢查防火牆設置
ufw status
iptables -L

# 檢查網絡連通性
ping 192.168.0.113
telnet 192.168.0.113 8087
```

**數據庫連接問題:**
```bash
# 檢查PostgreSQL連接
psql -h 192.168.0.114 -p 5432 -U restaurant_user -d restaurant_db

# 檢查Redis連接
redis-cli -h 192.168.0.113 -p 6379 ping
```

### 7. 效能測試

**⚡ 簡單壓力測試:**
```bash
# 使用ab工具進行簡單壓力測試
apt-get install apache2-utils

# 健康檢查壓力測試
ab -n 1000 -c 10 http://192.168.0.113:8087/api/health

# 登入API壓力測試（需要準備測試數據）
ab -n 100 -c 5 -p login_data.json -T application/json \
   http://192.168.0.113:8087/api/staff/auth/login
```

**📊 監控指標:**
```bash
# 檢查系統資源
htop
free -h
df -h

# 檢查網絡連接
ss -tuln | grep 8087
netstat -an | grep 8087
```

---

## 🚨 **測試注意事項**

### 安全考慮
- **生產環境密碼**: 使用強密碼，不要使用預設密碼
- **Token管理**: JWT Token應定期更換，避免長期使用
- **網絡安全**: 確保API端點不對外公開（僅內網訪問）
- **日誌安全**: 避免在日誌中記錄敏感信息

### 測試數據
- **測試帳號**: 建立專用測試員工帳號，避免使用正式員工資料
- **測試訂單**: 使用測試環境的虛擬訂單數據
- **數據清理**: 測試完成後及時清理測試數據

### 監控告警
- **API響應時間**: 超過1秒應調查原因
- **錯誤率**: 超過5%應立即處理
- **容器重啟**: 異常重啟需檢查原因
- **資源使用**: CPU/內存持續高使用需優化

---

**📝 此測試指南涵蓋了員工系統API的完整測試流程，從本地開發到生產環境部署驗證，確保系統穩定可靠運行。**