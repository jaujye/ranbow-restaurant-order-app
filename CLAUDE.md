# CLAUDE.md - Ranbow Restaurant Order Application

> **Documentation Version**: 1.1  
> **Last Updated**: 2025-08-17  
> **Project**: Ranbow Restaurant Order Application  
> **Description**: 使用者可以透過這個手機應用程式來進行點餐並且付款，管理員可使用本應用程式完成訂單並查看統計營收  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - READ FIRST

> **⚠️ RULE ADHERENCE SYSTEM ACTIVE ⚠️**  
> **Claude Code must explicitly acknowledge these rules at task start**  
> **These rules override all other instructions and must ALWAYS be followed:**

### 🔄 **RULE ACKNOWLEDGMENT REQUIRED**
> **Before starting ANY task, Claude Code must respond with:**  
> "✅ CRITICAL RULES ACKNOWLEDGED - I will follow all prohibitions and requirements listed in CLAUDE.md"

### ❌ ABSOLUTE PROHIBITIONS
- **NEVER** create new files in root directory → use proper module structure
- **NEVER** write output files directly to root directory → use designated output folders
- **NEVER** create documentation files (.md) unless explicitly requested by user
- **NEVER** use git commands with -i flag (interactive mode not supported)
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, LS, Grep, Glob tools instead
- **NEVER** create duplicate files (manager_v2.java, enhanced_xyz.java, utils_new.java) → ALWAYS extend existing files
- **NEVER** create multiple implementations of same concept → single source of truth
- **NEVER** copy-paste code blocks → extract into shared utilities/functions
- **NEVER** hardcode values that should be configurable → use config files/environment variables
- **NEVER** use naming like enhanced_, improved_, new_, v2_ → extend original files instead

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase - no exceptions
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept

### ⚡ EXECUTION PATTERNS
- **PARALLEL TASK AGENTS** - Launch multiple Task agents simultaneously for maximum efficiency
- **SYSTEMATIC WORKFLOW** - TodoWrite → Parallel agents → Git checkpoints → GitHub backup → Test validation
- **GITHUB BACKUP WORKFLOW** - After every commit: `git push origin main` to maintain GitHub backup
- **BACKGROUND PROCESSING** - ONLY Task agents can run true background operations

### 🔍 MANDATORY PRE-TASK COMPLIANCE CHECK
> **STOP: Before starting any task, Claude Code must explicitly verify ALL points:**

**Step 1: Rule Acknowledgment**
- [ ] ✅ I acknowledge all critical rules in CLAUDE.md and will follow them

**Step 2: Task Analysis**  
- [ ] Will this create files in root? → If YES, use proper module structure instead
- [ ] Will this take >30 seconds? → If YES, use Task agents not Bash
- [ ] Is this 3+ steps? → If YES, use TodoWrite breakdown first
- [ ] Am I about to use grep/find/cat? → If YES, use proper tools instead

**Step 3: Technical Debt Prevention (MANDATORY SEARCH FIRST)**
- [ ] **SEARCH FIRST**: Use Grep pattern="<functionality>.*<keyword>" to find existing implementations
- [ ] **CHECK EXISTING**: Read any found files to understand current functionality
- [ ] Does similar functionality already exist? → If YES, extend existing code
- [ ] Am I creating a duplicate class/manager? → If YES, consolidate instead
- [ ] Will this create multiple sources of truth? → If YES, redesign approach
- [ ] Have I searched for existing implementations? → Use Grep/Glob tools first
- [ ] Can I extend existing code instead of creating new? → Prefer extension over creation
- [ ] Am I about to copy-paste code? → Extract to shared utility instead

**Step 4: Session Management**
- [ ] Is this a long/complex task? → If YES, plan context checkpoints
- [ ] Have I been working >1 hour? → If YES, consider /compact or session break

> **⚠️ DO NOT PROCEED until all checkboxes are explicitly verified**

## 🏗️ PROJECT OVERVIEW

### 🎯 **DEVELOPMENT STATUS**
- **Setup**: ✅ Completed
- **Core Features**: ✅ Completed & Stabilized
- **Order & Payment System**: ✅ Completed & Bug-Fixed  
- **Ubuntu Server Deployment**: ✅ Completed
- **Backend API**: ✅ Completed & Stable
- **Frontend Web App**: ✅ Completed & Tested
- **Database Integration**: ✅ Completed (PostgreSQL + Redis)
- **User Management**: ✅ Completed
- **Order Management**: ✅ Completed & Status-Fixed
- **Payment Processing**: ✅ Completed & Error-Resolved
- **System Testing**: ✅ Completed
- **Documentation**: ✅ Updated & Current

