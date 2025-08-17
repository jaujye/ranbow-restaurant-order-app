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
- **前端**: Apache Cordova 混合式行動應用程式
- **後端**: Spring Boot REST API 服務器
- **數據庫**: PostgreSQL 關聯式數據庫
- **通訊**: RESTful API (JSON格式)

### 系統架構流程
```
[手機應用程式] ←→ [Spring Boot API] ←→ [PostgreSQL 數據庫]
     (前端)              (後端)              (數據層)
```

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

## UI設計文檔

詳細的前端UI設計規範請參考：[前端UI設計.md](前端UI設計.md)

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