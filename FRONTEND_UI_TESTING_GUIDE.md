# 前端UI測試指南 - Ranbow Restaurant

> **文檔版本**: 1.0  
> **最後更新**: 2025-08-15  
> **項目**: Ranbow Restaurant Order Application  
> **測試範圍**: Web版 + Mobile版 (Cordova) 前端UI測試

## 📱 項目架構概述

### 🌐 Web版本
- **路徑**: `web/`
- **主檔案**: `index.html`
- **技術**: HTML5 + CSS3 + Vanilla JavaScript + PWA

### 📱 Mobile版本
- **路徑**: `mobile/www/`
- **主檔案**: `index.html`
- **技術**: Apache Cordova + HTML5 + CSS3 + JavaScript

## 🧪 測試環境準備

### 🔧 必需工具
```bash
# 安裝測試相關工具
npm install -g http-server      # 本地Web服務器
npm install -g cordova         # Cordova CLI (Mobile測試)
npm install -g browser-sync    # 瀏覽器同步測試

# 測試框架 (選擇其一)
npm install -g cypress         # E2E測試
npm install -g playwright      # 跨瀏覽器測試
npm install -g selenium-webdriver  # WebDriver測試
```

### 🌍 瀏覽器要求
- **桌面**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **行動**: iOS Safari 14+, Android Chrome 90+

## 🚀 啟動測試環境

### 1. Web版測試環境啟動
```bash
# 進入Web目錄
cd web/

# 啟動本地服務器
http-server -p 8080 -c-1

# 或使用browser-sync (支援熱重載)
browser-sync start --server --files "**/*" --port 8080
```

### 2. Mobile版測試環境啟動
```bash
# 進入Mobile目錄
cd mobile/

# 在瀏覽器中測試 (模擬Mobile環境)
cordova platform add browser
cordova run browser

# Android設備測試
cordova platform add android
cordova build android
cordova run android --device

# iOS設備測試 (需macOS)
cordova platform add ios
cordova build ios
cordova run ios --device
```

## 🎯 測試分類與方法

### 1. 🖥️ 基礎功能測試

#### A. 頁面加載測試
```javascript
// 測試案例: 頁面正常加載
describe('頁面加載測試', () => {
  it('首頁應該正常加載', () => {
    cy.visit('http://localhost:8080')
    cy.get('#loading-screen').should('be.visible')
    cy.get('#main-content', { timeout: 10000 }).should('be.visible')
  })
})
```

#### B. 導航功能測試
```javascript
// 測試案例: 底部導航
describe('底部導航測試', () => {
  const navItems = ['home', 'menu', 'cart', 'orders', 'profile']
  
  navItems.forEach(page => {
    it(`應能導航到${page}頁面`, () => {
      cy.get(`[data-page="${page}"]`).click()
      cy.get('#main-content').should('contain', page)
    })
  })
})
```

### 2. 🔐 認證系統測試

#### A. 登入功能測試
```javascript
// 測試案例: 用戶登入
describe('登入功能測試', () => {
  it('有效憑證應該成功登入', () => {
    cy.visit('http://localhost:8080/#/auth')
    cy.get('#login-form input[type="email"]').type('test@example.com')
    cy.get('#login-form input[type="password"]').type('password123')
    cy.get('#login-form button[type="submit"]').click()
    cy.get('.toast-success').should('be.visible')
  })
  
  it('無效憑證應顯示錯誤', () => {
    cy.get('#login-form input[type="email"]').type('invalid@email.com')
    cy.get('#login-form input[type="password"]').type('wrongpass')
    cy.get('#login-form button[type="submit"]').click()
    cy.get('.toast-error').should('be.visible')
  })
})
```

#### B. 註冊功能測試
```javascript
// 測試案例: 用戶註冊
describe('註冊功能測試', () => {
  it('有效資料應該成功註冊', () => {
    cy.get('.switch-to-register').click()
    cy.get('#register-form input[name="username"]').type('新用戶')
    cy.get('#register-form input[name="email"]').type('newuser@example.com')
    cy.get('#register-form input[name="phoneNumber"]').type('0912345678')
    cy.get('#register-form input[name="password"]').type('password123')
    cy.get('#register-form button[type="submit"]').click()
    cy.get('.toast-success').should('be.visible')
  })
})
```

