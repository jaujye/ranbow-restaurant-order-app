# 員工UI前端測試指南 - Ranbow Restaurant Staff System

## 📋 專案概述

### 專案資訊
- **專案名稱**: Ranbow Restaurant Staff UI
- **版本**: 2.0.0
- **技術棧**: React 18 + TypeScript + Tailwind CSS + Vite
- **狀態管理**: Zustand + React Query
- **即時通訊**: WebSocket (Socket.io)
- **測試框架**: Vitest + React Testing Library

### 系統架構
```
staff-ui-react/
├── src/
│   ├── app/                # 應用程式核心配置
│   ├── config/             # 環境配置管理
│   ├── features/           # 功能模組
│   │   ├── auth/          # 認證系統
│   │   ├── dashboard/     # 儀表板
│   │   ├── kitchen/       # 廚房管理
│   │   ├── orders/        # 訂單管理
│   │   ├── statistics/    # 統計分析
│   │   └── notifications/ # 通知系統
│   ├── shared/            # 共享元件
│   └── styles/            # 全域樣式
├── .env.development       # 開發環境變數
├── .env.production        # 生產環境變數
└── .env.test             # 測試環境變數
```

## 🚀 環境配置與部署

### 環境變數管理

#### 1. 環境配置檔案結構
系統使用三個環境配置檔案：
- `.env.development` - 本地開發環境
- `.env.production` - 生產環境部署
- `.env.test` - 測試環境

#### 2. 主要環境變數說明

| 變數名稱 | 開發環境 | 生產環境 | 說明 |
|---------|---------|---------|------|
| `VITE_API_BASE_URL` | `http://localhost:8081/api` | `http://192.168.0.113:8087/api` | API伺服器地址 |
| `VITE_WS_BASE_URL` | `ws://localhost:8081/ws` | `ws://192.168.0.113:8087/ws` | WebSocket連接地址 |
| `VITE_ENVIRONMENT` | `development` | `production` | 環境標識 |
| `VITE_DEBUG_MODE` | `true` | `false` | 除錯模式 |
| `VITE_ENABLE_DEVTOOLS` | `true` | `false` | 開發工具啟用 |

### 環境切換方式

#### 方法一：使用npm腳本（推薦）

```bash
# 開發環境（自動使用 .env.development）
npm run dev

# 生產環境構建（自動使用 .env.production）
npm run build

# 測試環境（自動使用 .env.test）
npm run test
```

#### 方法二：手動指定環境檔案

```bash
# 使用特定環境檔案進行開發
npx vite --mode development

# 使用生產環境配置進行本地測試
npx vite --mode production

# 構建特定環境版本
npx vite build --mode production
```

#### 方法三：環境變數覆蓋

```bash
# Windows PowerShell
$env:VITE_API_BASE_URL="http://192.168.0.113:8087/api"
npm run dev

# Windows CMD
set VITE_API_BASE_URL=http://192.168.0.113:8087/api && npm run dev

# Linux/Mac
VITE_API_BASE_URL=http://192.168.0.113:8087/api npm run dev
```

### 部署流程

#### 本地開發部署

```bash
# 1. 安裝依賴
cd staff-ui-react
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 訪問應用
# 打開瀏覽器訪問 http://localhost:5173
```

#### 生產環境部署

```bash
# 1. 構建生產版本
npm run build

# 2. 檢視構建結果
# 構建檔案會生成在 dist/ 目錄下

# 3. 本地預覽生產版本
npm run preview

# 4. 部署到伺服器
# 將 dist/ 目錄內容部署到Web伺服器
# 例如：nginx、apache、IIS等
```

#### Docker部署（可選）

```dockerfile
# Dockerfile 範例
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 測試指南

### 單元測試

```bash
# 執行所有測試
npm run test

# 執行測試並顯示UI
npm run test:ui

# 執行測試一次（CI/CD用）
npm run test:run

# 測試特定檔案
npm run test -- OrderCard.test.tsx

# 測試覆蓋率報告
npm run test -- --coverage
```

### 功能測試清單

#### 1. 認證系統測試
- [ ] 登入功能
  - [ ] 有效憑證登入成功
  - [ ] 無效憑證顯示錯誤
  - [ ] 記住登入狀態
  - [ ] 自動登出（閒置超時）
- [ ] 權限驗證
  - [ ] 路由保護
  - [ ] 功能權限控制

#### 2. 訂單管理測試
- [ ] 訂單列表
  - [ ] 即時更新（WebSocket）
  - [ ] 狀態篩選
  - [ ] 搜尋功能
  - [ ] 分頁載入
- [ ] 訂單操作
  - [ ] 接受訂單
  - [ ] 準備訂單
  - [ ] 完成訂單
  - [ ] 取消訂單

#### 3. 廚房管理測試
- [ ] 廚房隊列
  - [ ] 訂單優先級排序
  - [ ] 計時器功能
  - [ ] 工作站分配
- [ ] 廚房顯示器
  - [ ] 大屏模式
  - [ ] 自動刷新
  - [ ] 聲音提醒

#### 4. 統計分析測試
- [ ] 實時統計
  - [ ] 今日營收
  - [ ] 訂單數量
  - [ ] 平均處理時間
- [ ] 報表生成
  - [ ] 日報表
  - [ ] 週報表
  - [ ] 月報表

### 整合測試

```bash
# 測試API連接
# 1. 確保後端服務運行在配置的地址
# 2. 執行整合測試腳本

# 開發環境測試
curl http://localhost:8081/api/health

