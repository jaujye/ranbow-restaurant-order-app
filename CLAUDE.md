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

### 🚀 開發模式

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

### 📡 **API服務器資訊**

**🏠 本地開發環境:**
- **主類**: `com.ranbow.restaurant.RestaurantApplication`
- **端口**: `8081`
- **基礎URL**: `http://localhost:8081/api`
- **健康檢查**: `http://localhost:8081/api/health`
- **數據庫**: PostgreSQL (192.168.0.114:5432)
- **緩存**: Redis (192.168.0.113:6379)


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

## ⚛️ REACT FRONTEND 本地開發環境APP測試

### 顧客UI - 本地開發環境設置:
```bash
# 進入React專案目錄
cd customer-ui-react/
npm install

# 啟動開發服務器 (Vite)
npm run dev  # 運行在 http://localhost:3xxx

# 類型檢查
npm run type-check

# 代碼檢查和格式化
npm run lint
npm run format
```


### 員工UI - 本地開發環境設置:

```bash
# 1. 安裝依賴
cd staff-ui-react/
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 訪問應用
# 打開瀏覽器訪問 http://localhost:3xxx
```

## 🎭 PLAYWRIGHT 前端測試與除錯工作方法

### 📱 **基本操作指令:**
```bash
# 導航到URL
mcp__playwright__browser_navigate --url "http://localhost:3000"

# 截圖
mcp__playwright__browser_take_screenshot --filename "test-screenshot.png"

# 獲取頁面快照（包含所有元素）
mcp__playwright__browser_snapshot

# 點擊元素
mcp__playwright__browser_click --element "登入按鈕" --ref "button[data-testid='login']"

# 填寫表單
mcp__playwright__browser_type --element "用戶名輸入框" --ref "input[name='username']" --text "testuser"

# 等待元素出現
mcp__playwright__browser_wait_for --text "載入完成"
```

### 🔍 **除錯工作流:**
```bash
# 1. 檢查網路請求
mcp__playwright__browser_network_requests

# 2. 查看控制台訊息
mcp__playwright__browser_console_messages

# 3. 執行JavaScript
mcp__playwright__browser_evaluate --function "() => document.querySelector('.cart-total').innerText"

# 4. 填寫完整表單
mcp__playwright__browser_fill_form --fields [
  {"name": "email", "type": "textbox", "ref": "input[type='email']", "value": "test@example.com"},
  {"name": "password", "type": "textbox", "ref": "input[type='password']", "value": "password123"}
]
```

### ⚡ **常用測試場景:**
```bash
# 測試登入流程
1. mcp__playwright__browser_navigate --url "http://localhost:3000/login"
2. mcp__playwright__browser_fill_form --fields [...]
3. mcp__playwright__browser_click --element "登入" --ref "button[type='submit']"
4. mcp__playwright__browser_wait_for --text "歡迎"

# 測試購物車
1. mcp__playwright__browser_click --element "添加到購物車" --ref ".add-to-cart"
2. mcp__playwright__browser_navigate --url "/cart"
3. mcp__playwright__browser_snapshot  # 檢查購物車內容

# 測試響應式設計
1. mcp__playwright__browser_resize --width 375 --height 667  # iPhone尺寸
2. mcp__playwright__browser_take_screenshot --filename "mobile-view.png"
```