## 🎯 **SYSTEM STABILITY & RECENT FIXES**

### ✅ **最近完成的關鍵修正 (2025-08-18)**

**核心問題修正:**
1. **訂單ID重複使用邏輯** - 修正前端checkout.js中重複使用PENDING_PAYMENT訂單的問題
2. **付款API重複檢查** - 改善PaymentService.java的付款驗證邏輯
3. **資料庫狀態更新** - 修正OrderService中狀態更新不寫入資料庫的關鍵錯誤
4. **前端狀態顯示** - 修正「我的訂單」頁面狀態顯示和日期格式化問題

**技術債務清理:**
- Order.java: 新增前端兼容性方法 (getItems, getCreatedAt)
- helpers.js: 強化日期解析和格式化功能，支援Java LocalDateTime
- orders.js: 完善所有訂單狀態的中文化和圖標顯示
- storage.js: 修正訂單緩存的ID匹配邏輯

**系統可靠性提升:**
- ✅ 訂單和付款流程完全穩定
- ✅ 前後端狀態同步一致性
- ✅ 資料庫操作事務完整性
- ✅ 用戶界面回饋準確性

### 🏆 **Production Readiness Status**
- **核心功能**: 🟢 Production Ready
- **API穩定性**: 🟢 All Endpoints Stable  
- **資料庫一致性**: 🟢 ACID Compliant
- **前端UX**: 🟢 Fully Functional
- **錯誤處理**: 🟢 Comprehensive Coverage

## 📋 JAVA PROJECT GUIDELINES

### 🎯 **PACKAGE STRUCTURE**
```
src/main/java/com/ranbow/restaurant/
├── RestaurantApplication.java    # Spring Boot主應用程式類
├── config/                       # 配置類
├── models/                       # Data models/entities (Order, MenuItem, User, etc.)
├── dao/                          # Data Access Objects
├── services/                     # Service layer (OrderService, PaymentService, etc.)
└── api/                          # REST API Controllers
```

### 🚀 開發及部署模式

**🏠 本地開發模式 (Local Development):**

```bash
# 1. 清理並編譯專案
mvn clean compile

# 2. 啟動Spring Boot開發伺服器 (推薦)
mvn spring-boot:run

# 3. 或者打包並運行
mvn clean package
java -jar target/restaurant-order-app-1.0.0.jar

# 4. 測試API健康檢查
curl http://localhost:8080/api/health
```

### 🔧 **開發工作流程**

**🏠 本地開發階段:**
```bash
# 完整開發啟動流程
1. mvn clean compile          # 編譯源碼
2. mvn spring-boot:run        # 啟動Spring Boot服務器
3. 訪問 http://localhost:8080/api/health # 驗證服務器狀態

# 測試相關指令
mvn test                      # 運行測試
mvn clean package -DskipTests # 打包（跳過測試）
```

**🚀 Ubuntu Server部署階段:**
```bash
# 部署到生產環境的完整流程
1. 修改代碼並測試完成
2. 使用ssh-server工具上傳代碼到Ubuntu server
3. 在Ubuntu server上執行docker build建立image
4. 運行docker容器啟動服務
5. 測試API連線確認部署成功
```

### 📡 **API服務器資訊**

**🏠 本地開發環境:**
- **主類**: `com.ranbow.restaurant.RestaurantApplication`
- **端口**: `8080`
- **基礎URL**: `http://localhost:8080/api`
- **健康檢查**: `http://localhost:8080/api/health`
- **數據庫**: H2 (內存數據庫)

**🚀 Ubuntu Server生產環境:**
- **主類**: `com.ranbow.restaurant.RestaurantApplication`
- **端口**: `8087`
- **基礎URL**: `http://192.168.0.113:8087/api`
- **健康檢查**: `http://192.168.0.113:8087/api/health`
- **數據庫**: PostgreSQL (192.168.0.114:5432)
- **緩存**: Redis (192.168.0.113:6379)
- **容器**: Docker (ranbow-restaurant-backend:latest)

## 🚀 UBUNTU SERVER 部署指南

### 📋 **部署前置條件**

- Ubuntu Server已設置並可通過SSH連接
- Docker已安裝在Ubuntu Server上
- PostgreSQL服務器運行在192.168.0.114:5432
- Redis服務器運行在192.168.0.113:6379
- Claude Code已配置ssh-server MCP工具

### 🔧 **完整部署流程**

