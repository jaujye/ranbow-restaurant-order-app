# CLAUDE.md - Ranbow Restaurant Order Application

> **Documentation Version**: 2.0  
> **Last Updated**: 2025-08-21  
> **Project**: Ranbow Restaurant Order Application  
> **Description**: 現代化餐廳點餐應用程式 - React.js + Spring Boot 全端解決方案  
> **Frontend**: React 18 + TypeScript + Tailwind CSS 響應式設計  
> **Backend**: Spring Boot + PostgreSQL + Redis 高效能API服務  
> **Features**: GitHub auto-backup, Task agents, Technical debt prevention, Modern web architecture

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
- **Payment Processing**: Testing
- **System Testing**: Testing
- **Documentation**: ✅ Updated & Current

## 🎯 **SYSTEM STABILITY & RECENT FIXES**



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
curl http://localhost:8081/api/health
```

### 🔧 **開發工作流程**

**🏠 本地開發階段:**
```bash
# 完整開發啟動流程
1. mvn clean compile          # 編譯源碼
2. mvn spring-boot:run        # 啟動Spring Boot服務器
3. 訪問 http://localhost:8081/api/health # 驗證服務器狀態

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
- **端口**: `8081`
- **基礎URL**: `http://localhost:8081/api`
- **健康檢查**: `http://localhost:8081/api/health`
- **數據庫**: PostgreSQL (192.168.0.114:5432)
- **緩存**: Redis (192.168.0.113:6379)

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

## ⚛️ REACT FRONTEND 開發架構

### 🎯 **React 前端開發狀態** 
- **架構設計**: ✅ 已完成 - React 18 + TypeScript + Tailwind CSS 現代化架構
- **核心功能**: ✅ 已完成 - 完整用戶流程、菜單管理、購物車、結帳系統
- **API整合**: ✅ 已完成 - Axios HTTP客戶端與Spring Boot API完全整合
- **響應式設計**: ✅ 已完成 - Mobile-first設計，支援所有設備尺寸
- **UI/UX設計**: ✅ 已完成 - 現代化彩虹主題，Tailwind CSS設計系統
- **狀態管理**: ✅ 已完成 - Zustand狀態管理，持久化存儲
- **表單驗證**: ✅ 已完成 - React Hook Form + Zod 類型安全驗證
- **路由系統**: ✅ 已完成 - React Router DOM 6 with懶加載
- **組件架構**: ✅ 已完成 - UI/Layout/Business 分層架構
- **開發工具**: ✅ 已完成 - Vite + ESLint + Prettier + TypeScript

### 📁 **React 專案結構**

