# 🚀 簡單啟動指南 - Ranbow Restaurant API Server

## 🎯 快速啟動 (不需要 Maven)

由於您的環境沒有 Maven，我已經創建了一個簡化版本的服務器，使用純 Java 實現。

### 1. 📋 準備工作

確認您有以下項目：
- ✅ Java 17+ 已安裝
- ✅ PostgreSQL 服務器運行在 192.168.0.114:5432
- ✅ 資料庫帳號: postgres / 密碼: Patycri3r

### 2. 🗄️ 設置資料庫

#### 步驟 1: 創建資料庫
```bash
# 連接到 PostgreSQL
psql -h 192.168.0.114 -p 5432 -U postgres

# 創建資料庫
CREATE DATABASE ranbow_restaurant;

# 退出
\q
```

#### 步驟 2: 初始化資料庫結構
```bash
# 執行 schema.sql 來創建表格和初始資料
psql -h 192.168.0.114 -p 5432 -U postgres -d ranbow_restaurant -f src/main/resources/schema.sql
```

### 3. 🚀 啟動服務器

#### 編譯程式 (已完成)
```bash
javac -cp postgresql-42.7.1.jar SimpleRestaurantServer.java
```

#### 運行服務器
```bash
java -cp ".;postgresql-42.7.1.jar" SimpleRestaurantServer
```

您應該看到類似以下輸出：
```
🍽️ 正在啟動 Ranbow Restaurant Server...
🗄️ Database connected successfully
✅ 服務器已啟動！
📡 服務器地址: http://localhost:8080
🏥 健康檢查: http://localhost:8080/api/health
🍽️ 菜單 API: http://localhost:8080/api/menu

按 Ctrl+C 停止服務器
```

### 4. 🧪 測試 API

#### 檢查健康狀態
```bash
curl http://localhost:8080/api/health
```

#### 獲取菜單
```bash
curl http://localhost:8080/api/menu/available
```

#### 獲取統計資料
```bash
# 用戶統計
curl http://localhost:8080/api/users

# 訂單統計
curl http://localhost:8080/api/orders
```

## 📱 簡化版 API 端點

### ✅ 已實現的端點

| 端點 | 方法 | 功能 |
|------|------|------|
| `/api/health` | GET | 應用程式和資料庫健康狀態 |
| `/api/menu` | GET | 獲取可用菜單項目 |
| `/api/menu/available` | GET | 獲取可用菜單項目 |
| `/api/users` | GET | 獲取用戶統計資料 |
| `/api/orders` | GET | 獲取訂單統計資料 |

### 🔄 部分實現的端點

| 端點 | 狀態 | 說明 |
|------|------|------|
| `/api/users` | POST | 用戶創建功能預留 |
| `/api/orders` | POST | 訂單創建功能預留 |
| `/api/payments` | * | 付款功能預留 |

## 🛠️ 擴展說明

這個簡化版本提供了基本的 REST API 功能。如果您需要完整功能，有以下選項：

### 選項 A: 安裝 Maven 並使用完整版本
```bash
# 安裝 Maven
# 然後使用：
mvn spring-boot:run
```

### 選項 B: 擴展簡化版本
您可以繼續在 `SimpleRestaurantServer.java` 中添加功能：
- 添加 JSON 解析 (使用簡單的字符串處理)
- 實現 POST/PUT 請求處理
- 添加更多資料庫操作

### 選項 C: 使用 IDE 如 IntelliJ IDEA
IntelliJ IDEA 可以自動處理 Maven 依賴，讓您使用完整版本。

## 🚨 問題排解

### 編譯錯誤
- 確認 Java 17+ 已安裝：`java -version`
- 確認 PostgreSQL JDBC 驅動在當前目錄：`postgresql-42.7.1.jar`

### 資料庫連接失敗
```
❌ 資料庫連接失敗: Connection refused
```
**解決方案：**
1. 檢查 PostgreSQL 服務是否運行
2. 檢查 IP 地址和端口是否正確 (192.168.0.114:5432)
3. 檢查防火牆設定
4. 確認資料庫 `ranbow_restaurant` 已創建

### 服務器啟動失敗
```
Address already in use
```
**解決方案：**
端口 8080 被占用，停止其他服務或修改 `SimpleRestaurantServer.java` 中的端口號。

## 📊 測試範例

### 完整測試流程
```bash
# 1. 啟動服務器
java -cp ".;postgresql-42.7.1.jar" SimpleRestaurantServer

# 2. 在另一個終端中測試
curl http://localhost:8080/api/health

# 3. 測試菜單 API
curl http://localhost:8080/api/menu/available

# 4. 查看統計資料
curl http://localhost:8080/api/users
curl http://localhost:8080/api/orders
```

### 預期響應
健康檢查應該返回類似：
```json
{
    "status": "UP",
    "timestamp": "2025-08-14T...",
    "service": "Ranbow Restaurant Order Application",
    "version": "1.0.0",
    "database": "Connected",
    "stats": {
        "totalUsers": 2,
        "totalMenuItems": 10,
        "totalOrders": 0
    }
}
```

---

🎉 **您的簡化版餐廳 API 服務器現在可以接受手機 App 的請求了！**

如果您需要完整功能，建議安裝 Maven 或使用支持 Maven 的 IDE。