**1️⃣ 準備部署文件**
```bash
# 確認Dockerfile已配置正確端口
EXPOSE 8087

# 確認application.yml配置正確
server:
  port: 8087
```

**2️⃣ 使用SSH-Server工具部署**
```bash
# 1. 創建遠程目錄
mkdir -p /root/ranbow-restaurant-backend

# 2. 上傳項目文件到Ubuntu Server
- 上傳Dockerfile
- 上傳pom.xml  
- 上傳src/目錄及所有Java源碼
- 上傳application.yml配置文件

# 3. 在Ubuntu Server執行Docker構建
docker build -t ranbow-restaurant-backend:latest /root/ranbow-restaurant-backend

# 4. 停止舊容器(如果存在)
docker stop ranbow-restaurant-backend
docker rm ranbow-restaurant-backend

# 5. 啟動新容器
docker run -d --name ranbow-restaurant-backend -p 8087:8087 ranbow-restaurant-backend:latest

# 6. 驗證部署成功
curl http://localhost:8087/api/health
```

**3️⃣ 部署驗證檢查清單**
- [ ] ✅ Docker容器狀態為healthy
- [ ] ✅ API健康檢查返回UP狀態  
- [ ] ✅ 數據庫連接正常
- [ ] ✅ Redis會話管理正常
- [ ] ✅ 前端可正常調用API

### 🔄 **日常開發部署工作流程**

**開發完成後的標準部署流程:**

```bash
# 步驟1: 本地開發完成
1. 完成代碼修改和測試
2. git add . && git commit -m "描述修改內容"
3. git push origin main

# 步驟2: 部署到Ubuntu Server  
1. 使用ssh-server工具上傳修改的文件到/root/ranbow-restaurant-backend/
2. 在Ubuntu server執行: docker build -t ranbow-restaurant-backend:latest /root/ranbow-restaurant-backend
3. 重啟容器: docker stop ranbow-restaurant-backend && docker rm ranbow-restaurant-backend
4. 運行新容器: docker run -d --name ranbow-restaurant-backend -p 8087:8087 ranbow-restaurant-backend:latest

# 步驟3: 部署驗證
1. 檢查容器狀態: docker ps
2. 測試API: curl http://localhost:8087/api/health
3. 驗證前端連接: 測試web前端API調用
```

### 🛠️ **常用Docker管理命令**

```bash
# 查看容器狀態
docker ps

# 查看容器日誌
docker logs ranbow-restaurant-backend

# 進入容器調試
docker exec -it ranbow-restaurant-backend sh

# 重建並重啟(完整更新流程)
docker stop ranbow-restaurant-backend
docker rm ranbow-restaurant-backend  
docker build -t ranbow-restaurant-backend:latest /root/ranbow-restaurant-backend
docker run -d --name ranbow-restaurant-backend -p 8087:8087 ranbow-restaurant-backend:latest

# 清理舊映像(節省空間)
docker image prune -f
```

### 🌐 **網絡配置**

**服務器架構:**
```
Ubuntu Server (192.168.0.113)
├── Spring Boot API (Port 8087)
├── Redis Cache (Port 6379) 
└── Docker Container (ranbow-restaurant-backend)

PostgreSQL Server (192.168.0.114)
└── Database (Port 5432)

Development Machine
├── Frontend (Port 3001)
└── API calls to → http://192.168.0.113:8087/api
```

## 🎯 RULE COMPLIANCE CHECK

Before starting ANY task, verify:
- [ ] ✅ I acknowledge all critical rules above
- [ ] Files go in proper Java package structure (not root)
- [ ] Use Task agents for >30 second operations
- [ ] TodoWrite for 3+ step tasks
- [ ] Commit after each completed task

## 🚨 TECHNICAL DEBT PREVENTION

### ❌ WRONG APPROACH (Creates Technical Debt):
```bash
# Creating new file without searching first
Write(file_path="NewOrderManager.java", content="...")
```

### ✅ CORRECT APPROACH (Prevents Technical Debt):
```bash
# 1. SEARCH FIRST
Grep(pattern="OrderManager.*class", glob="*.java")
# 2. READ EXISTING FILES  
Read(file_path="src/main/java/com/ranbow/restaurant/services/OrderService.java")
# 3. EXTEND EXISTING FUNCTIONALITY
Edit(file_path="src/main/java/com/ranbow/restaurant/services/OrderService.java", old_string="...", new_string="...")
```

## 🧹 DEBT PREVENTION WORKFLOW

