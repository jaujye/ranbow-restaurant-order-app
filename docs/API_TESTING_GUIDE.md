# 🍽️ Ranbow Restaurant API Testing Guide

## 🚀 Quick Start

### 1. Database Setup
首先確保 PostgreSQL 資料庫已設置：

```bash
# 連接到 PostgreSQL (192.168.0.114:5432)
psql -h 192.168.0.114 -p 5432 -U postgres

# 創建資料庫
CREATE DATABASE ranbow_restaurant;

# 執行 schema.sql 來創建表格和初始資料
\c ranbow_restaurant
\i src/main/resources/schema.sql
```

### 2. 啟動應用程式
```bash
# 使用 Maven 啟動
mvn spring-boot:run

# 或者先編譯再執行
mvn clean package
java -jar target/restaurant-order-app-1.0.0.jar
```

### 3. 檢查健康狀態
```bash
curl http://localhost:8081/api/health
```

## 📡 API 端點測試

### 🔍 Health Check Endpoints

#### 應用程式健康狀態
```bash
GET http://localhost:8081/api/health
```

#### 資料庫健康狀態
```bash
GET http://localhost:8081/api/health/database
```

#### 應用程式資訊
```bash
GET http://localhost:8081/api/health/info
```

### 👥 User Management APIs

#### 創建新用戶 (註冊)
```bash
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_customer",
    "email": "customer@test.com",
    "phoneNumber": "0912345678",
    "role": "CUSTOMER"
  }'
```

#### 用戶登入驗證
```bash
curl -X POST http://localhost:8081/api/users/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ranbow.com",
    "password": "admin123"
  }'
```

#### 獲取所有用戶
```bash
curl http://localhost:8081/api/users
```

#### 根據 ID 獲取用戶
```bash
curl http://localhost:8081/api/users/{userId}
```

#### 獲取用戶統計
```bash
curl http://localhost:8081/api/users/stats
```

### 🍽️ Menu Management APIs

#### 獲取可用菜單
```bash
curl http://localhost:8081/api/menu/available
```

#### 根據分類獲取菜單
```bash
curl http://localhost:8081/api/menu/category/MAIN_COURSE
```

#### 搜尋菜單項目
```bash
curl http://localhost:8081/api/menu/search?keyword=漢堡
```

#### 添加新菜品 (管理員)
```bash
curl -X POST http://localhost:8081/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試菜品",
    "description": "這是一個測試菜品",
    "price": 150.00,
    "category": "MAIN_COURSE",
    "preparationTime": 20
  }'
```

#### 更新菜品可用性
```bash
curl -X PUT http://localhost:8081/api/menu/{itemId}/availability \
  -H "Content-Type: application/json" \
  -d '{
    "available": false
  }'
```

#### 獲取菜單統計
```bash
curl http://localhost:8081/api/menu/stats
```

### 📋 Order Management APIs

#### 創建新訂單
```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "{user_id_here}",
    "tableNumber": 5
  }'
```

#### 添加項目到訂單
```bash
curl -X POST http://localhost:8081/api/orders/{orderId}/items \
  -H "Content-Type: application/json" \
  -d '{
    "menuItemId": "{menu_item_id_here}",
    "quantity": 2,
    "specialRequests": "不要洋蔥"
  }'
```

#### 確認訂單
```bash
curl -X PUT http://localhost:8081/api/orders/{orderId}/confirm
```

#### 更新訂單狀態 (員工/管理員)
```bash
curl -X PUT http://localhost:8081/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PREPARING"
  }'
```

#### 獲取待處理訂單
```bash
curl http://localhost:8081/api/orders/pending
```

#### 獲取今日訂單
```bash
curl http://localhost:8081/api/orders/today
```

#### 獲取訂單統計
```bash
curl http://localhost:8081/api/orders/stats
```

### 💳 Payment Processing APIs

#### 創建付款
```bash
curl -X POST http://localhost:8081/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{order_id_here}",
    "customerId": "{customer_id_here}",
    "paymentMethod": "CREDIT_CARD"
  }'
```

#### 處理付款
```bash
curl -X POST http://localhost:8081/api/payments/{paymentId}/process
```

#### 退款
```bash
curl -X POST http://localhost:8081/api/payments/{paymentId}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "客戶要求退款"
  }'
```