```
customer-ui-react/
├── public/
│   ├── vite.svg                 # Vite圖標
│   └── index.html               # HTML模板
├── src/
│   ├── components/              # 組件架構
│   │   ├── ui/                  # UI基礎組件
│   │   │   ├── Button.tsx       # 按鈕組件
│   │   │   ├── Card.tsx         # 卡片組件
│   │   │   ├── Input.tsx        # 輸入框組件
│   │   │   ├── Modal.tsx        # 彈窗組件
│   │   │   └── Toast.tsx        # 通知組件
│   │   ├── layout/              # 佈局組件
│   │   │   ├── Header.tsx       # 頭部導航
│   │   │   ├── Footer.tsx       # 頁面底部
│   │   │   ├── Sidebar.tsx      # 側邊欄
│   │   │   └── Layout.tsx       # 主佈局
│   │   └── business/            # 業務組件
│   │       ├── MenuItemCard.tsx # 菜單項卡片
│   │       ├── CartItem.tsx     # 購物車項目
│   │       ├── OrderItem.tsx    # 訂單項目
│   │       └── PaymentMethodSelector.tsx # 付款方式選擇器
│   ├── pages/                   # 頁面組件
│   │   ├── auth/                # 認證相關頁面
│   │   │   ├── Login.tsx        # 登入頁面
│   │   │   └── Register.tsx     # 註冊頁面
│   │   ├── home/                # 首頁
│   │   │   └── Home.tsx         # 主頁面
│   │   ├── menu/                # 菜單相關
│   │   │   ├── Menu.tsx         # 菜單列表
│   │   │   └── MenuDetail.tsx   # 菜單詳情
│   │   ├── cart/                # 購物車
│   │   │   └── Cart.tsx         # 購物車頁面
│   │   ├── checkout/            # 結帳流程
│   │   │   └── Checkout.tsx     # 結帳頁面
│   │   ├── orders/              # 訂單管理
│   │   │   ├── OrderList.tsx    # 訂單列表
│   │   │   └── OrderDetail.tsx  # 訂單詳情
│   │   └── profile/             # 個人資料
│   │       └── Profile.tsx      # 個人資料頁面
│   ├── store/                   # Zustand 狀態管理
│   │   ├── authStore.ts         # 認證狀態
│   │   ├── cartStore.ts         # 購物車狀態
│   │   ├── menuStore.ts         # 菜單狀態
│   │   ├── orderStore.ts        # 訂單狀態
│   │   └── index.ts             # 狀態導出
│   ├── services/                # API服務層
│   │   ├── api.ts               # HTTP客戶端配置
│   │   ├── authApi.ts           # 認證API
│   │   ├── menuApi.ts           # 菜單API
│   │   ├── cartApi.ts           # 購物車API
│   │   └── orderApi.ts          # 訂單API
│   ├── lib/                     # 工具庫
│   │   ├── validations/         # 表單驗證schemas
│   │   │   ├── auth.ts          # 認證驗證
│   │   │   ├── orders.ts        # 訂單驗證
│   │   │   └── menu.ts          # 菜單驗證
│   │   └── utils.ts             # 工具函數
│   ├── hooks/                   # 自定義Hooks
│   │   ├── useFormValidation.ts # 表單驗證Hook
│   │   └── useApi.ts            # API呼叫Hook
│   ├── types/                   # TypeScript類型定義
│   │   ├── api.ts               # API類型
│   │   ├── auth.ts              # 認證類型
│   │   └── menu.ts              # 菜單類型
│   ├── styles/                  # 樣式配置
│   │   └── globals.css          # 全局樣式
│   ├── App.tsx                  # 主應用組件
│   ├── main.tsx                 # 應用入口點
│   └── vite-env.d.ts            # Vite環境類型
├── package.json                 # 專案配置
├── vite.config.ts               # Vite配置
├── tailwind.config.js           # Tailwind配置
├── tsconfig.json                # TypeScript配置
├── eslint.config.js             # ESLint配置
└── .prettierrc                  # Prettier配置
```

### 🔗 **React API 整合層**

**📡 HTTP 客戶端配置 (services/api.ts):**
```typescript
// Axios 攔截器設定，自動處理認證和錯誤
// 本地開發測試用 baseURL: http://localhost:8081/api
const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 請求攔截器：自動添加JWT Token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**✅ API 服務層實現:**
- **authApi.ts**: 用戶認證、註冊、登出API
- **menuApi.ts**: 菜單數據獲取、分類查詢API  
- **cartApi.ts**: 購物車同步、持久化API
- **orderApi.ts**: 訂單管理、狀態追蹤API

### 🏗️ **React 核心架構特性**

**⚛️ 現代化 React 開發棧:**
- **React 18**: 最新版本，支援Concurrent Features、自動批次更新
- **TypeScript 5.0+**: 完整類型安全，增強開發體驗和代碼質量
- **Tailwind CSS 3.3+**: 工具優先的CSS框架，自定義彩虹主題設計系統
- **Vite 4.4+**: 極速開發服務器，HMR熱更新，優化構建效能
- **React Router DOM 6**: 現代化路由系統，支援懶加載和嵌套路由

**🗃️ 狀態管理架構 (Zustand):**
```typescript
// 輕量級狀態管理，比Redux簡單但功能強大
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginData) => Promise<boolean>
  logout: () => void
}

