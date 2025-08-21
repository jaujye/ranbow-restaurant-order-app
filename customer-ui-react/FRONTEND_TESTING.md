# React 前端測試文檔

## 🎯 測試環境設置

### 🔧 快速啟動開發環境

```bash
# 進入React專案目錄
cd customer-ui-react/

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
# 預設運行在 http://localhost:5173
```

### 🌐 可切換的後端API位址配置

#### 📍 API位址選項

| 環境 | API基礎位址 | 描述 |
|------|-------------|------|
| 本地開發 | `http://localhost:8080/api` | Spring Boot本地開發服務器 |
| Ubuntu Server | `http://192.168.0.113:8087/api` | 生產環境Ubuntu部署 |
| 測試服務器 | `http://localhost:8087/api` | 本地測試環境 |

#### ⚙️ 動態切換API位址

在瀏覽器開發者工具Console中執行以下指令來切換API基礎位址：

```javascript
// 切換到本地開發環境
localStorage.setItem('API_BASE_URL', 'http://localhost:8080/api')
window.location.reload()

// 切換到Ubuntu Server生產環境
localStorage.setItem('API_BASE_URL', 'http://192.168.0.113:8087/api')
window.location.reload()

// 切換到本地測試環境
localStorage.setItem('API_BASE_URL', 'http://localhost:8087/api')
window.location.reload()

// 查看當前API位址
console.log('當前API位址:', localStorage.getItem('API_BASE_URL') || '預設API位址')

// 重置為預設位址
localStorage.removeItem('API_BASE_URL')
window.location.reload()
```

## 🧪 API連接測試

### 🔍 基本連接測試

在瀏覽器Console中執行以下測試：

```javascript
// 1. 測試API基礎連接
fetch(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/health`)
  .then(response => response.json())
  .then(data => console.log('API健康檢查:', data))
  .catch(error => console.error('API連接失敗:', error))

