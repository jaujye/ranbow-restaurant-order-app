# 員工UI系統測試執行指南

**文檔版本**: v1.0  
**更新日期**: 2025-08-23  
**適用系統**: 彩虹餐廳員工管理系統  
**測試環境**: 本地開發環境

---

## 🚀 快速開始

### 測試前檢查清單
- [ ] Node.js 已安裝 (v18+)
- [ ] Java 已安裝 (JDK 17+)
- [ ] PostgreSQL 已運行 (port 5432)
- [ ] Redis 已運行 (port 6379)
- [ ] Git 已安裝並配置

---

## 📋 環境準備

### 1. 克隆專案
```bash
git clone https://github.com/your-org/ranbow-restaurant-order-app.git
cd ranbow-restaurant-order-app
```

### 2. 安裝前端依賴
```bash
cd staff-ui-react
npm install
```

### 3. 安裝後端依賴
```bash
cd ..
mvn clean install
```

### 4. 配置環境變數
```bash
# 前端環境變數 (staff-ui-react/.env)
VITE_API_URL=http://localhost:8081/api
VITE_WS_URL=ws://localhost:8081/ws

# 後端環境變數 (src/main/resources/application.yml)
spring:
  datasource:
    url: jdbc:postgresql://192.168.0.114:5432/ranbow_restaurant
  redis:
    host: 192.168.0.113
```

---

## 🎯 啟動測試環境

### 步驟 1: 啟動後端服務
```bash
# 在專案根目錄執行
mvn spring-boot:run

# 驗證後端啟動成功
curl http://localhost:8081/api/health
# 預期回應: {"status":"UP","database":"Connected"}
```

### 步驟 2: 啟動前端應用
```bash
# 新開終端視窗
cd staff-ui-react
npm run dev

# 前端將運行在 http://localhost:3003
```

### 步驟 3: 確認系統狀態
- 🌐 瀏覽器訪問: http://localhost:3003
- ✅ 確認登入頁面正常顯示
- ✅ 確認控制台無錯誤

---

## 🧪 測試執行步驟

### 測試案例 1: 員工登入測試

#### 測試步驟
1. 開啟瀏覽器，訪問 http://localhost:3003
2. 在登入頁面輸入測試帳號
3. 點擊「登入」按鈕
4. 驗證成功跳轉至主頁面

#### 測試資料
```json
{
  "員工編號": "ADMIN001",
  "密碼": "Password123"
}
```

#### 預期結果
- ✅ 顯示歡迎訊息
- ✅ 導航至儀表板頁面
- ✅ 顯示員工姓名和角色

---

### 測試案例 2: 訂單管理測試

#### 測試步驟
1. 登入系統後，點擊「訂單管理」
2. 查看訂單列表
3. 點擊任一訂單查看詳情
4. 更新訂單狀態

#### 驗證點
- [ ] 訂單列表正確顯示
- [ ] 可以篩選訂單狀態
- [ ] 訂單詳情包含所有項目
- [ ] 狀態更新即時反映

---

### 測試案例 3: 菜單管理測試

#### 測試步驟
1. 導航至「菜單管理」頁面
2. 檢查菜單項目顯示
3. 測試分類篩選功能
4. 更新菜品可用狀態

#### 驗證點
- [ ] 顯示11個菜單項目
- [ ] 分類篩選正常工作
- [ ] 價格顯示正確
- [ ] 狀態切換成功

---

## 🔍 測試工具使用

### Chrome DevTools 網路監控
```
1. 按 F12 開啟開發者工具
2. 切換到 Network 標籤
3. 執行操作並觀察 API 請求
4. 檢查響應狀態碼和時間
```

### React DevTools 狀態檢查
```
1. 安裝 React Developer Tools 擴充功能
2. 開啟 Components 標籤
3. 檢查組件 props 和 state
4. 驗證狀態更新
```

### 控制台日誌監控
```javascript
// 查看所有日誌
console.log

// 篩選錯誤
console.error

// 查看警告
console.warn
```

---

## 📱 響應式測試

### 裝置模擬測試
1. **手機測試** (375×667)
   - Chrome DevTools → Toggle device toolbar
   - 選擇 iPhone SE
   - 驗證佈局適配

2. **平板測試** (768×1024)
   - 選擇 iPad
   - 檢查雙欄佈局

3. **桌面測試** (1920×1080)
   - 返回桌面模式
   - 驗證全螢幕體驗

---

## ⚡ 性能測試

### Lighthouse 測試
```
1. Chrome DevTools → Lighthouse
2. 選擇測試類別：
   - Performance
   - Accessibility
   - Best Practices
   - SEO
3. 點擊 "Generate report"
4. 查看分數和建議
```

### 網路限速測試
```
1. Network 標籤 → Throttling
2. 選擇 "Slow 3G"
3. 重新載入頁面
4. 驗證載入體驗
```

---

## 🐛 常見問題排除

### 問題 1: 後端無法啟動
```bash
# 檢查端口占用
netstat -ano | findstr :8081

# 檢查資料庫連接
psql -h 192.168.0.114 -U postgres -d ranbow_restaurant

# 查看詳細錯誤
mvn spring-boot:run -X
```

### 問題 2: 前端編譯錯誤
```bash
# 清除快取重新安裝
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 檢查 TypeScript 錯誤
npm run type-check
```

### 問題 3: API 請求失敗
```javascript
// 檢查 CORS 設定
// 確認 API URL 正確
console.log(import.meta.env.VITE_API_URL)

// 測試 API 連接
fetch('http://localhost:8081/api/health')
  .then(res => res.json())
  .then(console.log)
```

---

## 📊 測試報告產生

### 自動化測試報告
```bash
# 執行測試並產生報告
npm test -- --coverage

# 查看覆蓋率報告
open coverage/lcov-report/index.html
```

### 手動測試記錄
使用以下模板記錄測試結果：

```markdown
## 測試執行記錄

**日期**: 2025-08-23
**測試人員**: [姓名]
**環境**: 本地開發

### 測試結果
- [ ] 登入功能 - 通過/失敗
- [ ] 訂單管理 - 通過/失敗
- [ ] 菜單管理 - 通過/失敗
- [ ] 響應式設計 - 通過/失敗

### 發現問題
1. [問題描述]
2. [問題描述]

### 備註
[其他觀察]
```

---

## ✅ 測試完成檢查

### 測試後清理
```bash
# 停止前端服務
Ctrl + C (在 npm run dev 終端)

# 停止後端服務
Ctrl + C (在 mvn spring-boot:run 終端)

# 提交測試結果
git add .
git commit -m "test: 完成員工UI系統測試"
git push origin main
```

### 測試通過標準
- ✅ 所有核心功能正常
- ✅ 無控制台錯誤
- ✅ API 響應時間 < 500ms
- ✅ 響應式設計正常
- ✅ 性能分數 > 80

---

## 📚 相關資源

### 內部文檔
- [系統架構說明](./ARCHITECTURE.md)
- [API 文檔](./API_DOCUMENTATION.md)
- [測試報告](./STAFF_UI_TEST_REPORT.md)

### 外部資源
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

---

## 🆘 支援聯絡

遇到問題時請聯絡：
- **技術支援**: tech-support@ranbow.restaurant
- **測試團隊**: qa-team@ranbow.restaurant
- **專案管理**: pm@ranbow.restaurant

---

*本指南由 Claude Code 團隊編寫*  
*最後更新: 2025-08-23*