### Before Creating ANY New File:
1. **🔍 Search First** - Use Grep/Glob to find existing implementations
2. **📋 Analyze Existing** - Read and understand current patterns
3. **🤔 Decision Tree**: Can extend existing? → DO IT | Must create new? → Document why
4. **✅ Follow Patterns** - Use established Java/project patterns
5. **📈 Validate** - Ensure no duplication or technical debt

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**

## 🗄️ DATABASE & CACHE TOOLS INTEGRATION

### 🐘 **POSTGRESQL DATABASE OPERATIONS**

**Claude Code已配置PostgreSQL MCP工具，可直接進行數據庫操作:**

**🔍 基本查詢指令:**
```bash
# 列出所有資料庫架構
mcp__postgres__list_schemas

# 列出指定架構的資料表
mcp__postgres__list_objects --schema_name public --object_type table

# 查看資料表詳細資訊
mcp__postgres__get_object_details --schema_name public --object_name orders --object_type table

# 執行SQL查詢
mcp__postgres__execute_sql --sql "SELECT * FROM orders LIMIT 10"
```

**💾 CRUD操作工作流:**
```bash
# 創建資料表
mcp__postgres__execute_sql --sql "
CREATE TABLE test_menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)"

# 新增資料
mcp__postgres__execute_sql --sql "
INSERT INTO test_menu_items (name, price, category) 
VALUES ('測試漢堡', 299.00, '主餐')"

# 查詢資料
mcp__postgres__execute_sql --sql "SELECT * FROM test_menu_items WHERE category = '主餐'"

# 修改資料
mcp__postgres__execute_sql --sql "
UPDATE test_menu_items SET price = 279.00 WHERE name = '測試漢堡'"

# 刪除資料
mcp__postgres__execute_sql --sql "DELETE FROM test_menu_items WHERE id = 1"

# 刪除資料表
mcp__postgres__execute_sql --sql "DROP TABLE test_menu_items"
```

**🔍 效能分析與最佳化:**
```bash
# 分析查詢執行計劃
mcp__postgres__explain_query --sql "SELECT * FROM orders WHERE user_id = 123" --analyze true

# 分析工作負載並推薦索引
mcp__postgres__analyze_workload_indexes --method dta --max_index_size_mb 1000

# 分析特定查詢的索引需求
mcp__postgres__analyze_query_indexes --queries ["SELECT * FROM orders WHERE status = 'pending'"] --method dta

# 資料庫健康檢查
mcp__postgres__analyze_db_health --health_type all

# 查看最耗時的查詢
mcp__postgres__get_top_queries --sort_by total_time --limit 10
```

### 🔴 **REDIS CACHE OPERATIONS**

**Claude Code已配置Redis MCP工具，可直接進行緩存操作:**

**🔑 基本操作指令:**
```bash
# 設置鍵值對
mcp__redis__set --key "user:123:session" --value "active" --expireSeconds 3600

# 獲取值
mcp__redis__get --key "user:123:session"

# 列出所有鍵
mcp__redis__list --pattern "*"

# 列出特定模式的鍵
mcp__redis__list --pattern "user:*:session"

# 刪除單個鍵
mcp__redis__delete --key "user:123:session"

# 刪除多個鍵
mcp__redis__delete --key ["user:123:session", "user:456:session"]
```

**💡 緩存策略測試工作流:**
```bash
# 1. 設置測試數據
mcp__redis__set --key "menu:items:cache" --value '{"burgers":5,"drinks":10}' --expireSeconds 300

# 2. 驗證緩存存在
mcp__redis__get --key "menu:items:cache"

# 3. 測試會話管理
mcp__redis__set --key "session:test123" --value "user_data" --expireSeconds 1800

# 4. 檢查所有會話
mcp__redis__list --pattern "session:*"

# 5. 清理測試數據
mcp__redis__delete --key ["menu:items:cache", "session:test123"]
```

### 🔄 **整合開發測試工作流**

**完整的資料庫與緩存測試流程:**

**1️⃣ 開發準備階段:**
```bash
# 檢查資料庫連線狀態
mcp__postgres__list_schemas

# 檢查Redis服務狀態
mcp__redis__list --pattern "*"

# 清理舊的測試數據
mcp__redis__delete --key ["test:*"]
mcp__postgres__execute_sql --sql "DELETE FROM test_orders WHERE id < 0"
```

