# CLAUDE.md - Ranbow Restaurant Order Application

> **Documentation Version**: 1.0  
> **Last Updated**: 2025-08-14  
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
- **Core Features**: 🔄 In Development
- **Testing**: ⏳ Pending
- **Documentation**: ⏳ Pending

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

### 🚀 MAVEN SPRING BOOT 啟動命令

**推薦使用Maven啟動Spring Boot伺服器:**

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

```bash
# 完整開發啟動流程
1. mvn clean compile          # 編譯源碼
2. mvn spring-boot:run        # 啟動Spring Boot服務器
3. 訪問 http://localhost:8080/api/health # 驗證服務器狀態

# 測試相關指令
mvn test                      # 運行測試
mvn clean package -DskipTests # 打包（跳過測試）
```

### 📡 **API服務器資訊**

- **主類**: `com.ranbow.restaurant.RestaurantApplication`
- **端口**: `8080`
- **基礎URL**: `http://localhost:8080/api`
- **健康檢查**: `http://localhost:8080/api/health`
- **數據庫**: PostgreSQL (自動配置)

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