// 持久化存儲配置
const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 狀態管理邏輯...
    }),
    { name: 'auth-storage' }
  )
)
```

**📋 表單驗證系統 (React Hook Form + Zod):**
```typescript
// 類型安全的表單驗證
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '請輸入密碼'),
  rememberMe: z.boolean().optional()
})

// 自定義驗證Hook
const useFormValidation = <T extends z.ZodSchema>(schema: T) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })
}
```

**🎨 UI 組件系統:**
- **UI基礎組件**: Button, Card, Input, Modal, Toast - 可重用的原子級組件
- **佈局組件**: Header, Footer, Sidebar, Layout - 頁面結構組件  
- **業務組件**: MenuItemCard, CartItem, OrderItem - 業務邏輯相關組件

**🔄 頁面路由系統:**
```typescript
// 懶加載路由配置，優化應用啟動效能
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'menu', element: lazy(() => import('./pages/menu/Menu')) },
      { path: 'cart', element: lazy(() => import('./pages/cart/Cart')) },
      // ... 其他路由
    ]
  }
])
```

### 🎨 **視覺設計系統**

**🌈 Tailwind CSS 彩虹主題:**
```javascript
// tailwind.config.js - 自定義彩虹主題色彩系統
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ff', 100: '#fdeeff', // 彩虹色調梯度
          500: '#a855f7', 600: '#9333ea', // 主要品牌色
        },
        accent: {
          50: '#fff7ed', // 溫暖的輔助色系
          500: '#f97316', 600: '#ea580c',
        }
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }
    }
  }
}
```

**📱 響應式設計策略:**
- **Mobile-First**: 從手機版開始設計，逐步增強桌面版體驗
- **Tailwind響應式斷點**: sm:, md:, lg:, xl: 精確控制不同設備佈局
- **Flexbox/Grid佈局**: 現代化佈局技術，完美適配各種螢幕尺寸

### 🔧 **開發工具鏈**

**📝 代碼質量工具:**
- **ESLint**: TypeScript規則，React Hooks檢查，無障礙性檢查
- **Prettier**: 統一代碼格式化，與ESLint整合
- **TypeScript嚴格模式**: noImplicitAny, strictNullChecks等嚴格檢查

**🚀 開發體驗:**
- **Vite HMR**: 毫秒級熱更新，極速開發回饋
- **TypeScript IntelliSense**: VS Code完整類型提示和自動補全
- **組件熱替換**: React組件狀態保持的熱更新

### 🧪 **React 開發與測試流程**

**🛠️ 開發工作流程:**

**1️⃣ 本地開發環境設置:**
```bash
# 進入React專案目錄
cd customer-ui-react/

# 安裝依賴
npm install

# 啟動開發服務器 (Vite)
npm run dev  # 運行在 http://localhost:3xxx

# 類型檢查
npm run type-check

# 代碼檢查和格式化
npm run lint
npm run format
```

**2️⃣ 組件開發最佳實踐:**
```typescript
// 組件開發範例：MenuItemCard.tsx
interface MenuItemCardProps {
  item: MenuItem
  variant?: 'default' | 'compact' | 'featured'
  onAddToCart?: (item: MenuItem, quantity: number) => void
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  variant = 'default',
  onAddToCart 
}) => {
  // Hook 使用
  const { addItem } = useCartActions()
  const { formatPrice } = useUtils()
  
  // 事件處理
  const handleAddToCart = useCallback(() => {
    addItem(item, 1)
    onAddToCart?.(item, 1)
  }, [item, onAddToCart, addItem])

  // JSX返回...
}
```

**3️⃣ 狀態管理測試:**
```typescript
// 使用Zustand測試狀態更新
const testCartStore = () => {
  const { items, addItem, removeItem, clearCart } = useCartStore()
  
  // 測試添加商品
  addItem(mockMenuItem, 2)
  expect(items.length).toBe(1)
  
  // 測試移除商品
  removeItem(items[0].id)
  expect(items.length).toBe(0)
}
```

**✅ React 測試覆蓋狀況:**

**🔧 組件測試 (React Testing Library):**
- [x] UI基礎組件渲染測試
- [x] 用戶交互事件測試
- [x] 條件渲染邏輯測試
- [x] Props傳遞驗證測試

**🏗️ 整合測試:**
- [x] API服務層連接測試
- [x] 狀態管理流程測試  
- [x] 路由導航功能測試
- [x] 表單驗證邏輯測試

**📱 端到端測試 (E2E):**
- [x] 完整用戶購物流程
- [x] 響應式設計適配測試
- [x] 跨瀏覽器兼容性測試
- [x] 性能和載入速度測試

### 🚀 **React 部署策略**

**📍 本地開發環境:**
```bash
# 開發模式
npm run dev           # Vite開發服務器 - http://localhost:5173
npm run preview       # 預覽生產構建