**2️⃣ 功能開發測試:**
```bash
# 測試數據庫寫入操作
mcp__postgres__execute_sql --sql "
INSERT INTO orders (user_id, total_amount, status) 
VALUES (999, 199.00, 'pending') RETURNING id"

# 測試緩存寫入操作
mcp__redis__set --key "order:999:cache" --value '{"status":"pending","amount":199}' --expireSeconds 600

# 驗證數據一致性
mcp__postgres__execute_sql --sql "SELECT * FROM orders WHERE user_id = 999"
mcp__redis__get --key "order:999:cache"

# 測試數據更新
mcp__postgres__execute_sql --sql "UPDATE orders SET status = 'completed' WHERE user_id = 999"
mcp__redis__set --key "order:999:cache" --value '{"status":"completed","amount":199}' --expireSeconds 600
```

**3️⃣ 效能測試與最佳化:**
```bash
# 分析資料庫查詢效能
mcp__postgres__explain_query --sql "SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 'pending'" --analyze true

# 檢查緩存命中率（透過模擬多次讀取）
mcp__redis__get --key "menu:popular:items"
mcp__redis__get --key "menu:popular:items"

# 推薦索引最佳化
mcp__postgres__analyze_query_indexes --queries ["SELECT * FROM orders WHERE status = 'pending'", "SELECT * FROM menu_items WHERE category = 'beverage'"] --method dta
```

**4️⃣ 清理測試數據:**
```bash
# 清理測試資料庫數據
mcp__postgres__execute_sql --sql "DELETE FROM orders WHERE user_id = 999"

# 清理測試緩存數據
mcp__redis__delete --key ["order:999:cache", "test:*"]

# 驗證清理完成
mcp__postgres__execute_sql --sql "SELECT COUNT(*) FROM orders WHERE user_id = 999"
mcp__redis__list --pattern "*999*"
```

### 🚀 **開發整合建議**

**在進行以下開發時，使用上述工具進行測試:**

1. **新增API端點時** → 使用PostgreSQL工具驗證資料寫入/讀取
2. **修改資料模型時** → 使用PostgreSQL工具測試資料表結構變更
3. **實現緩存邏輯時** → 使用Redis工具驗證緩存讀寫操作
4. **效能最佳化時** → 使用PostgreSQL分析工具檢查查詢效能
5. **部署前測試時** → 使用完整工作流驗證資料庫和緩存一致性

**📋 開發檢查清單:**
- [ ] 資料庫操作通過PostgreSQL工具測試
- [ ] 緩存邏輯通過Redis工具驗證
- [ ] 查詢效能通過explain_query分析
- [ ] 測試數據清理完成
- [ ] 生產環境配置正確

## 🌐 WEB FRONTEND 開發進度與測試

### 🎯 **前端開發狀態**
- **架構設計**: ✅ 已完成 - 單頁應用程式(SPA)架構
- **核心功能**: ✅ 已完成 - 用戶登入、菜單瀏覽、購物車、結帳
- **API整合**: ✅ 已完成 - 與後端API完全連通並修正錯誤
- **響應式設計**: ✅ 已完成 - 支援桌面和手機版
- **UI/UX設計**: ✅ 已完成 - 現代化彩虹主題設計
- **訂單系統**: ✅ 已完成 - 狀態顯示和進程追蹤修正完成
- **付款系統**: ✅ 已完成 - 付款流程修正並測試通過
- **狀態管理**: ✅ 已完成 - 訂單狀態正確同步和顯示
- **測試驗證**: ✅ 已完成 - 使用Playwright自動化測試
- **錯誤修正**: ✅ 已完成 - 所有已知問題已解決
- **管理員功能**: ⚠️ 基礎完成 - 登入成功，後台頁面可擴展

### 📁 **前端專案結構**

```
web/
├── index.html                    # 主頁面入口
├── assets/
│   ├── css/                      # 樣式文件
│   │   ├── reset.css            # CSS重置
│   │   ├── variables.css        # CSS變數定義
│   │   ├── components.css       # 組件樣式
│   │   ├── pages.css           # 頁面樣式
│   │   └── responsive.css      # 響應式設計
│   ├── js/
│   │   ├── app.js              # 主應用程式邏輯
│   │   └── router.js           # 路由管理
│   ├── icons/                  # 圖標文件
│   └── images/                 # 圖片資源
├── components/                  # UI組件
│   ├── cart.js                 # 購物車組件
│   ├── modal.js                # 彈窗組件
│   └── toast.js                # 通知組件
├── pages/                      # 頁面模組
│   ├── auth.js                 # 登入/註冊頁面
│   ├── home.js                 # 首頁
│   ├── menu.js                 # 菜單頁面
│   ├── cart.js                 # 購物車頁面
│   ├── checkout.js             # 結帳頁面
│   ├── orders.js               # 訂單頁面
│   └── profile.js              # 個人資料頁面
├── utils/                      # 工具函數
│   ├── api.js                  # API呼叫工具
│   ├── storage.js              # 本地存儲管理
│   └── helpers.js              # 輔助函數
└── test-api.html               # API測試頁面
```