#### 獲取今日營收
```bash
curl http://localhost:8081/api/payments/revenue/today
```

#### 獲取總營收
```bash
curl http://localhost:8081/api/payments/revenue/total
```

#### 獲取付款統計
```bash
curl http://localhost:8081/api/payments/stats
```

### 📊 Reports APIs

#### 獲取每日報告
```bash
curl http://localhost:8081/api/reports/daily
```

#### 獲取格式化每日報告
```bash
curl http://localhost:8081/api/reports/daily/formatted
```

#### 獲取系統總覽
```bash
curl http://localhost:8081/api/reports/system-overview
```

#### 獲取格式化系統總覽
```bash
curl http://localhost:8081/api/reports/system-overview/formatted
```

## 🧪 完整測試流程

### 1. 創建測試用戶
```bash
# 創建顧客帳戶
CUSTOMER_RESPONSE=$(curl -s -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "測試顧客",
    "email": "customer@test.com",
    "phoneNumber": "0912345678",
    "role": "CUSTOMER"
  }')

# 提取用戶 ID
CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.userId')
echo "Customer ID: $CUSTOMER_ID"
```

### 2. 瀏覽菜單並創建訂單
```bash
# 獲取可用菜單
curl -s http://localhost:8081/api/menu/available | jq

# 創建訂單
ORDER_RESPONSE=$(curl -s -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"tableNumber\": 3
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.orderId')
echo "Order ID: $ORDER_ID"
```

### 3. 添加菜品到訂單
```bash
# 獲取第一個菜品 ID
MENU_ITEM_ID=$(curl -s http://localhost:8081/api/menu/available | jq -r '.[0].itemId')

# 添加菜品到訂單
curl -X POST http://localhost:8081/api/orders/$ORDER_ID/items \
  -H "Content-Type: application/json" \
  -d "{
    \"menuItemId\": \"$MENU_ITEM_ID\",
    \"quantity\": 2,
    \"specialRequests\": \"不要辣\"
  }"
```

### 4. 確認訂單並處理付款
```bash
# 確認訂單
curl -X PUT http://localhost:8081/api/orders/$ORDER_ID/confirm

# 創建付款
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:8081/api/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"customerId\": \"$CUSTOMER_ID\",
    \"paymentMethod\": \"CREDIT_CARD\"
  }")

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.paymentId')

# 處理付款
curl -X POST http://localhost:8081/api/payments/$PAYMENT_ID/process
```

### 5. 更新訂單狀態 (員工操作)
```bash
# 更新為準備中
curl -X PUT http://localhost:8081/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PREPARING"
  }'

# 更新為準備完成
curl -X PUT http://localhost:8081/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "READY"
  }'

# 更新為已完成
curl -X PUT http://localhost:8081/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

### 6. 查看報告
```bash
# 查看每日報告
curl -s http://localhost:8081/api/reports/daily/formatted

# 查看系統總覽
curl -s http://localhost:8081/api/reports/system-overview/formatted
```

## 🛠️ 測試工具推薦

### 使用 Postman
1. 導入 API 集合：可以根據上述端點創建 Postman 集合
2. 設置環境變數：BASE_URL = http://localhost:8081/api
3. 創建測試腳本來驗證響應

### 使用 curl 腳本
創建自動化測試腳本：

```bash
#!/bin/bash
# test_api.sh

BASE_URL="http://localhost:8081/api"

echo "🧪 Testing Ranbow Restaurant API..."

# Test health
echo "📡 Testing health endpoint..."
curl -f $BASE_URL/health || exit 1

# Test user creation
echo "👤 Testing user creation..."
# ... 更多測試

echo "✅ All tests passed!"
```

## 🚨 常見問題

### 1. 資料庫連線失敗
- 檢查 PostgreSQL 服務是否運行
- 確認連線資訊正確 (192.168.0.114:5432)
- 檢查防火牆設定

### 2. 應用程式啟動失敗
- 檢查 Java 17+ 是否安裝
- 確認 Maven 依賴下載完成
- 檢查端口 8081 是否被占用

### 3. API 響應錯誤
- 檢查請求格式是否正確
- 確認必填欄位都有提供
- 查看應用程式日誌獲取詳細錯誤資訊

---

🎉 **Happy Testing!** 如有問題，請檢查 logs/restaurant-app.log 日誌文件。