### 3. 🍽️ 點餐功能測試

#### A. 菜單瀏覽測試
```javascript
// 測試案例: 菜單顯示
describe('菜單功能測試', () => {
  beforeEach(() => {
    cy.login('customer@example.com', 'password123') // 自定義命令
    cy.visit('http://localhost:8080/#/menu')
  })
  
  it('應顯示菜單分類', () => {
    cy.get('.category-filter').should('be.visible')
    cy.get('.menu-item').should('have.length.greaterThan', 0)
  })
  
  it('能夠篩選菜單分類', () => {
    cy.get('[data-category="main"]').click()
    cy.get('.menu-item').each($item => {
      cy.wrap($item).should('have.attr', 'data-category', 'main')
    })
  })
})
```

#### B. 購物車功能測試
```javascript
// 測試案例: 購物車操作
describe('購物車功能測試', () => {
  it('能夠添加商品到購物車', () => {
    cy.get('.menu-item').first().find('.add-to-cart-btn').click()
    cy.get('.cart-badge').should('contain', '1')
  })
  
  it('能夠調整商品數量', () => {
    cy.visit('http://localhost:8080/#/cart')
    cy.get('.quantity-plus').first().click()
    cy.get('.item-quantity').first().should('contain', '2')
  })
  
  it('能夠移除購物車商品', () => {
    cy.get('.remove-item-btn').first().click()
    cy.get('.confirm-remove').click()
    cy.get('.cart-items').should('not.contain', '移除的商品')
  })
})
```

### 4. 💳 結帳流程測試

```javascript
// 測試案例: 結帳流程
describe('結帳流程測試', () => {
  beforeEach(() => {
    cy.addItemsToCart(['pizza', 'burger']) // 自定義命令
  })
  
  it('能夠完成完整結帳流程', () => {
    cy.visit('http://localhost:8080/#/cart')
    cy.get('.checkout-btn').click()
    
    // 填寫配送資訊
    cy.get('#delivery-address').type('台北市信義區信義路五段7號')
    cy.get('#delivery-time').select('12:00-13:00')
    
    // 選擇付款方式
    cy.get('[data-payment="credit-card"]').click()
    cy.get('#card-number').type('4111111111111111')
    cy.get('#card-expiry').type('12/25')
    cy.get('#card-cvv').type('123')
    
    // 確認訂單
    cy.get('.place-order-btn').click()
    cy.get('.order-success-modal').should('be.visible')
  })
})
```

## 📱 響應式設計測試

### 🖥️ 多設備尺寸測試
```javascript
// 測試案例: 響應式設計
describe('響應式設計測試', () => {
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ]
  
  devices.forEach(device => {
    it(`在${device.name}上應正常顯示`, () => {
      cy.viewport(device.width, device.height)
      cy.visit('http://localhost:8080')
      cy.get('.app-container').should('be.visible')
      cy.get('.bottom-nav').should('be.visible')
    })
  })
})
```

## 🚀 性能測試

### ⚡ 頁面載入速度測試
```javascript
// 測試案例: 性能測試
describe('性能測試', () => {
  it('首頁載入時間應少於3秒', () => {
    const start = Date.now()
    cy.visit('http://localhost:8080')
    cy.get('#main-content').should('be.visible').then(() => {
      const loadTime = Date.now() - start
      expect(loadTime).to.be.lessThan(3000)
    })
  })
  
  it('圖片應該延遲載入', () => {
    cy.get('img[data-lazy]').should('have.attr', 'data-lazy')
    cy.scrollTo('bottom')
    cy.get('img[data-lazy]').should('not.exist')
  })
})
```

## 🔧 手動測試檢查清單