### 🔗 **前端API整合狀態**

**✅ 成功連接的API端點:**
- `GET /api/health` - 健康檢查 (200 OK)
- `POST /api/users/login` - 用戶登入 (200 OK)  
- `GET /api/menu` - 獲取菜單 (200 OK)
- `GET /api/menu/popular` - 熱門菜品 (200 OK)
- `GET /api/orders/customer/{id}` - 客戶訂單 (200 OK) - 內容顯示已修正
- `POST /api/orders` - 提交訂單 (200 OK) - 訂單ID重複問題已修正
- `POST /api/payments` - 建立付款 (200 OK) - 重複付款邏輯已修正
- `POST /api/payments/{id}/process` - 處理付款 (200 OK) - 狀態更新已修正

### 🎨 **前端功能特性**

**🔐 用戶認證系統:**
- 快速登入選項: 顧客、員工、管理員
- 自動會話管理與狀態保持
- 角色權限區分

**🍽️ 菜單系統:**
- 分類瀏覽: 前菜、主菜、甜點、飲料
- 搜尋功能
- 今日推薦菜品展示
- 即時價格顯示

**🛒 購物車系統:**
- 即時添加商品
- 數量調整控制
- 價格自動計算
- 稅金與服務費計算
- 購物車狀態保存

**💳 結帳系統:**
- 訂單確認界面
- 多種付款方式: 現金、信用卡、LINE Pay、Apple Pay
- 特殊需求備註
- 費用明細展示
- 桌號管理

**📱 響應式設計:**
- 桌面版最佳化 (1200px+)
- 平板版適配 (768px-1199px)
- 手機版優化 (375px-767px)
- 觸控友好的UI設計

### 🎨 **UI/UX設計特色**

**🌈 視覺設計:**
- 彩虹漸層背景主題
- 現代化卡片式佈局
- 一致的圖標系統
- 和諧的色彩搭配

**🔄 交互設計:**
- 流暢的頁面轉換
- 即時反饋通知
- 直觀的購物流程
- 無障礙設計考量

### 🧪 **前端測試覆蓋**

**✅ 已完成測試項目:**

**1. 基礎功能測試:**
- [x] 頁面正常載入
- [x] 導航功能正常
- [x] 響應式設計適配
- [x] 表單輸入驗證

**2. 用戶流程測試:**
- [x] 登入功能 (客戶/員工/管理員)
- [x] 菜單瀏覽與搜尋
- [x] 商品添加到購物車
- [x] 購物車管理功能
- [x] 結帳流程完整性

**3. API整合測試:**
- [x] 健康檢查連接
- [x] 用戶認證API
- [x] 菜單資料獲取
- [x] 購物車狀態同步
- [x] 訂單提交測試

**4. UI/UX測試:**
- [x] 跨瀏覽器相容性
- [x] 不同螢幕尺寸適配
- [x] 觸控操作友好性
- [x] 載入性能優化

### ⚠️ **未來擴展項目**

**1. ✅ 已解決的問題:**
- ~~訂單提交API返回400錯誤~~ → ✅ 已修正
- ~~訂單ID重複使用問題~~ → ✅ 已修正  
- ~~付款API重複付款檢查錯誤~~ → ✅ 已修正
- ~~「我的訂單」內容載入問題~~ → ✅ 已修正
- ~~Invalid Date顯示問題~~ → ✅ 已修正
- ~~付款後訂單狀態不更新問題~~ → ✅ 已修正
- ~~訂單狀態顯示「？未知」問題~~ → ✅ 已修正

**2. 功能擴展項目:**
- 管理員完整後台儀表板 (基礎已完成)
- 員工工作台界面 (架構已就緒)
- 即時通知系統 (WebSocket整合)
- 進階報表分析功能

**3. 優化項目:**
- favicon.png 自定義圖標
- 圖片資源優化和CDN整合
- 性能監控和分析工具整合

### 🚀 **前端部署配置**

**📍 本地開發環境:**
- **訪問路徑**: `file:///C:/Users/JauJyeCH/Desktop/test/web/index.html`
- **API端點**: `http://192.168.0.113:8087/api`
- **本地服務器**: 無需（靜態文件）

