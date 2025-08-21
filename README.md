# Ranbow Restaurant Order Application

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/java/`
4. Commit after every completed task

## Project Description

使用者可以透過這個React單頁應用程式來進行點餐並且付款，管理員可使用本應用程式完成訂單並查看統計營收

## 🎯 現代化全端架構

### 系統架構概述
- **前端**: React 18 + TypeScript + Tailwind CSS 單頁應用程式
- **後端**: Spring Boot REST API 服務器
- **數據庫**: PostgreSQL 關聯式數據庫 + Redis 緩存
- **通訊**: RESTful API (JSON格式) + Axios HTTP客戶端
- **部署**: Vite構建 + Docker容器化

### 現代化架構流程
```
[React SPA客戶端] ←→ [Spring Boot API] ←→ [PostgreSQL + Redis]
  (TypeScript +              (後端)           (數據層 + 緩存)
   Tailwind CSS)
        ↑                      ↑
   [Vite開發服務器] ←──────────┘
     (HMR熱更新)
```

### 開發與部署
- **前端開發**: React開發服務器 `http://localhost:5173` (Vite)
- **後端API**: Spring Boot服務器 `http://192.168.0.113:8087/api`
- **生產部署**: 構建靜態資源到 `dist/` 資料夾並部署到Web服務器

## ⚛️ Modern Technical Stack 現代化技術棧

### 前端技術 (React生態系)
- **React 18**: 最新版本，支援Concurrent Features
- **TypeScript 5.0+**: 完整類型安全和開發體驗增強  
- **Tailwind CSS 3.3+**: 工具優先的CSS框架，自定義彩虹主題
- **Vite 4.4+**: 極速構建工具，HMR熱更新
- **Zustand**: 輕量級狀態管理，替代Redux
- **React Router DOM 6**: 現代化路由系統
- **React Hook Form + Zod**: 表單驗證和類型安全
- **Axios**: HTTP客戶端，請求攔截和錯誤處理
- **Lucide React**: 現代化圖標庫

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

## 🚀 快速開始開發

### React 前端開發
```bash
# 1. 進入React專案目錄
cd customer-ui-react/

# 2. 安裝依賴
npm install

# 3. 啟動開發服務器
npm run dev  # 訪問 http://localhost:5173

# 4. 開發工具指令
npm run lint      # ESLint檢查
npm run format    # Prettier格式化
npm run build     # 生產構建
npm run preview   # 預覽生產版本
```

### Spring Boot 後端開發
```bash
# 1. 編譯項目
mvn clean compile

# 2. 啟動後端API服務
mvn spring-boot:run  # API運行在 http://192.168.0.113:8087

# 3. 測試API健康檢查
curl http://192.168.0.113:8087/api/health
```

## 📁 現代化專案結構

### React 前端架構
```
customer-ui-react/
├── src/
│   ├── components/          # React組件架構
│   │   ├── ui/              # UI基礎組件 (Button, Card, Input...)
│   │   ├── layout/          # 佈局組件 (Header, Footer, Layout...)
│   │   └── business/        # 業務組件 (MenuItemCard, CartItem...)
│   ├── pages/               # 頁面組件
│   │   ├── auth/            # 認證相關頁面
│   │   ├── menu/            # 菜單相關頁面
│   │   ├── cart/            # 購物車頁面
│   │   ├── checkout/        # 結帳頁面
│   │   └── orders/          # 訂單管理頁面
│   ├── store/               # Zustand狀態管理
│   ├── services/            # API服務層
│   ├── lib/                 # 工具庫和驗證schemas
│   └── types/               # TypeScript類型定義
├── package.json             # NPM配置
├── vite.config.ts           # Vite構建配置
├── tailwind.config.js       # Tailwind CSS配置
└── tsconfig.json            # TypeScript配置
```

### Java 後端架構
```
src/main/java/com/ranbow/restaurant/
├── RestaurantApplication.java  # Spring Boot主應用類
├── models/                     # Data models/entities
├── dao/                        # Data Access Objects
├── services/                   # Service layer
└── api/                        # REST API Controllers
```

## 技術文檔

### 🏗️ 後端架構設計
- [後端架構技術文檔](BACKEND_ARCHITECTURE_DOCUMENTATION.md) - Spring Boot 架構設計、API 規範、資料庫設計和系統整合

### ⚛️ React前端架構
- 詳細的React前端架構請參考 [CLAUDE.md](CLAUDE.md) 文檔中的 **REACT FRONTEND 開發架構** 章節
- 包含組件設計、狀態管理、API整合、部署策略等完整指南

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