### ✅ 基礎功能檢查
- [ ] 應用程式能正常啟動
- [ ] 載入畫面正常顯示
- [ ] 導航功能正常工作
- [ ] 所有頁面能正確切換

### 🔐 認證功能檢查
- [ ] 登入功能正常
- [ ] 註冊功能正常
- [ ] 登出功能正常
- [ ] 密碼重置功能正常
- [ ] 表單驗證正確顯示錯誤信息

### 🍽️ 點餐功能檢查
- [ ] 菜單正確載入並顯示
- [ ] 菜單分類篩選正常
- [ ] 商品搜尋功能正常
- [ ] 添加到購物車功能正常
- [ ] 購物車數量更新正確
- [ ] 購物車頁面顯示正確

### 💳 結帳功能檢查
- [ ] 配送資訊輸入正常
- [ ] 付款方式選擇正常
- [ ] 訂單確認頁面正確
- [ ] 訂單提交成功
- [ ] 訂單狀態更新正常

### 📱 行動裝置特定檢查
- [ ] 觸控操作響應正常
- [ ] 螢幕旋轉適配正常
- [ ] 返回鍵功能正常 (Android)
- [ ] 狀態欄顏色正確
- [ ] 啟動畫面顯示正常

## 🐛 常見問題與解決方案

### 1. 載入問題
**問題**: 頁面白屏或載入失敗
**解決**: 檢查網路連線、API服務是否啟動、瀏覽器控制台錯誤

### 2. 樣式問題
**問題**: CSS樣式顯示異常
**解決**: 清除瀏覽器快取、檢查CSS檔案路徑、確認RWD斷點設定

### 3. JavaScript錯誤
**問題**: 功能無法正常執行
**解決**: 檢查瀏覽器控制台、確認JS檔案載入順序、API呼叫狀態

### 4. 行動裝置問題
**問題**: Cordova應用無法啟動
**解決**: 檢查平台配置、重建專案、確認設備連線狀態

## 📊 測試報告格式

### 測試結果記錄
```markdown
## 測試報告 - [日期]

### 測試環境
- **瀏覽器**: Chrome 118.0.5993.117
- **設備**: Desktop (1920x1080)
- **測試版本**: v1.0

### 測試結果
| 測試項目 | 狀態 | 備註 |
|---------|------|------|
| 頁面載入 | ✅ PASS | 載入時間: 1.2s |
| 用戶登入 | ✅ PASS | 功能正常 |
| 購物車 | ❌ FAIL | 數量更新bug |
| 結帳流程 | ⚠️ WARNING | 支付API超時 |

### 發現問題
1. **購物車數量更新bug** (嚴重性: 高)
   - 描述: 連續點擊+按鈕時數量計算錯誤
   - 重現步驟: 1)添加商品 2)快速點擊+按鈕5次 3)觀察數量顯示
   
2. **支付API超時** (嚴重性: 中)
   - 描述: 在網路較慢時支付API回應超時
   - 建議: 增加載入指示器和錯誤處理

### 測試覆蓋率
- 功能測試: 85%
- UI測試: 90%
- 響應式測試: 95%
```

## 🔄 持續整合測試

### GitHub Actions配置
```yaml
# .github/workflows/ui-testing.yml
name: Frontend UI Testing

on: [push, pull_request]

jobs:
  ui-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install -g http-server cypress
      
      - name: Start web server
        run: |
          cd web && http-server -p 8080 &
      
      - name: Run Cypress tests
        run: |
          cypress run --spec "cypress/e2e/**/*.cy.js"
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: cypress-results
          path: cypress/results/
```

---

## 📚 相關文檔

- [API測試指南](API_TESTING_GUIDE.md)
- [項目啟動指南](SIMPLE_START_GUIDE.md)
- [技術文檔](CLAUDE.md)

---

**🎯 測試目標**: 確保前端UI在所有支援的平台和設備上提供一致、穩定的用戶體驗  
**📈 品質標準**: 功能測試通過率 ≥ 95%，性能測試載入時間 ≤ 3秒，跨瀏覽器相容性 ≥ 90%