**🌐 生產環境部署建議:**
- **Web服務器**: Nginx / Apache
- **CDN**: 靜態資源加速
- **HTTPS**: SSL證書配置
- **緩存策略**: 瀏覽器與CDN緩存

### 📊 **前端效能指標**

**⚡ 載入效能:**
- 首次載入時間: < 2秒
- 資源大小優化: 壓縮CSS/JS
- 圖片優化: WebP格式支援

**🔄 用戶體驗:**
- 頁面轉換流暢度: 60fps
- API回應時間: < 500ms
- 購物車同步延遲: < 100ms

## 🧪 前端測試工作流程

### 🛠️ **測試工具配置**

**主要測試工具:**
- **Playwright**: 瀏覽器自動化測試框架
- **Claude Code MCP**: 整合測試工具集
- **Browser Automation**: 完整UI交互測試

**測試環境設置:**
```bash
# 1. 安裝瀏覽器測試環境
mcp__playwright__browser_install

# 2. 啟動後端API服務器
mvn spring-boot:run  # 本地開發
# 或確保生產服務器運行在 http://192.168.0.113:8087

# 3. 打開前端應用
# 本地: file:///C:/Users/JauJyeCH/Desktop/test/web/index.html
```

### 📋 **測試項目清單**

**🔧 1. 環境測試:**
```bash
# 測試步驟
1. 瀏覽器環境準備
   - mcp__playwright__browser_install
   - 確認瀏覽器正常啟動

2. 後端API健康檢查
   - 確認 http://192.168.0.113:8087/api/health 返回200

3. 前端資源載入檢查
   - 導航到主頁面
   - 檢查CSS/JS資源載入
   - 確認無404錯誤
```

**🔐 2. 用戶認證測試:**
```bash
# 測試流程
1. 訪問登入頁面
   - mcp__playwright__browser_navigate → login頁面
   - mcp__playwright__browser_snapshot → 檢查UI載入

2. 快速登入測試
   - mcp__playwright__browser_click → 顧客帳號按鈕
   - 驗證導航到首頁
   - 確認用戶狀態顯示

3. 管理員登入測試
   - mcp__playwright__browser_click → 管理員按鈕
   - 檢查認證狀態
   - 驗證權限控制

4. 會話管理測試
   - 檢查localStorage狀態
   - 測試自動登入功能
   - 驗證登出功能
```

**🍽️ 3. 菜單系統測試:**
```bash
# 測試項目
1. 菜單資料載入
   - 檢查API調用: GET /api/menu
   - 驗證菜單分類顯示
   - 確認價格資訊正確

2. 搜尋功能測試
   - mcp__playwright__browser_type → 搜尋框輸入
   - 驗證搜尋結果過濾
   - 測試無結果情況

3. 分類瀏覽測試
   - mcp__playwright__browser_click → 各分類按鈕
   - 檢查分類切換功能
   - 驗證商品展示正確

4. 今日推薦測試
   - 檢查API調用: GET /api/menu/popular
   - 驗證推薦商品展示
   - 測試推薦標籤顯示
```

**🛒 4. 購物車系統測試:**
```bash
# 完整購物車流程測試
1. 添加商品到購物車
   - mcp__playwright__browser_click → 商品+按鈕
   - 檢查購物車計數器更新
   - 驗證通知訊息顯示

2. 購物車頁面測試
   - mcp__playwright__browser_click → 購物車導航
   - 檢查商品詳細資訊
   - 驗證價格計算正確

3. 數量管理測試
   - mcp__playwright__browser_click → 數量+/-按鈕
   - 檢查即時價格更新
   - 測試商品移除功能

4. 價格計算驗證
   - 驗證小計計算
   - 檢查稅金計算(5%)
   - 確認服務費計算(10%)
   - 驗證總計金額正確
```

**💳 5. 結帳流程測試:**
```bash
# 結帳系統完整測試
1. 結帳頁面導航
   - mcp__playwright__browser_click → 去結帳按鈕
   - 檢查訂單資訊載入
   - 驗證頁面步驟指示

2. 訂單資訊驗證
   - 檢查桌號顯示
   - 確認顧客資訊
   - 驗證商品明細正確

3. 付款方式測試
   - mcp__playwright__browser_click → 各付款選項
   - 檢查選項狀態變更
   - 驗證確認按鈕啟用

4. 訂單提交測試
   - mcp__playwright__browser_click → 確認訂單
   - 監控API調用: POST /api/orders
   - 檢查錯誤處理機制
   - 驗證成功/失敗反饋
```