// 2. 測試菜單API
fetch(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/menu`)
  .then(response => response.json())
  .then(data => console.log('菜單數據:', data))
  .catch(error => console.error('菜單API失敗:', error))

// 3. 測試用戶註冊API（模擬數據）
fetch(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/auth/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '測試用戶',
    email: 'test@example.com',
    phone: '0900000000',
    password: 'password123'
  })
})
  .then(response => response.json())
  .then(data => console.log('註冊測試:', data))
  .catch(error => console.error('註冊API失敗:', error))
```

### 🔐 認證測試

```javascript
// 登入測試
async function testLogin() {
  try {
    const response = await fetch(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('登入成功:', data)
      localStorage.setItem('authToken', data.token)
    } else {
      console.error('登入失敗:', data)
    }
  } catch (error) {
    console.error('登入API錯誤:', error)
  }
}

// 執行登入測試
testLogin()

// 測試需要認證的API
async function testAuthenticatedAPI() {
  const token = localStorage.getItem('authToken')
  
  if (!token) {
    console.error('請先登入取得Token')
    return
  }
  
  try {
    const response = await fetch(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('用戶資料:', data)
  } catch (error) {
    console.error('認證API失敗:', error)
  }
}
```

## 🎨 UI測試指南

### 📱 頁面功能測試

#### 1️⃣ 認證頁面測試

**註冊頁面 (`/register`)：**
- [ ] 表單驗證正常運作
- [ ] 提交後顯示載入狀態
- [ ] 成功註冊後跳轉到登入頁面
- [ ] 錯誤訊息正確顯示

**登入頁面 (`/login`)：**
- [ ] 帳號密碼驗證功能
- [ ] 錯誤提示對話框顯示（不是頁面刷新）
- [ ] 成功登入後跳轉到首頁
- [ ] 記住我功能正常

#### 2️⃣ 主要功能測試

**首頁 (`/`)：**
- [ ] 頁面載入速度
- [ ] 響應式設計適配
- [ ] 導航功能正常

**菜單頁面 (`/menu`)：**
- [ ] 菜單項目正確顯示
- [ ] 分類篩選功能
- [ ] 加入購物車功能
- [ ] 菜單詳情頁面跳轉

**購物車頁面 (`/cart`)：**
- [ ] 購物車項目顯示
- [ ] 數量修改功能
- [ ] 項目刪除功能
- [ ] 總價計算正確

**訂單頁面 (`/orders`)：**
- [ ] 訂單歷史顯示
- [ ] 訂單狀態更新
- [ ] 訂單詳情查看

#### 3️⃣ 導航測試

**上方導航 (Top Nav)：**
- [ ] 固定定位正常 (`position: fixed`, `top: 0px`)
- [ ] z-index層級正確 (`z-index: 1035`)
- [ ] 背景透明度和模糊效果

**下方導航 (Bottom Nav)：**
- [ ] 固定定位正常 (`position: fixed`, `bottom: 0px`)
- [ ] z-index層級正確 (`z-index: 1040`)
- [ ] 所有5個按鈕正常運作：
  - [ ] 首頁 (`/`)
  - [ ] 菜單 (`/menu`)
  - [ ] 購物車 (`/cart`)
  - [ ] 訂單 (`/orders`)
  - [ ] 個人資料 (`/profile`)
- [ ] 購物車徽章數量顯示

### 🔍 Chrome DevTools 除錯

#### 1️⃣ 網路請求監控

```javascript
// 在Console中監控所有API請求
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('API請求:', args[0], args[1])
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('API回應:', response.status, response.url)
      return response
    })
    .catch(error => {
      console.error('API錯誤:', error)
      throw error
    })
}
```

#### 2️⃣ 狀態管理測試

```javascript
// 查看Zustand狀態
// 認證狀態
console.log('認證狀態:', JSON.parse(localStorage.getItem('auth-storage') || '{}'))

// 購物車狀態
console.log('購物車狀態:', JSON.parse(localStorage.getItem('cart-storage') || '{}'))

// 清除所有狀態（重置應用）
localStorage.clear()
window.location.reload()
```

#### 3️⃣ CSS佈局除錯

```javascript
// 檢查導航元素定位
const topNav = document.querySelector('.top-nav')
const bottomNav = document.querySelector('.bottom-nav')

console.log('Top Nav樣式:', {
  position: getComputedStyle(topNav).position,
  top: getComputedStyle(topNav).top,
  zIndex: getComputedStyle(topNav).zIndex
})

console.log('Bottom Nav樣式:', {
  position: getComputedStyle(bottomNav).position,
  bottom: getComputedStyle(bottomNav).bottom,
  zIndex: getComputedStyle(bottomNav).zIndex
})
```

## 📊 性能測試

### ⚡ 載入性能測試

```javascript
// 測量頁面載入時間
window.addEventListener('load', () => {
  const loadTime = performance.now()
  console.log(`頁面載入時間: ${loadTime.toFixed(2)}ms`)
})

// 測量API響應時間
async function measureAPIPerformance(url) {
  const start = performance.now()
  try {
    await fetch(url)
    const end = performance.now()
    console.log(`API響應時間 (${url}): ${(end - start).toFixed(2)}ms`)
  } catch (error) {
    console.error(`API測試失敗 (${url}):`, error)
  }
}

// 測試主要API端點
measureAPIPerformance(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/health`)
measureAPIPerformance(`${localStorage.getItem('API_BASE_URL') || 'http://192.168.0.113:8087/api'}/menu`)
```

### 📱 響應式設計測試

使用Chrome DevTools的裝置模擬器測試以下裝置：
- [ ] iPhone SE (375x667)
- [ ] iPhone 12 Pro (390x844)
- [ ] iPad (768x1024)
- [ ] Desktop (1920x1080)

## 🐛 常見問題排除

### ❌ API連接問題

**問題**: `CORS policy` 錯誤
```
解決方案: 確認後端Spring Boot已正確配置CORS設定
```

**問題**: `Network Error` 或連接超時
```
解決方案:
1. 檢查後端服務器是否正在運行
2. 確認API位址是否正確
3. 測試網路連接
```

**問題**: `404 Not Found` 錯誤
```
解決方案:
1. 檢查API端點路徑是否正確
2. 確認後端路由配置
3. 檢查React Router配置
```

### 🔧 前端問題

**問題**: 頁面載入白屏
```
解決方案:
1. 檢查Console錯誤訊息
2. 確認JavaScript沒有語法錯誤
3. 檢查路由配置
```

**問題**: 狀態管理失效
```
解決方案:
1. 清除localStorage後重新測試
2. 檢查Zustand store配置
3. 確認狀態更新邏輯
```

## 📝 測試檢查清單

### ✅ 基本功能測試
- [ ] 所有頁面正常載入
- [ ] 導航功能完全正常
- [ ] API連接穩定
- [ ] 表單驗證正確
- [ ] 錯誤處理適當

### ✅ 跨環境測試
- [ ] 本地開發環境 (localhost:8080)
- [ ] Ubuntu Server環境 (192.168.0.113:8087)
- [ ] API切換功能正常
- [ ] 不同環境數據一致性

### ✅ 用戶體驗測試
- [ ] 載入速度acceptable
- [ ] 響應式設計適配
- [ ] 錯誤訊息友善
- [ ] 操作流程順暢

---

## 🎯 快速測試流程

1. **啟動開發環境**: `npm run dev`
2. **選擇API環境**: 使用Console指令切換API位址
3. **基本連接測試**: 執行健康檢查API測試
4. **功能測試**: 依序測試註冊、登入、導航功能
5. **效能檢查**: 監控載入時間和API響應速度
6. **跨環境驗證**: 切換不同API環境重複測試

**🎉 測試完成後，確保所有功能在各個環境下都能正常運作！**