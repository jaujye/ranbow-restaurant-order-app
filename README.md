# Ranbow Restaurant Order Application

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/java/`
4. Commit after every completed task

## Project Description

使用者可以透過這個手機應用程式來進行點餐並且付款，管理員可使用本應用程式完成訂單並查看統計營收

## 前後端架構說明

### 架構概述
- **行動端**: Apache Cordova 混合式行動應用程式
- **Web端**: 響應式網頁應用程式 (同一套後端API)
- **後端**: Spring Boot REST API 服務器
- **數據庫**: PostgreSQL 關聯式數據庫
- **通訊**: RESTful API (JSON格式)

### 系統架構流程
```
[手機應用程式] ←→ [Spring Boot API] ←→ [PostgreSQL 數據庫]
     (Cordova)              (後端)              (數據層)
        ↑                    ↑
[Web瀏覽器應用] ←────────────┘
   (響應式網頁)
```

### 使用方式
- **行動端**: 透過 Cordova 打包的原生應用程式
- **Web端**: 直接使用瀏覽器訪問 `http://localhost:8080` (開發環境)
- **管理端**: Web版提供完整的管理員功能介面

## Technical Stack 技術棧

### 前端技術
- **Apache Cordova**: 跨平台行動應用程式框架
- **HTML5/CSS3/JavaScript**: 前端核心技術
- **Bootstrap**: 響應式UI框架
- **jQuery**: JavaScript函式庫

### 後端技術
- **Spring Boot**: Java企業級應用框架
- **Spring Data JPA**: 數據存取層
- **Maven**: 專案建構工具
- **RESTful API**: API設計標準

### 數據庫
- **PostgreSQL**: 主要數據庫
- **Redis**: 快取系統 (可選)

### 開發工具
- **Git**: 版本控制
- **GitHub**: 代碼托管與自動備份
- **Claude Code**: AI開發助手

## 技術文檔

### 🏗️ 後端架構設計
- [後端架構技術文檔](BACKEND_ARCHITECTURE_DOCUMENTATION.md) - Spring Boot 架構設計、API 規範、資料庫設計和系統整合

## UI設計文檔

詳細的前端UI設計規範請參考以下文檔：

### 📱 客戶端UI設計
- [客戶界面設計](CUSTOMER_UI_SCREENS.md) - 顧客點餐和付款流程
- [行動端UI設計規範](MOBILE_UI_DESIGN.md) - 手機應用程式UI設計標準

### 👥 管理端UI設計  
- [管理員界面設計](ADMIN_UI_SCREENS.md) - 系統管理和營收統計
- [員工界面設計](STAFF_UI_SCREENS.md) - 廚房和服務人員操作介面

## Standard Project Structure

This project follows Java enterprise conventions with modular organization:

```
src/main/java/com/ranbow/restaurant/
├── core/      # Core business logic
├── utils/     # Utility functions/classes
├── models/    # Data models/entities
├── services/  # Service layer
└── api/       # API endpoints/interfaces
```

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Java conventions** - follows Maven/Gradle standards
- **Scalable** - enterprise-ready structure

## 🐳 Docker 部署方式

### 快速啟動 (Docker Compose)

```bash
# 1. 啟動完整應用程式堆疊
docker-compose up -d

# 2. 檢查服務狀態
docker-compose ps

# 3. 查看應用程式日誌
docker-compose logs app

# 4. 停止服務
docker-compose down
```

### 單獨容器部署

```bash
# 1. 建構應用程式映像
docker build -t ranbow-restaurant-app .

# 2. 啟動 PostgreSQL 數據庫
docker run -d --name postgres-db \
  -e POSTGRES_DB=restaurant_db \
  -e POSTGRES_USER=restaurant_user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:15

# 3. 啟動應用程式
docker run -d --name restaurant-app \
  --link postgres-db:database \
  -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://database:5432/restaurant_db \
  ranbow-restaurant-app
```

### 生產環境部署

```bash
# 使用 Docker Compose 生產配置
docker-compose -f docker-compose.prod.yml up -d

# 或使用 Kubernetes
kubectl apply -f k8s/
```

### 容器配置

- **應用程式端口**: 8080
- **數據庫端口**: 5432  
- **Redis端口**: 6379 (可選)
- **健康檢查**: `http://localhost:8080/api/health`