**📱 6. 響應式設計測試:**
```bash
# 不同螢幕尺寸測試
1. 桌面版測試
   - mcp__playwright__browser_resize → 1920x1080
   - 檢查佈局適配
   - 驗證導航功能

2. 平板版測試
   - mcp__playwright__browser_resize → 768x1024
   - 檢查響應式調整
   - 測試觸控交互

3. 手機版測試
   - mcp__playwright__browser_resize → 375x667
   - 驗證手機UI適配
   - 測試手勢操作

4. 跨設備一致性
   - 比較不同尺寸截圖
   - 檢查功能完整性
   - 驗證性能表現
```

**🔍 7. API整合測試:**
```bash
# 網路請求監控測試
1. API連接測試
   - mcp__playwright__browser_network_requests
   - 檢查所有API端點狀態
   - 驗證回應時間

2. 錯誤處理測試
   - 模擬網路中斷
   - 測試API錯誤回應
   - 檢查用戶反饋機制

3. 數據同步測試
   - 驗證前後端數據一致性
   - 檢查即時更新功能
   - 測試離線行為

4. 性能監控
   - 監控載入時間
   - 檢查記憶體使用
   - 驗證資源優化
```

### 🔄 **測試工作流程**

**📋 標準測試流程:**

**1️⃣ 測試準備階段:**
```bash
# 環境檢查
1. 確認後端服務運行
   - curl http://192.168.0.113:8087/api/health

2. 啟動測試環境
   - mcp__playwright__browser_install
   - mcp__playwright__browser_navigate → 前端URL

3. 清理測試環境
   - 清空localStorage/sessionStorage
   - 重置瀏覽器狀態
```

**2️⃣ 功能測試執行:**
```bash
# 系統化測試執行
1. 執行基礎功能測試
   - 頁面載入測試
   - 導航功能測試
   - UI元素檢查

2. 執行用戶流程測試
   - 登入流程測試
   - 購物流程測試
   - 結帳流程測試

3. 執行整合測試
   - API連接測試
   - 數據同步測試
   - 錯誤處理測試
```

**3️⃣ 測試結果驗證:**
```bash
# 結果收集與分析
1. 截圖收集
   - mcp__playwright__browser_take_screenshot
   - 記錄各測試階段UI狀態

2. 日誌分析
   - mcp__playwright__browser_console_messages
   - 檢查JavaScript錯誤

3. 網路監控
   - mcp__playwright__browser_network_requests
   - 分析API調用狀態

4. 性能指標
   - 測量載入時間
   - 檢查記憶體使用
   - 評估用戶體驗
```

### 📊 **測試報告與追蹤**

**✅ 測試通過標準:**
- 所有API端點回應正常 (200狀態碼)
- UI功能完全可用 (無404錯誤)
- 用戶流程順暢完成 (無阻塞問題)
- 響應式設計正確適配 (各尺寸正常)
- 性能指標符合要求 (載入<2秒)

**⚠️ 問題追蹤格式:**
```
問題分類: [功能/性能/UI/API]
嚴重程度: [高/中/低]
問題描述: 具體問題說明
重現步驟: 詳細操作步驟
期望結果: 預期正常行為
實際結果: 實際觀察結果
解決方案: 修復建議
```

**📈 持續改進:**
- 定期更新測試案例
- 優化測試自動化腳本
- 監控性能趨勢變化
- 收集用戶反饋改進

### 🚀 **快速測試指令**

**💫 一鍵完整測試:**
```bash
# 完整前端測試流程 (推薦)
1. mcp__playwright__browser_install
2. mcp__playwright__browser_navigate → 前端URL
3. mcp__playwright__browser_click → 顧客登入
4. mcp__playwright__browser_click → 商品+按鈕
5. mcp__playwright__browser_click → 購物車
6. mcp__playwright__browser_click → 去結帳
7. mcp__playwright__browser_click → 付款方式
8. mcp__playwright__browser_click → 確認訂單
9. mcp__playwright__browser_take_screenshot → 記錄結果
10. mcp__playwright__browser_network_requests → 檢查API
```

**🎯 快速煙霧測試:**
```bash
# 基本功能驗證 (5分鐘)
1. 載入首頁 → 確認無錯誤
2. 測試登入 → 確認認證成功
3. 瀏覽菜單 → 確認資料載入
4. 添加商品 → 確認購物車更新
5. 檢查API → 確認連接正常
```