# 生產環境測試
curl http://192.168.0.113:8087/api/health
```

### E2E測試流程

#### 測試場景一：完整訂單處理流程

1. **登入系統**
   - 使用測試帳號登入
   - 驗證導向儀表板

2. **接收新訂單**
   - 檢查WebSocket連接
   - 驗證訂單通知
   - 確認訂單顯示在列表

3. **處理訂單**
   - 接受訂單
   - 更改狀態為準備中
   - 完成訂單
   - 驗證狀態更新

4. **查看統計**
   - 檢查訂單計數更新
   - 驗證營收統計

#### 測試場景二：多裝置同步測試

1. **開啟多個瀏覽器視窗**
   - 模擬多個員工同時操作

2. **執行並發操作**
   - 同時更新訂單狀態
   - 驗證衝突處理

3. **檢查數據一致性**
   - 確認所有視窗顯示一致
   - 驗證數據庫狀態正確

## 📱 響應式測試

### 裝置測試清單

| 裝置類型 | 解析度 | 測試重點 |
|---------|--------|---------|
| 手機 | 375x667 | 觸控操作、垂直滾動 |
| 平板 | 768x1024 | 橫豎屏切換、手勢操作 |
| 桌面 | 1920x1080 | 鍵盤快捷鍵、滑鼠互動 |
| 大屏 | 2560x1440 | 廚房顯示器模式 |

### 瀏覽器相容性

- [x] Chrome (90+)
- [x] Firefox (88+)
- [x] Safari (14+)
- [x] Edge (90+)
- [ ] Opera
- [ ] Mobile Safari
- [ ] Chrome Mobile

## 🐛 常見問題與解決方案

### 1. API連接失敗

**問題描述**: 無法連接到後端API伺服器

**解決方案**:
```bash
# 檢查環境變數配置
cat .env.development | grep API_BASE_URL

# 確認後端服務運行
curl http://localhost:8081/api/health

# 檢查網路連接
ping 192.168.0.113
```

### 2. WebSocket斷線重連

**問題描述**: WebSocket連接經常斷開

**解決方案**:
- 檢查 `VITE_WS_RECONNECT_INTERVAL` 設定
- 確認防火牆設定允許WebSocket連接
- 檢查後端WebSocket服務狀態

### 3. 環境變數未生效

**問題描述**: 修改環境變數後未生效

**解決方案**:
```bash
# 清除快取並重新啟動
rm -rf node_modules/.vite
npm run dev

# 確認環境變數載入
# 在 src/config/env.config.ts 中啟用 DEBUG_MODE
```

### 4. 構建失敗

**問題描述**: 執行 npm run build 失敗

**解決方案**:
```bash
# 清理並重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 檢查TypeScript錯誤
npm run type-check

# 檢查ESLint錯誤
npm run lint
```

## 🔍 效能測試

### Lighthouse測試指標

目標分數：
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### 關鍵效能指標 (KPI)

| 指標 | 目標值 | 實測值 |
|-----|--------|--------|
| First Contentful Paint (FCP) | < 1.5s | - |
| Largest Contentful Paint (LCP) | < 2.5s | - |
| Time to Interactive (TTI) | < 3.5s | - |
| Cumulative Layout Shift (CLS) | < 0.1 | - |
| First Input Delay (FID) | < 100ms | - |

### 負載測試

```bash
# 使用 Apache Bench 進行負載測試
ab -n 1000 -c 10 http://localhost:5173/

# 使用 Artillery 進行場景測試
artillery quick --count 50 --num 10 http://localhost:5173/
```

## 📊 監控與日誌

### 前端錯誤監控

```javascript
// 錯誤邊界配置 (已整合在應用中)
// src/app/App.tsx 使用 ErrorBoundary 包裹

// 查看控制台日誌
// 開發環境會顯示詳細錯誤信息
// 生產環境僅記錄關鍵錯誤
```

### 效能監控

```javascript
// 使用 React DevTools Profiler
// 1. 安裝 React Developer Tools 擴充功能
// 2. 開啟 Profiler 標籤
// 3. 記錄操作並分析效能瓶頸
```

### 網路請求監控

```javascript
// 所有API請求都會在開發工具的Network標籤中顯示
// 可以查看：
// - 請求時間
// - 回應狀態
// - 資料負載
// - WebSocket訊息
```

## 🚦 發布檢查清單

### 發布前檢查

- [ ] 所有測試通過 (`npm run test:run`)
- [ ] TypeScript 無錯誤 (`npm run type-check`)
- [ ] ESLint 無警告 (`npm run lint`)
- [ ] 構建成功 (`npm run build`)
- [ ] 環境變數配置正確
- [ ] API連接測試通過
- [ ] WebSocket功能正常
- [ ] 響應式設計測試完成
- [ ] 瀏覽器相容性測試完成
- [ ] 效能指標達標

### 發布後驗證

- [ ] 生產環境訪問正常
- [ ] 登入功能正常
- [ ] 訂單即時更新正常
- [ ] 統計數據正確
- [ ] 無控制台錯誤
- [ ] 監控系統正常

## 📝 測試報告模板

```markdown
## 測試報告 - [日期]

### 測試環境
- 環境：[開發/測試/生產]
- 版本：v2.0.0
- 測試人員：[姓名]

### 測試結果摘要
- 通過測試：[數量]
- 失敗測試：[數量]
- 跳過測試：[數量]

### 詳細測試結果
[測試項目列表及結果]

### 發現的問題
[問題描述及優先級]

### 建議與改進
[改進建議]
```

---

**最後更新時間**: 2025-01-25  
**維護團隊**: Ranbow Restaurant Development Team