# 構建優化
npm run build         # 生產構建到 dist/
npm run build:analyze # 分析包大小
```

**🌐 生產環境部署:**
```bash
# 構建優化的生產版本
npm run build

# 部署到靜態服務器
# dist/ 資料夾包含所有優化後的靜態檔案：
# - index.html (SPA入口)
# - assets/js/ (分塊載入的JS檔案)
# - assets/css/ (優化後的CSS)
# - 圖片和其他靜態資源
```

**⚡ Vite 建構優化:**
- **代碼分割**: 動態import，按需載入頁面組件
- **Tree Shaking**: 自動移除未使用的代碼
- **資源優化**: 圖片壓縮、CSS最小化、JS壓縮
- **緩存策略**: 檔案名包含hash，優化瀏覽器緩存

**🔄 CI/CD 部署工作流:**
```yaml
# GitHub Actions 範例
- name: Build React App
  run: |
    cd customer-ui-react
    npm ci
    npm run build
    
- name: Deploy to Production
  run: |
    # 部署 dist/ 到 web服務器
    rsync -av dist/ user@server:/var/www/html/
```

### 📊 **性能優化指標**

**⚡ React 應用效能:**
- **首屏渲染時間**: < 1.5秒 (FCP - First Contentful Paint)
- **可互動時間**: < 2.5秒 (TTI - Time to Interactive)  
- **累積佈局偏移**: < 0.1 (CLS - Cumulative Layout Shift)
- **最大內容繪製**: < 2秒 (LCP - Largest Contentful Paint)

**📦 包大小優化:**
- **主包大小**: < 200KB (gzipped)
- **懒加載頁面**: 平均 < 50KB per route
- **依賴包優化**: 使用Bundle Analyzer分析和優化
- **圖片優化**: WebP格式，響應式圖片加載

**🔄 運行時性能:**
- **React組件重新渲染**: 使用React.memo和useMemo優化
- **狀態更新效率**: Zustand比Redux更輕量，更少樣板代碼
- **API請求優化**: Axios攔截器，自動重試，請求合併

## 🚀 **React 前端開發指南總結**

### 🎯 **快速啟動 React 開發環境**

```bash
# 1️⃣ 進入React專案並啟動開發
cd customer-ui-react/
npm install
npm run dev  # → http://localhost:3xxx

# 2️⃣ 並行啟動後端API服務
# 新終端窗口
cd ../
mvn spring-boot:run  # → http://localhost:8081

# 3️⃣ 開發工具
npm run lint      # ESLint檢查
npm run format    # Prettier格式化
npm run build     # 生產構建
```

### 📝 **React 開發最佳實踐摘要**

**🔧 組件開發規範:**
- 使用TypeScript進行類型定義
- 遵循React Hooks最佳實踐
- UI/Layout/Business組件分離
- Props接口明確定義

**🗃️ 狀態管理:**
- Zustand替代Redux，更輕量
- 持久化存儲重要狀態
- API狀態與UI狀態分離

**🎨 樣式架構:**
- Tailwind CSS工具優先
- 響應式Mobile-first設計
- 彩虹主題統一色彩系統

**⚡ 性能優化:**
- Vite極速開發體驗
- 懶加載路由組件
- React.memo防止不必要渲染
- 打包分析和Tree Shaking

---

**🎉 React前端已完整重構完成！現代化技術棧提供優秀的開發體驗和用戶體驗。**