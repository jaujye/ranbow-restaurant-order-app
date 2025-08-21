# 🌈 Ranbow管理員端 UI 設計規範

> **設計版本**: 2.0 - Rainbow Theme Edition  
> **更新日期**: 2025-08-21  
> **設計主題**: 彩虹主題現代化管理界面  
> **目標平台**: 手機優先的響應式設計  

## 🎯 重新設計目標

管理員端界面專為現代餐廳管理需求設計，採用**彩虹主題**提升視覺體驗：

### 🌈 核心設計理念
- **彩虹視覺語言**: 運用七彩漸層營造活潑專業的管理氛围
- **手機優先設計**: 專為觸控設備優化的交互體驗
- **現代化界面**: 拋棄傳統文字框架，採用現代Card-based設計
- **直觀數據視覺化**: 用色彩和圖表替代複雜數字表格

### 📱 技術特色
- **響應式設計**: 375px手機 → 768px平板 → 1200px+桌面無縫適配
- **Glass Morphism**: 玻璃質感卡片搭配彩虹漸層背景
- **微交互動畫**: 流暢的過渡效果和狀態反饋
- **觸控友好**: 大按鈕、手勢支援、易點擊目標

### 🎨 彩虹色彩系統
```css
紅色 #FF3B30 - 緊急/危險狀態
橙色 #FF9500 - 警告/待處理
黃色 #FFCC00 - 等待/暫停
綠色 #34C759 - 成功/完成
藍色 #007AFF - 信息/處理中
靛色 #5856D6 - 低優先級
紫色 #AF52DE - 特殊/VIP
粉色 #FF2D92 - 強調/重要
```

## 📋 重新設計總結

### 🌟 核心改進項目

**1. 視覺升級**
- 從純文字wireframe升級到現代彩虹主題UI
- 採用Glass Morphism玻璃質感設計
- 七彩漸層背景搭配動態光球效果
- 統一的彩虹色彩編碼系統

**2. 手機優先設計**
- 響應式網格系統：375px → 768px → 1200px
- 大觸控目標：最小48px點擊區域
- 垂直滾動優化，減少橫向操作
- 手勢友好的交互設計

**3. 用戶體驗優化**
- 彩虹狀態指示：用顏色快速識別訂單/菜品狀態
- 即時數據更新：WebSocket推送最新訊息
- 智能排序：緊急情況自動置頂
- 一鍵快速操作：減少點擊步驟

**4. 現代化元件**
- 卡片式佈局替代表格設計
- 動畫過渡效果提升流暢度
- 漸層按鈕和懸停效果
- 智能Toast通知系統

### 🛠️ 技術實作要點

**CSS框架需求：**
```css
/* 彩虹主題核心樣式 */
.rainbow-gradient { background: var(--gradient-rainbow-diagonal); }
.glass-morphism { backdrop-filter: blur(10px); }
.rainbow-border:focus { border: 2px solid var(--rainbow-blue); }
.rainbow-pulse { animation: rainbow-pulse 2s infinite; }

/* 響應式斷點 */
@media (max-width: 375px) { /* 小手機 */ }
@media (min-width: 376px) and (max-width: 768px) { /* 大手機 */ }
@media (min-width: 769px) and (max-width: 1024px) { /* 平板 */ }
@media (min-width: 1025px) { /* 桌面 */ }
```

**JavaScript功能需求：**
- 即時數據綁定與更新
- 觸控手勢支援
- 動畫序列控制
- WebSocket連接管理
- 本地狀態快取

**前端工程師開發指南：**
1. 使用CSS Grid和Flexbox建立響應式佈局
2. 實作CSS變數系統統一主題色彩
3. 加入觸控事件處理提升手機體驗
4. 優化動畫性能使用transform和opacity
5. 實作漸進式載入提升首屏速度

---

## 🔐 1. 管理員登入頁面

### 🌈 視覺設計概念
```html
<!-- 彩虹動態背景 -->
<div class="rainbow-background">
  <!-- 浮動彩虹光球動畫 -->
  <div class="rainbow-orb"></div>
</div>

<!-- 中央登入卡片 -->
<div class="login-card glass-morphism">
  <!-- 品牌頭部 -->
  <div class="brand-header">
    <div class="logo rainbow-gradient">🍽️</div>
    <h1>Ranbow Restaurant</h1>
    <p>管理員後台系統</p>
  </div>
  
  <!-- 登入表單 -->
  <form class="rainbow-form">
    <!-- Email輸入框 -->
    <div class="input-group">
      <label>📧 管理員帳號</label>
      <input type="email" class="rainbow-input">
      <div class="focus-ring rainbow-border"></div>
    </div>
    
    <!-- 密碼輸入框 -->
    <div class="input-group">
      <label>🔒 密碼</label>
      <input type="password" class="rainbow-input">
      <button class="password-toggle">👁️</button>
    </div>
    
    <!-- 記住登入 -->
    <label class="checkbox-rainbow">
      <input type="checkbox">
      <span class="checkmark">✓</span>
      記住登入狀態
    </label>
    
    <!-- 權限選擇卡片 -->
    <div class="role-cards">
      <div class="role-card red-gradient">
        <i class="crown-icon">👑</i>
        <span>超級管理員</span>
        <small>完整系統控制</small>
      </div>
      <div class="role-card blue-gradient">
        <i class="store-icon">🏪</i>
        <span>店舖管理員</span>
        <small>店舖營運管理</small>
      </div>
      <div class="role-card purple-gradient">
        <i class="task-icon">📋</i>
        <span>營運管理員</span>
        <small>日常業務管理</small>
      </div>
    </div>
    
    <!-- 登入按鈕 -->
    <button class="submit-button rainbow-gradient">
      <span>🚀 進入管理後台</span>
      <div class="loading-spinner"></div>
    </button>
  </form>
  
  <!-- 快速登入面板 -->
  <div class="quick-access glass-panel">
    <h3>🚀 快速存取</h3>
    <div class="quick-buttons">
      <button class="quick-btn crown">👑 超級管理員</button>
      <button class="quick-btn store">🏪 店舖管理員</button>
      <button class="quick-btn ops">📋 營運管理員</button>
    </div>
    <p class="demo-note">💡 演示模式：點擊快速登入</p>
  </div>
</div>
```

### 🎨 CSS設計重點
```css
/* 彩虹動態背景 */
.rainbow-background {
  background: linear-gradient(135deg, 
    rgba(255,59,48,0.1), rgba(255,149,0,0.1), 
    rgba(255,204,0,0.1), rgba(52,199,89,0.1),
    rgba(0,122,255,0.1), rgba(88,86,214,0.1),
    rgba(175,82,222,0.1));
  animation: rainbow-shift 6s ease-in-out infinite;
}

/* 玻璃質感卡片 */
.glass-morphism {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* 彩虹漸層輸入框 */
.rainbow-input:focus {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(90deg, #FF3B30, #FF9500, #34C759, #007AFF) border-box;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .login-card {
    margin: 16px;
    padding: 20px;
    border-radius: 16px;
  }
  
  .role-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .quick-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
```

### 📱 手機優化特色
- **大觸控目標**: 最小48px點擊區域
- **垂直佈局**: 單列表單設計，減少橫向滑動
- **彩虹視覺反饋**: 輸入焦點時彩虹邊框動畫
- **快速登入**: 一鍵演示模式，方便測試
- **載入動畫**: 彩虹漸層載入指示器

---

## 📊 2. 管理儀表板

### 🌈 彩虹儀表板設計
```html
<!-- 頂部導航欄 -->
<header class="admin-header rainbow-gradient">
  <div class="header-content">
    <h1 class="dashboard-title">🏠 管理儀表板</h1>
    <div class="admin-profile">
      <div class="profile-avatar rainbow-border">👤</div>
      <span class="admin-name">王店長</span>
      <div class="notification-badge rainbow-pulse">🔔 3</div>
    </div>
  </div>
</header>

<!-- 核心指標卡片組 -->
<div class="metrics-grid">
  <!-- 營業額卡片 -->
  <div class="metric-card red-gradient glass-effect">
    <div class="metric-icon">💰</div>
    <div class="metric-content">
      <h3 class="metric-title">今日營業額</h3>
      <div class="metric-value">NT$ 127,500</div>
      <div class="metric-trend positive">
        <i class="trend-icon">📈</i>
        <span>+12.5%</span>
        <small>較昨日</small>
      </div>
    </div>
    <div class="metric-chart mini-chart-red"></div>
  </div>
  
  <!-- 訂單數卡片 -->
  <div class="metric-card blue-gradient glass-effect">
    <div class="metric-icon">📋</div>
    <div class="metric-content">
      <h3 class="metric-title">訂單總數</h3>
      <div class="metric-value">142</div>
      <div class="metric-trend positive">
        <i class="trend-icon">📈</i>
        <span>+8.3%</span>
        <small>較昨日</small>
      </div>
    </div>
    <div class="order-status-mini">
      <div class="status-dot pending">8</div>
      <div class="status-dot processing">5</div>
      <div class="status-dot completed">129</div>
    </div>
  </div>
  
  <!-- 客戶數卡片 -->
  <div class="metric-card green-gradient glass-effect">
    <div class="metric-icon">👥</div>
    <div class="metric-content">
      <h3 class="metric-title">活躍客戶</h3>
      <div class="metric-value">89</div>
      <div class="metric-trend positive">
        <i class="trend-icon">📈</i>
        <span>+15.2%</span>
        <small>較昨日</small>
      </div>
    </div>
    <div class="customer-types">
      <span class="customer-type vip">VIP: 12</span>
      <span class="customer-type regular">常客: 77</span>
    </div>
  </div>
  
  <!-- 員工狀態卡片 -->
  <div class="metric-card purple-gradient glass-effect">
    <div class="metric-icon">👨‍🍳</div>
    <div class="metric-content">
      <h3 class="metric-title">員工狀態</h3>
      <div class="staff-status">
        <div class="staff-group online">
          <span class="status-dot online"></span>
          <span>在線: 8人</span>
        </div>
        <div class="staff-group busy">
          <span class="status-dot busy"></span>
          <span>忙碌: 3人</span>
        </div>
        <div class="staff-group break">
          <span class="status-dot break"></span>
          <span>休息: 2人</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 即時訂單監控 -->
<div class="realtime-orders glass-panel">
  <div class="panel-header">
    <h2 class="panel-title">⚡ 即時訂單監控</h2>
    <div class="auto-refresh rainbow-pulse">
      <i class="refresh-icon">🔄</i>
      <span>自動刷新</span>
    </div>
  </div>
  
  <div class="order-lanes">
    <!-- 緊急訂單 -->
    <div class="order-lane urgent">
      <div class="lane-header red-bg">
        <h3>🚨 緊急處理</h3>
        <span class="order-count">2</span>
      </div>
      <div class="order-items">
        <div class="order-item urgent-glow">
          <div class="order-id">#12354</div>
          <div class="table-info">桌號 7</div>
          <div class="overtime">超時 13分</div>
          <div class="order-action">
            <button class="action-btn red">立即處理</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 處理中訂單 -->
    <div class="order-lane processing">
      <div class="lane-header blue-bg">
        <h3>🔄 製作中</h3>
        <span class="order-count">5</span>
      </div>
      <div class="order-items">
        <div class="order-item processing-glow">
          <div class="order-id">#12355</div>
          <div class="table-info">桌號 3</div>
          <div class="processing-time">8分鐘</div>
          <div class="chef-info">👨‍🍳 李師傅</div>
        </div>
      </div>
    </div>
    
    <!-- 已完成訂單 -->
    <div class="order-lane completed">
      <div class="lane-header green-bg">
        <h3>✅ 待取餐</h3>
        <span class="order-count">3</span>
      </div>
      <div class="order-items">
        <div class="order-item completed-glow">
          <div class="order-id">#12353</div>
          <div class="table-info">桌號 1</div>
          <div class="ready-time">剛完成</div>
          <div class="order-action">
            <button class="action-btn green">通知取餐</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 快速操作面板 -->
<div class="quick-actions-panel">
  <h3 class="panel-title">⚡ 快速操作</h3>
  <div class="action-grid">
    <button class="action-card red-gradient">
      <i class="action-icon">🍽️</i>
      <span class="action-label">菜單管理</span>
      <small class="action-desc">編輯菜品和價格</small>
    </button>
    <button class="action-card blue-gradient">
      <i class="action-icon">📋</i>
      <span class="action-label">訂單管理</span>
      <small class="action-desc">查看所有訂單</small>
    </button>
    <button class="action-card green-gradient">
      <i class="action-icon">👥</i>
      <span class="action-label">用戶管理</span>
      <small class="action-desc">管理客戶和員工</small>
    </button>
    <button class="action-card purple-gradient">
      <i class="action-icon">📈</i>
      <span class="action-label">營業報表</span>
      <small class="action-desc">查看詳細數據</small>
    </button>
  </div>
</div>

<!-- 智能提醒面板 -->
<div class="alerts-panel glass-panel">
  <h3 class="panel-title">🚨 需要關注</h3>
  <div class="alert-list">
    <div class="alert-item high-priority">
      <div class="alert-icon red-pulse">⚠️</div>
      <div class="alert-content">
        <div class="alert-title">桌號5訂單超時</div>
        <div class="alert-desc">已超過預計時間15分鐘</div>
        <div class="alert-time">2分鐘前</div>
      </div>
      <button class="alert-action red">處理</button>
    </div>
    
    <div class="alert-item medium-priority">
      <div class="alert-icon orange-pulse">📦</div>
      <div class="alert-content">
        <div class="alert-title">雞腿排庫存不足</div>
        <div class="alert-desc">剩餘庫存: 3份</div>
        <div class="alert-time">5分鐘前</div>
      </div>
      <button class="alert-action orange">補貨</button>
    </div>
    
    <div class="alert-item low-priority">
      <div class="alert-icon blue-pulse">👤</div>
      <div class="alert-content">
        <div class="alert-title">員工小王請假</div>
        <div class="alert-desc">明日請假需要調配人手</div>
        <div class="alert-time">30分鐘前</div>
      </div>
      <button class="alert-action blue">查看</button>
    </div>
  </div>
</div>
```

### 🎨 響應式設計特色
```css
/* 手機版佈局 */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;
  }
  
  .order-lanes {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .metric-card {
    padding: 16px;
    border-radius: 12px;
  }
  
  .metric-value {
    font-size: 24px;
    font-weight: 700;
  }
}

/* 平板版佈局 */
@media (min-width: 768px) and (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .order-lanes {
    flex-direction: row;
    gap: 12px;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* 桌面版佈局 */
@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
  }
}
```

### 📱 手機優化重點
- **觸控友好**: 最小44px觸控目標
- **彩虹狀態指示**: 用顏色快速識別訂單狀態
- **即時更新**: WebSocket實時數據同步
- **智能排序**: 緊急訂單自動置頂顯示
- **一鍵操作**: 快速處理按鈕，減少點擊次數

---

## 🍽️ 3. 菜單管理頁面

### 🌈 彩虹菜單管理設計
```html
<!-- 菜單管理頭部 -->
<header class="menu-header glass-morphism">
  <div class="header-nav">
    <button class="back-btn rainbow-hover">← 返回</button>
    <h1 class="page-title">🍽️ 菜單管理</h1>
    <button class="add-item-btn rainbow-gradient">+ 新增菜品</button>
  </div>
  
  <!-- 搜尋和篩選 -->
  <div class="search-filters">
    <div class="search-box rainbow-border">
      <i class="search-icon">🔍</i>
      <input type="text" placeholder="搜尋菜品名稱..." class="search-input">
    </div>
    
    <div class="filter-tabs">
      <button class="filter-tab active red-bg">全部 (45)</button>
      <button class="filter-tab orange-bg">前菜 (8)</button>
      <button class="filter-tab yellow-bg">主菜 (18)</button>
      <button class="filter-tab green-bg">甜點 (12)</button>
      <button class="filter-tab blue-bg">飲料 (7)</button>
    </div>
  </div>
  
  <!-- 統計資訊 -->
  <div class="menu-stats">
    <div class="stat-item green-gradient">
      <span class="stat-value">42</span>
      <span class="stat-label">可用菜品</span>
    </div>
    <div class="stat-item orange-gradient">
      <span class="stat-value">3</span>
      <span class="stat-label">缺貨項目</span>
    </div>
    <div class="stat-item blue-gradient">
      <span class="stat-value">2</span>
      <span class="stat-label">本週新增</span>
    </div>
  </div>
</header>

<!-- 菜品網格 -->
<div class="menu-grid">
  <!-- 菜品卡片 -->
  <div class="menu-item-card glass-effect available">
    <div class="item-image">
      <img src="steak.jpg" alt="招牌牛排">
      <div class="item-badge bestseller">🏆 招牌</div>
      <div class="item-actions">
        <button class="action-btn edit blue">編輯</button>
        <button class="action-btn toggle green">下架</button>
      </div>
    </div>
    
    <div class="item-info">
      <div class="item-header">
        <h3 class="item-name">招牌牛排</h3>
        <div class="item-status available">🟢 可用</div>
      </div>
      
      <div class="item-details">
        <div class="item-price rainbow-text">NT$ 380</div>
        <div class="item-category">主菜</div>
      </div>
      
      <div class="item-metrics">
        <div class="metric">
          <span class="metric-label">庫存</span>
          <span class="metric-value green">充足</span>
        </div>
        <div class="metric">
          <span class="metric-label">今日銷量</span>
          <span class="metric-value blue">28</span>
        </div>
        <div class="metric">
          <span class="metric-label">評分</span>
          <span class="metric-value yellow">4.8⭐</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 缺貨菜品卡片 -->
  <div class="menu-item-card glass-effect out-of-stock">
    <div class="item-image">
      <img src="chicken.jpg" alt="蜜汁雞腿">
      <div class="item-badge out-of-stock">❌ 缺貨</div>
      <div class="item-actions">
        <button class="action-btn edit blue">編輯</button>
        <button class="action-btn restock orange">補貨</button>
      </div>
    </div>
    
    <div class="item-info">
      <div class="item-header">
        <h3 class="item-name">蜜汁雞腿</h3>
        <div class="item-status out-of-stock">🟡 缺貨</div>
      </div>
      
      <div class="item-details">
        <div class="item-price">NT$ 280</div>
        <div class="item-category">主菜</div>
      </div>
      
      <div class="item-metrics">
        <div class="metric">
          <span class="metric-label">庫存</span>
          <span class="metric-value red">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">今日銷量</span>
          <span class="metric-value">15</span>
        </div>
        <div class="metric">
          <span class="metric-label">預估補貨</span>
          <span class="metric-value orange">2小時</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 批量操作面板 -->
<div class="bulk-actions glass-panel" style="display: none;">
  <div class="panel-header">
    <h3>🔄 批量管理</h3>
    <span class="selected-count">已選擇: 3 個項目</span>
  </div>
  
  <div class="bulk-controls">
    <div class="price-adjustment">
      <label>價格調整</label>
      <div class="adjustment-controls">
        <button class="adjust-btn red">-10%</button>
        <button class="adjust-btn green">+10%</button>
        <input type="number" placeholder="自訂金額" class="custom-price">
      </div>
    </div>
    
    <div class="status-change">
      <label>狀態變更</label>
      <div class="status-buttons">
        <button class="status-btn green">全部上架</button>
        <button class="status-btn orange">全部下架</button>
        <button class="status-btn red">標記缺貨</button>
      </div>
    </div>
    
    <div class="bulk-actions-buttons">
      <button class="confirm-btn rainbow-gradient">確認執行</button>
      <button class="cancel-btn">取消</button>
    </div>
  </div>
</div>
```

### 🎨 菜品編輯模態框
```html
<!-- 菜品編輯彈窗 -->
<div class="edit-modal glass-morphism">
  <div class="modal-header rainbow-gradient">
    <h2>📝 編輯菜品</h2>
    <button class="close-btn">✕</button>
  </div>
  
  <div class="modal-content">
    <!-- 圖片上傳區 -->
    <div class="image-upload-section">
      <div class="image-preview">
        <img src="current-image.jpg" alt="預覽">
        <div class="upload-overlay">
          <i class="upload-icon">📸</i>
          <span>點擊更換圖片</span>
        </div>
      </div>
      <div class="upload-tips">
        <small>建議尺寸: 800x600 | 支援: JPG, PNG</small>
      </div>
    </div>
    
    <!-- 基本資訊 -->
    <div class="form-section">
      <h3>📋 基本資訊</h3>
      <div class="form-grid">
        <div class="input-group">
          <label>菜品名稱</label>
          <input type="text" value="招牌牛排" class="rainbow-input">
        </div>
        <div class="input-group">
          <label>英文名稱</label>
          <input type="text" value="Signature Steak" class="rainbow-input">
        </div>
        <div class="input-group">
          <label>分類</label>
          <select class="rainbow-select">
            <option value="main">主菜</option>
            <option value="appetizer">前菜</option>
            <option value="dessert">甜點</option>
            <option value="drink">飲料</option>
          </select>
        </div>
        <div class="input-group">
          <label>價格</label>
          <input type="number" value="380" class="rainbow-input">
        </div>
      </div>
    </div>
    
    <!-- 詳細說明 -->
    <div class="form-section">
      <h3>📝 詳細說明</h3>
      <textarea class="description-input rainbow-border" placeholder="輸入菜品描述...">
選用優質牛肉，搭配主廚特製醬汁，火候恰到好處...
      </textarea>
    </div>
    
    <!-- 進階設定 -->
    <div class="form-section">
      <h3>⚙️ 進階設定</h3>
      <div class="settings-grid">
        <div class="setting-item">
          <label>準備時間</label>
          <div class="time-input">
            <input type="number" value="25" class="rainbow-input">
            <span>分鐘</span>
          </div>
        </div>
        <div class="setting-item">
          <label>辣度等級</label>
          <select class="rainbow-select">
            <option value="0">不辣</option>
            <option value="1">微辣</option>
            <option value="2">中辣</option>
            <option value="3">重辣</option>
          </select>
        </div>
        <div class="setting-toggles">
          <label class="toggle-switch">
            <input type="checkbox" checked>
            <span class="slider rainbow"></span>
            <span class="toggle-label">推薦菜品</span>
          </label>
          <label class="toggle-switch">
            <input type="checkbox" checked>
            <span class="slider rainbow"></span>
            <span class="toggle-label">目前可用</span>
          </label>
        </div>
      </div>
    </div>
  </div>
  
  <div class="modal-footer">
    <button class="cancel-btn">取消</button>
    <button class="save-btn rainbow-gradient">儲存變更</button>
  </div>
</div>
```

---

## 📋 4. 訂單監控中心

### 菜單總覽
```
┌─────────────────────┐
│ ← 菜單管理     + 新增 │
│                     │
│ 🔍 [搜尋菜品...]     │
│ [分類▼] [狀態▼] [排序▼]│
│                     │
│ 📊 統計資料          │
│ 總菜品: 45 | 可用: 42 │
│ 本週新增: 2 | 缺貨: 3 │
│                     │
│ ┌─────────────────┐ │
│ │[圖] 招牌牛排     │ │
│ │ID: #001         │ │
│ │價格: NT$ 380     │ │
│ │狀態: 🟢 可用     │ │
│ │庫存: 充足        │ │
│ │本日銷量: 28      │ │
│ │ [編輯] [下架]    │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │[圖] 蜜汁雞腿     │ │
│ │ID: #002         │ │
│ │價格: NT$ 280     │ │
│ │狀態: 🟡 缺貨     │ │
│ │庫存: 0          │ │
│ │本日銷量: 15      │ │
│ │ [編輯] [補貨]    │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

### 菜品編輯頁面
```
┌─────────────────────┐
│ ← 編輯菜品           │
│                     │
│ 📸 菜品圖片          │
│ ┌─────────────────┐ │
│ │ [上傳圖片]       │ │
│ │ 支持: JPG/PNG    │ │
│ │ 建議尺寸: 800x600 │ │
│ └─────────────────┘ │
│                     │
│ 📝 基本資訊          │
│ 菜品名稱: [招牌牛排]  │
│ 英文名稱: [Signature Steak]│
│ 分類: [主菜 ▼]       │
│ 價格: [NT$ 380]      │
│                     │
│ 📋 詳細說明          │
│ ┌─────────────────┐ │
│ │選用優質牛肉...    │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ ⚙️ 設定              │
│ 準備時間: [25] 分鐘   │
│ 辣度等級: [不辣 ▼]    │
│ 是否推薦: ☑️         │
│ 是否可用: ☑️         │
│                     │
│ [取消] [儲存變更]     │
│                     │
└─────────────────────┘
```

### 批量操作
```
┌─────────────────────┐
│ 🔄 批量管理          │
│                     │
│ 已選擇: 3 個項目     │
│ ┌─────────────────┐ │
│ │☑️ 招牌牛排       │ │
│ │☑️ 蜜汁雞腿       │ │
│ │☑️ 義式燉飯       │ │
│ └─────────────────┘ │
│                     │
│ 批量操作:            │
│ [調整價格] [修改狀態] │
│ [加入促銷] [匯出資料] │
│                     │
│ 價格調整:            │
│ ○ 固定金額 [+50]     │
│ ○ 百分比 [+10%]      │
│                     │
│ 狀態變更:            │
│ ○ 全部上架          │
│ ○ 全部下架          │
│ ○ 標記缺貨          │
│                     │
│ [確認執行] [取消]     │
│                     │
└─────────────────────┘
```

---

## 📋 4. 訂單監控中心

### 訂單總覽
```
┌─────────────────────┐
│ ← 訂單監控     🔄 即時│
│                     │
│ 📊 今日訂單狀態      │
│ ┌──┬──┬──┬──┬──┐ │
│ │全部││待處││進行││完成││取消││
│ │142││ 8 ││ 5 ││128││ 1 ││
│ └──┴──┴──┴──┴──┘ │
│                     │
│ ⚡ 即時訂單          │
│ ┌─────────────────┐ │
│ │🔴 #12354 桌7 超時│ │
│ │⏰ 超時3分鐘      │ │
│ │招牌牛排×1 義麵×1 │ │
│ │顧客: 陳先生      │ │
│ │💰 NT$ 630       │ │
│ │ [查看詳情] [催促] │ │
│ └─────────────────┘ │
│                     │
│ 🟡 處理中訂單        │
│ ┌─────────────────┐ │
│ │#12355 桌3       │ │
│ │⏰ 製作中 8分鐘    │ │
│ │雞腿排×2         │ │
│ │員工: 李師傅      │ │
│ │💰 NT$ 560       │ │
│ │ [查看] [聯繫]    │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

### 訂單詳細頁面
```
┌─────────────────────┐
│ ← 訂單 #12354       │
│                     │
│ 📊 訂單資訊          │
│ ┌─────────────────┐ │
│ │狀態: 🔴 超時     │ │
│ │桌號: 7          │ │
│ │顧客: 陳先生      │ │
│ │電話: 0912-345-678│ │
│ │下單: 14:25      │ │
│ │預計: 14:50      │ │
│ │實際: 15:03 (遲13分)│ │
│ └─────────────────┘ │
│                     │
│ 🍽️ 菜品明細         │
│ ┌─────────────────┐ │
│ │招牌牛排 × 1      │ │
│ │NT$ 380          │ │
│ │特殊要求: 七分熟   │ │
│ │狀態: ✅ 完成     │ │
│ │────────────     │ │
│ │義式燉飯 × 1      │ │
│ │NT$ 250          │ │
│ │特殊要求: 無       │ │
│ │狀態: 🔄 製作中   │ │
│ └─────────────────┘ │
│                     │
│ 🎬 訂單時間軸        │
│ 14:25 ✅ 下單完成    │
│ 14:26 ✅ 廚房接單    │
│ 14:35 🔄 開始製作    │
│ 15:03 ❌ 超時未完成  │
│                     │
│ [強制完成] [申請退款] │
│ [聯繫顧客] [記錄問題] │
│                     │
└─────────────────────┘
```

### 問題訂單處理
```
┌─────────────────────┐
│ 🚨 問題訂單處理      │
│                     │
│ 訂單 #12354         │
│ 問題類型: 製作超時   │
│ 影響程度: 🔴 嚴重    │
│                     │
│ 📝 處理方案:         │
│                     │
│ ○ 🎁 免費贈送甜點    │
│ ○ 💰 給予折扣優惠    │
│ ○ 🔄 重新製作菜品    │
│ ○ 💸 全額退款       │
│ ○ ✍️ 自訂解決方案   │
│                     │
│ 折扣金額: [50] NT$   │
│ 免費項目: [冰淇淋]    │
│                     │
│ 道歉訊息:            │
│ ┌─────────────────┐ │
│ │非常抱歉讓您久等... │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ [發送道歉] [執行補償] │
│ [記錄客訴] [取消]    │
│                     │
└─────────────────────┘
```

---

## 👥 5. 用戶管理頁

### 用戶總覽
```
┌─────────────────────┐
│ ← 用戶管理    🔍 + 新增│
│                     │
│ 📊 用戶統計          │
│ 總用戶: 1,247       │
│ 本週新增: 28        │
│ 活躍用戶: 892       │
│                     │
│ [顧客] [員工] [管理員] │
│                     │
│ ┌─────────────────┐ │
│ │👤 王小明         │ │
│ │📧 wang@email.com│ │
│ │📱 0912-345-678   │ │
│ │📊 VIP會員        │ │
│ │💰 累計消費: $12K │ │
│ │📅 加入: 2024/01  │ │
│ │🟢 狀態: 活躍     │ │
│ │ [查看] [編輯]    │ │ 
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │👨‍🍳 李師傅        │ │
│ │📧 chef@ranbow.com│ │
│ │👔 職位: 主廚      │ │
│ │📊 工作表現: 優秀  │ │
│ │⏰ 本月工時: 180H │ │
│ │📅 入職: 2023/08  │ │
│ │🟢 狀態: 在職     │ │
│ │ [查看] [編輯]    │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

### 員工詳細管理
```
┌─────────────────────┐
│ ← 員工資料 - 李師傅   │
│                     │
│ 👤 基本資訊          │
│ ┌─────────────────┐ │
│ │姓名: 李志明       │ │
│ │工號: ST003       │ │
│ │部門: 廚房        │ │
│ │職位: 主廚        │ │
│ │電話: 0912-333-444 │ │
│ │入職: 2023-08-15   │ │
│ └─────────────────┘ │
│                     │
│ 📊 工作表現          │
│ ┌─────────────────┐ │
│ │本月處理訂單: 658  │ │
│ │平均完成時間: 18分 │ │
│ │客戶滿意度: 4.8/5  │ │
│ │遲到次數: 0       │ │
│ │請假天數: 2       │ │
│ └─────────────────┘ │
│                     │
│ ⚙️ 權限設定          │
│ ☑️ 查看訂單          │
│ ☑️ 更新訂單狀態      │
│ ☐ 修改菜單價格       │
│ ☐ 查看營收報表       │
│                     │
│ [編輯資料] [調整權限] │
│ [查看排班] [績效評估] │
│                     │
└─────────────────────┘
```

### 會員等級管理
```
┌─────────────────────┐
│ 👑 會員等級管理      │
│                     │
│ 🥉 銅牌會員          │
│ 消費滿 NT$ 1,000     │
│ • 9.5折優惠         │
│ • 生日優惠券         │
│ 當前會員: 856人      │
│                     │
│ 🥈 銀牌會員          │
│ 消費滿 NT$ 5,000     │
│ • 9折優惠           │
│ • 免費甜點          │
│ • 專屬客服          │
│ 當前會員: 312人      │
│                     │
│ 🥇 金牌會員          │
│ 消費滿 NT$ 15,000    │
│ • 8.5折優惠         │
│ • 免費飲品          │
│ • 優先訂位          │
│ • 專屬活動          │
│ 當前會員: 79人       │
│                     │
│ [新增等級] [編輯規則] │
│ [會員升級] [發送通知] │
│                     │
└─────────────────────┘
```

---

## 📈 6. 報表分析頁

### 營收分析
```
┌─────────────────────┐
│ ← 營收分析    📅 本月 │
│                     │
│ 💰 收入總覽          │
│ ┌─────────────────┐ │
│ │本月營收: $127,500 │ │
│ │上月營收: $119,300 │ │
│ │成長率: +6.9% 📈   │ │
│ │目標達成: 85%      │ │
│ └─────────────────┘ │
│                     │
│ 📊 每日營收趨勢      │
│ ┌─────────────────┐ │
│ │  $│             │ │
│ │ 5K│    ●        │ │
│ │ 4K│  ●   ●      │ │
│ │ 3K│●       ●    │ │
│ │ 2K│           ● │ │
│ │ 1K│             │ │
│ │  0└─────────────│ │
│ │   1 5 10 15 20 25│ │
│ └─────────────────┘ │
│                     │
│ 🏆 熱門菜品排行      │
│ 1. 🥇 招牌牛排 $8.9K │
│ 2. 🥈 蜜汁雞腿 $6.2K │
│ 3. 🥉 義式燉飯 $4.8K │
│ 4.    炸雞翅   $3.1K │
│ 5.    漢堡套餐 $2.9K │
│                     │
│ [詳細報表] [匯出數據] │
│                     │
└─────────────────────┘
```

### 運營效率分析
```
┌─────────────────────┐
│ ← 運營分析           │
│                     │
│ ⏱️ 平均處理時間      │
│ ┌─────────────────┐ │
│ │下單到完成: 22分鐘 │ │
│ │廚房製作: 18分鐘   │ │
│ │等待時間: 4分鐘    │ │
│ │目標時間: 20分鐘   │ │
│ │效率評分: B+       │ │
│ └─────────────────┘ │
│                     │
│ 📋 訂單完成率        │
│ ┌─────────────────┐ │
│ │成功完成: 94.2%    │ │
│ │客戶取消: 3.1%     │ │
│ │廚房問題: 2.7%     │ │ 
│ │             ████│ │
│ └─────────────────┘ │
│                     │
│ 👨‍🍳 員工效率         │
│ ┌─────────────────┐ │
│ │李師傅 訂單/小時: 12│ │
│ │王助理 訂單/小時: 10│ │
│ │陳新手 訂單/小時: 8 │ │
│ │平均效率: 10/小時  │ │
│ └─────────────────┘ │
│                     │
│ 🎯 改善建議          │
│ • 加快炸雞翅製作     │
│ • 優化廚房流程       │
│ • 增派尖峰時段人手   │
│                     │
└─────────────────────┘
```

### 客戶滿意度分析
```
┌─────────────────────┐
│ ← 客戶滿意度分析     │
│                     │
│ ⭐ 總體評分: 4.6/5   │
│                     │
│ 📊 評分分布          │
│ 5⭐ ████████████ 65% │
│ 4⭐ ████████     40% │
│ 3⭐ ████         20% │
│ 2⭐ ██           10% │
│ 1⭐ █             5% │
│                     │
│ 💬 熱門評論關鍵字    │
│ ┌─────────────────┐ │
│ │😊 正面          │ │
│ │• 美味 (127次)   │ │
│ │• 新鮮 (89次)    │ │  
│ │• 服務好 (76次)   │ │
│ │                 │ │
│ │😞 負面          │ │
│ │• 等太久 (23次)   │ │
│ │• 太鹹 (12次)     │ │
│ │• 價格高 (8次)    │ │
│ └─────────────────┘ │
│                     │
│ 🎯 改善重點          │
│ 1. 縮短等候時間      │
│ 2. 調整菜品調味      │
│ 3. 推出平價選項      │
│                     │
│ [查看詳細評論]       │
│ [回覆客戶評價]       │
│                     │
└─────────────────────┘
```

---

## ⚙️ 7. 系統設定頁

### 基本設定
```
┌─────────────────────┐
│ ← 系統設定           │
│                     │
│ 🏪 餐廳基本資訊      │
│ ┌─────────────────┐ │
│ │餐廳名稱: Ranbow   │ │
│ │英文名稱: Rainbow  │ │
│ │聯絡電話: 02-1234-5678│ │
│ │地址: 台北市...     │ │
│ │營業時間: 11:00-22:00│ │
│ │公休日: 無          │ │
│ └─────────────────┘ │
│                     │
│ 💰 價格與稅務設定    │
│ ┌─────────────────┐ │
│ │貨幣單位: NT$      │ │
│ │稅率設定: 10%      │ │
│ │服務費: 0%         │ │
│ │小費機制: ☐ 啟用   │ │
│ └─────────────────┘ │
│                     │
│ 🔔 通知設定          │
│ 新訂單通知    [開啟] │
│ 庫存預警      [開啟] │
│ 系統異常      [開啟] │
│ 營收日報      [開啟] │
│                     │
│ [儲存設定] [重設預設] │
│                     │
└─────────────────────┘
```

### 系統備份與安全
```
┌─────────────────────┐
│ 🛡️ 安全與備份        │
│                     │
│ 💾 資料備份          │
│ ┌─────────────────┐ │
│ │自動備份: ☑️ 啟用  │ │
│ │備份頻率: 每日     │ │
│ │備份時間: 03:00    │ │
│ │保留天數: 30天     │ │
│ │最後備份: 2024/08/13│ │
│ │備份狀態: ✅ 成功  │ │
│ └─────────────────┘ │
│                     │
│ 🔐 安全設定          │
│ ┌─────────────────┐ │
│ │密碼強度: 中等     │ │
│ │登入失敗限制: 5次  │ │
│ │會話超時: 2小時    │ │
│ │雙因素認證: ☐ 啟用 │ │
│ │IP白名單: ☐ 啟用   │ │
│ └─────────────────┘ │
│                     │
│ 📊 系統監控          │
│ CPU使用率: 25%      │
│ 記憶體使用: 60%      │
│ 磁碟空間: 45% 使用   │
│ 資料庫連線: 正常     │
│                     │
│ [立即備份] [檢查更新] │
│ [查看日誌] [重啟系統] │
│                     │
└─────────────────────┘
```

### 權限管理
```
┌─────────────────────┐
│ 👥 權限管理          │
│                     │
│ 角色權限設定:        │
│                     │
│ 👑 超級管理員        │
│ ✅ 系統管理          │
│ ✅ 用戶管理          │
│ ✅ 菜單管理          │  
│ ✅ 訂單管理          │
│ ✅ 財務報表          │
│ ✅ 系統設定          │
│                     │
│ 👨‍💼 店舖管理員       │
│ ❌ 系統管理          │
│ ✅ 用戶管理          │
│ ✅ 菜單管理          │
│ ✅ 訂單管理          │
│ ✅ 基礎報表          │
│ ❌ 系統設定          │
│                     │
│ 👨‍🍳 營運管理員       │
│ ❌ 系統管理          │
│ ❌ 用戶管理          │
│ ✅ 菜單管理          │
│ ✅ 訂單管理          │
│ ✅ 營運報表          │
│ ❌ 系統設定          │
│                     │
│ [新增角色] [編輯權限] │
│                     │
└─────────────────────┘
```

---

## 📱 8. 響應式設計適配

### 平板橫屏模式
```
┌─────────────────────────────────────────┐
│ 📊 儀表板           👤 王店長    🔔 📧 ⚙️│
│                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ 📈 營業額    │ │ 📋 今日訂單  │ │ 👥 員工狀態  │ │
│ │ NT$ 8,500   │ │ 總計: 142   │ │ 在線: 8人   │ │
│ │ +12% ↗️     │ │ 待處理: 8   │ │ 忙碌: 3人   │ │
│ │             │ │ 完成: 134   │ │ 休息: 2人   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐   │
│ │ 📊 實時營運監控                      │   │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │
│ │ │ 緊急訂單 │ │ 處理中   │ │ 已完成   │ │   │
│ │ │   2筆   │ │   5筆   │ │  134筆  │ │   │
│ │ │ #12354  │ │ #12355  │ │ #12353  │ │   │
│ │ │ 桌7超時 │ │ 桌3製作 │ │ 桌1送達 │ │   │
│ │ │ [處理]  │ │ [查看]  │ │ [歸檔]  │ │   │
│ │ └─────────┘ └─────────┘ └─────────┘ │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔧 API 整合說明

### 管理API端點
```javascript
// 儀表板數據
GET /api/admin/dashboard

// 菜單管理
GET /api/admin/menu
POST /api/admin/menu
PUT /api/admin/menu/{itemId}
DELETE /api/admin/menu/{itemId}

// 用戶管理
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/{userId}

// 訂單管理
GET /api/admin/orders
PUT /api/admin/orders/{orderId}/status

// 報表數據
GET /api/admin/reports/revenue
GET /api/admin/reports/performance
GET /api/admin/reports/satisfaction

// 系統設定
GET /api/admin/settings
PUT /api/admin/settings
```

### 即時數據同步
```javascript
// 訂單即時監控 WebSocket
const orderMonitor = new WebSocket('ws://server/admin/orders/monitor');
orderMonitor.onmessage = (event) => {
  const orderUpdate = JSON.parse(event.data);
  updateOrderDisplay(orderUpdate);
};

// 系統狀態監控
const systemMonitor = new WebSocket('ws://server/admin/system/status');
systemMonitor.onmessage = (event) => {
  const systemStatus = JSON.parse(event.data);
  updateSystemMetrics(systemStatus);
};
```

---

# 🔧 後端系統架構設計

## 🏗️ 技術架構總覽

### 📋 後端技術堆疊
```
┌─────────────────────────────────────────┐
│                前端層                    │
│  🌈 Rainbow Admin UI (HTML/CSS/JS)     │
└─────────────────┬───────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────┴───────────────────────┐
│              API網關層                   │
│  🔐 JWT認證 + 權限控制 + 請求路由        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│              控制器層                    │
│  📋 AdminController + 數據驗證          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│              服務層                      │
│  🔧 9個核心服務 + 業務邏輯處理           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│              資料訪問層                  │
│  🗄️ DAO + JPA/Hibernate                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│              資料庫層                    │
│  📊 PostgreSQL + Redis緩存              │
└─────────────────────────────────────────┘
```

### 🎯 核心設計原則
- **分層架構**: 清晰的職責分離，便於維護和擴展
- **RESTful設計**: 標準化API接口，統一前後端溝通協議
- **微服務準備**: 模組化設計，為未來微服務拆分做準備
- **安全第一**: 多層次安全防護，從認證到資料加密
- **高性能**: Redis緩存 + 資料庫索引優化 + 連接池管理
- **可監控**: 完整的日誌記錄 + 性能監控 + 異常追蹤

---

## 🔗 API接口設計規範

### 🌈 統一回應格式
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    // 業務數據
  },
  "timestamp": "2025-08-21T10:30:00Z",
  "requestId": "uuid-request-id"
}
```

### 🔐 1. 認證管理API

#### 管理員登入
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@ranbow.com",
  "password": "password123",
  "role": "super-admin",
  "rememberMe": true
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "refreshToken": "refresh-token",
    "adminInfo": {
      "id": 1,
      "name": "王店長",
      "email": "admin@ranbow.com",
      "role": "super-admin",
      "permissions": ["MENU_MANAGE", "ORDER_MANAGE", "USER_MANAGE"],
      "avatar": "avatar-url"
    },
    "expiresIn": 7200
  }
}
```

#### 權限驗證
```http
GET /api/admin/auth/verify
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "valid": true,
    "adminInfo": { /* 管理員資訊 */ },
    "permissions": ["MENU_MANAGE", "ORDER_MANAGE"]
  }
}
```

### 📊 2. 儀表板API

#### 獲取儀表板數據
```http
GET /api/admin/dashboard/overview
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "revenue": {
      "today": 127500,
      "yesterday": 119300,
      "growthRate": 6.9,
      "targetProgress": 85
    },
    "orders": {
      "total": 142,
      "pending": 8,
      "processing": 5,
      "completed": 129,
      "cancelled": 0,
      "growthRate": 8.3
    },
    "customers": {
      "active": 89,
      "vip": 12,
      "regular": 77,
      "growthRate": 15.2
    },
    "staff": {
      "online": 8,
      "busy": 3,
      "break": 2,
      "total": 13
    }
  }
}
```

#### 即時訂單監控WebSocket
```javascript
// WebSocket連接
const orderMonitor = new WebSocket('ws://server/api/admin/orders/realtime');

// 訊息格式
{
  "type": "ORDER_UPDATE",
  "data": {
    "orderId": "12354",
    "status": "URGENT",
    "tableNumber": 7,
    "customerName": "陳先生",
    "items": [/* 訂單項目 */],
    "totalAmount": 630,
    "overtime": 13,
    "assignedChef": "李師傅"
  }
}
```

### 🍽️ 3. 菜單管理API

#### 獲取菜單列表
```http
GET /api/admin/menu?category=main&status=available&page=1&size=20
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "招牌牛排",
        "englishName": "Signature Steak",
        "category": "main",
        "price": 380,
        "description": "選用優質牛肉...",
        "imageUrl": "/images/steak.jpg",
        "status": "available",
        "stock": "sufficient",
        "todaySales": 28,
        "rating": 4.8,
        "preparationTime": 25,
        "spiceLevel": 0,
        "isRecommended": true,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-08-21T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 45,
      "totalPages": 3
    },
    "statistics": {
      "total": 45,
      "available": 42,
      "outOfStock": 3,
      "thisWeekAdded": 2
    }
  }
}
```

#### 創建/更新菜品
```http
POST /api/admin/menu
PUT /api/admin/menu/{itemId}
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data

{
  "name": "招牌牛排",
  "englishName": "Signature Steak",
  "category": "main",
  "price": 380,
  "description": "選用優質牛肉，搭配主廚特製醬汁",
  "preparationTime": 25,
  "spiceLevel": 0,
  "isRecommended": true,
  "isAvailable": true,
  "image": [File]
}
```

#### 批量操作
```http
POST /api/admin/menu/batch
Authorization: Bearer {jwt-token}

{
  "action": "UPDATE_PRICE",
  "itemIds": [1, 2, 3],
  "params": {
    "adjustmentType": "PERCENTAGE",
    "adjustmentValue": 10
  }
}
```

### 📋 4. 訂單管理API

#### 獲取訂單列表
```http
GET /api/admin/orders?status=urgent&date=2024-08-21&page=1&size=50
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "12354",
        "tableNumber": 7,
        "customerName": "陳先生",
        "customerPhone": "0912-345-678",
        "status": "URGENT",
        "totalAmount": 630,
        "items": [
          {
            "itemId": 1,
            "itemName": "招牌牛排",
            "quantity": 1,
            "price": 380,
            "specialRequests": "七分熟",
            "status": "COMPLETED"
          }
        ],
        "timeline": [
          {
            "timestamp": "2024-08-21T14:25:00Z",
            "status": "ORDERED",
            "message": "下單完成"
          }
        ],
        "orderedAt": "2024-08-21T14:25:00Z",
        "expectedAt": "2024-08-21T14:50:00Z",
        "completedAt": null,
        "overtimeMinutes": 13,
        "assignedChef": "李師傅"
      }
    ],
    "statistics": {
      "total": 142,
      "urgent": 2,
      "processing": 5,
      "completed": 134,
      "cancelled": 1
    }
  }
}
```

#### 更新訂單狀態
```http
PUT /api/admin/orders/{orderId}/status
Authorization: Bearer {jwt-token}

{
  "status": "PROCESSING",
  "assignedChef": "李師傅",
  "estimatedTime": 20,
  "notes": "開始製作"
}
```

### 👥 5. 用戶管理API

#### 獲取用戶列表
```http
GET /api/admin/users?type=customer&status=active&page=1&size=20
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1001,
        "name": "王小明",
        "email": "wang@email.com",
        "phone": "0912-345-678",
        "type": "CUSTOMER",
        "memberLevel": "VIP",
        "totalSpent": 12000,
        "orderCount": 45,
        "joinedAt": "2024-01-15T10:00:00Z",
        "lastActive": "2024-08-21T09:30:00Z",
        "status": "ACTIVE"
      }
    ],
    "statistics": {
      "total": 1247,
      "thisWeekAdded": 28,
      "activeUsers": 892,
      "vipMembers": 79
    }
  }
}
```

#### 員工管理
```http
GET /api/admin/staff/{staffId}
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "id": "ST003",
    "name": "李志明",
    "position": "主廚",
    "department": "廚房",
    "phone": "0912-333-444",
    "joinedAt": "2023-08-15T10:00:00Z",
    "performance": {
      "monthlyOrders": 658,
      "avgCompletionTime": 18,
      "customerRating": 4.8,
      "tardyCount": 0,
      "leaveCount": 2
    },
    "permissions": ["VIEW_ORDERS", "UPDATE_ORDER_STATUS"],
    "workHours": {
      "thisMonth": 180,
      "schedule": "09:00-18:00"
    },
    "status": "ACTIVE"
  }
}
```

### 📈 6. 報表分析API

#### 營收分析
```http
GET /api/admin/reports/revenue?period=month&date=2024-08
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 127500,
      "previousPeriod": 119300,
      "growthRate": 6.9,
      "targetAchievement": 85
    },
    "dailyTrend": [
      {
        "date": "2024-08-01",
        "revenue": 4200,
        "orders": 28
      }
    ],
    "topItems": [
      {
        "itemId": 1,
        "itemName": "招牌牛排",
        "revenue": 8900,
        "quantity": 35
      }
    ]
  }
}
```

#### 運營效率分析
```http
GET /api/admin/reports/efficiency
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "averageProcessingTime": {
      "orderToCompletion": 22,
      "kitchenPreparation": 18,
      "waitingTime": 4,
      "targetTime": 20,
      "efficiency": "B+"
    },
    "completionRate": {
      "successful": 94.2,
      "customerCancelled": 3.1,
      "kitchenIssues": 2.7
    },
    "staffEfficiency": [
      {
        "staffId": "ST003",
        "name": "李師傅",
        "ordersPerHour": 12,
        "efficiency": "excellent"
      }
    ]
  }
}
```

### ⚙️ 7. 系統設定API

#### 獲取系統設定
```http
GET /api/admin/settings
Authorization: Bearer {jwt-token}

Response:
{
  "success": true,
  "data": {
    "restaurant": {
      "name": "Ranbow Restaurant",
      "englishName": "Rainbow Restaurant",
      "phone": "02-1234-5678",
      "address": "台北市...",
      "businessHours": "11:00-22:00",
      "closedDays": []
    },
    "pricing": {
      "currency": "TWD",
      "taxRate": 10,
      "serviceCharge": 0,
      "tipEnabled": false
    },
    "notifications": {
      "newOrders": true,
      "stockAlerts": true,
      "systemErrors": true,
      "dailyReports": true
    }
  }
}
```

---

## 🗄️ 資料庫設計

### 📋 核心資料表結構

#### 1. 管理員用戶表 (admin_users)
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super-admin', 'store-manager', 'operations-manager')),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

#### 2. 管理員會話表 (admin_sessions)
```sql
CREATE TABLE admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token_hash);
```

#### 3. 角色權限表 (admin_permissions)
```sql
CREATE TABLE admin_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_admin_permissions_role_permission ON admin_permissions(role, permission);

-- 初始權限數據
INSERT INTO admin_permissions (role, permission) VALUES
('super-admin', 'SYSTEM_MANAGE'),
('super-admin', 'USER_MANAGE'),
('super-admin', 'MENU_MANAGE'),
('super-admin', 'ORDER_MANAGE'),
('super-admin', 'REPORT_VIEW'),
('super-admin', 'SETTINGS_MANAGE'),
('store-manager', 'USER_MANAGE'),
('store-manager', 'MENU_MANAGE'),
('store-manager', 'ORDER_MANAGE'),
('store-manager', 'REPORT_VIEW'),
('operations-manager', 'MENU_MANAGE'),
('operations-manager', 'ORDER_MANAGE'),
('operations-manager', 'REPORT_VIEW');
```

#### 4. 菜單項目表 (menu_items)
```sql
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    english_name VARCHAR(200),
    category VARCHAR(50) NOT NULL CHECK (category IN ('appetizer', 'main', 'dessert', 'beverage')),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    preparation_time INTEGER DEFAULT 20, -- 分鐘
    spice_level INTEGER DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
    is_recommended BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    stock_status VARCHAR(20) DEFAULT 'sufficient' CHECK (stock_status IN ('sufficient', 'low', 'out')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_recommended ON menu_items(is_recommended);
```

#### 5. 訂單表 (orders)
```sql
CREATE TABLE orders (
    id VARCHAR(20) PRIMARY KEY, -- #12354格式
    user_id INTEGER REFERENCES users(id),
    table_number INTEGER,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'URGENT')),
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    special_requests TEXT,
    assigned_chef VARCHAR(100),
    estimated_completion_time TIMESTAMP,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table_number ON orders(table_number);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);
CREATE INDEX idx_orders_assigned_chef ON orders(assigned_chef);
```

#### 6. 訂單項目表 (order_items)
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    item_name VARCHAR(200) NOT NULL, -- 冗余存儲，防止菜品修改影響歷史訂單
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
```

#### 7. 訂單時間軸表 (order_timeline)
```sql
CREATE TABLE order_timeline (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    operator_type VARCHAR(20) DEFAULT 'SYSTEM' CHECK (operator_type IN ('SYSTEM', 'ADMIN', 'CHEF', 'CUSTOMER')),
    operator_id INTEGER, -- 可以關聯到admin_users或其他用戶表
    operator_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX idx_order_timeline_created_at ON order_timeline(created_at);
```

#### 8. 員工表 (staff)
```sql
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(20) UNIQUE NOT NULL, -- ST003格式
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE')),
    work_schedule VARCHAR(100), -- "09:00-18:00"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_staff_staff_id ON staff(staff_id);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_status ON staff(status);
```

#### 9. 員工績效表 (staff_performance)
```sql
CREATE TABLE staff_performance (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    orders_handled INTEGER DEFAULT 0,
    avg_completion_time INTEGER, -- 分鐘
    customer_rating DECIMAL(3,2),
    tardy_count INTEGER DEFAULT 0,
    leave_days INTEGER DEFAULT 0,
    work_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_staff_performance_staff_month_year ON staff_performance(staff_id, month, year);
```

#### 10. 系統設定表 (system_settings)
```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_system_settings_category_key ON system_settings(category, key);

-- 初始設定數據
INSERT INTO system_settings (category, key, value, description) VALUES
('restaurant', 'name', 'Ranbow Restaurant', '餐廳名稱'),
('restaurant', 'english_name', 'Rainbow Restaurant', '餐廳英文名稱'),
('restaurant', 'phone', '02-1234-5678', '聯絡電話'),
('restaurant', 'address', '台北市信義區...', '餐廳地址'),
('restaurant', 'business_hours', '11:00-22:00', '營業時間'),
('pricing', 'currency', 'TWD', '貨幣單位'),
('pricing', 'tax_rate', '10', '稅率百分比'),
('pricing', 'service_charge', '0', '服務費百分比'),
('notifications', 'new_orders', 'true', '新訂單通知'),
('notifications', 'stock_alerts', 'true', '庫存預警'),
('notifications', 'system_errors', 'true', '系統異常通知'),
('notifications', 'daily_reports', 'true', '營收日報');
```

#### 11. 審計日誌表 (audit_logs)
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50),
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    operator_type VARCHAR(20) DEFAULT 'ADMIN' CHECK (operator_type IN ('ADMIN', 'SYSTEM', 'CUSTOMER')),
    operator_id INTEGER,
    operator_name VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_operator ON audit_logs(operator_type, operator_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### 12. 報表快照表 (report_snapshots)
```sql
CREATE TABLE report_snapshots (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_report_snapshots_type_date ON report_snapshots(report_type, report_date);
```

### 🔗 關聯關係設計

```sql
-- 外鍵約束設計
ALTER TABLE admin_sessions ADD CONSTRAINT fk_admin_sessions_admin_id 
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT fk_order_items_menu_item_id 
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT;

ALTER TABLE order_timeline ADD CONSTRAINT fk_order_timeline_order_id 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE staff_performance ADD CONSTRAINT fk_staff_performance_staff_id 
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;
```

---

## 🔧 服務層架構設計

### 📋 核心服務類

#### 1. 認證服務 (AdminAuthService)
```java
@Service
@Transactional
public class AdminAuthService {
    
    /**
     * 管理員登入驗證
     */
    public AuthResponse login(LoginRequest request) {
        // 1. 驗證帳號密碼
        // 2. 檢查帳號狀態
        // 3. 載入權限資訊
        // 4. 生成JWT Token
        // 5. 記錄登入日誌
        // 6. 創建會話記錄
    }
    
    /**
     * Token驗證與刷新
     */
    public TokenValidationResponse validateToken(String token) {
        // 1. 解析JWT Token
        // 2. 檢查會話有效性
        // 3. 載入最新權限
        // 4. 更新最後活動時間
    }
    
    /**
     * 權限檢查
     */
    public boolean hasPermission(String adminId, String permission) {
        // 1. 查詢管理員角色
        // 2. 檢查角色權限
        // 3. 緩存權限資訊
    }
    
    /**
     * 登出處理
     */
    public void logout(String token) {
        // 1. 撤銷Token
        // 2. 清除會話
        // 3. 記錄登出日誌
    }
}
```

#### 2. 儀表板服務 (AdminDashboardService)
```java
@Service
public class AdminDashboardService {
    
    /**
     * 獲取儀表板總覽數據
     */
    public DashboardOverview getDashboardOverview() {
        // 1. 並行查詢各項指標
        // 2. 計算成長率和趨勢
        // 3. 組裝數據結構
        // 4. 緩存結果數據
    }
    
    /**
     * 即時訂單監控數據
     */
    public RealtimeOrderData getRealtimeOrders() {
        // 1. 查詢緊急訂單
        // 2. 查詢處理中訂單
        // 3. 計算超時訂單
        // 4. 推送WebSocket更新
    }
    
    /**
     * 獲取系統警報
     */
    public List<SystemAlert> getSystemAlerts() {
        // 1. 檢查超時訂單
        // 2. 檢查庫存預警
        // 3. 檢查系統異常
        // 4. 生成改善建議
    }
}
```

#### 3. 菜單管理服務 (AdminMenuService)
```java
@Service
@Transactional
public class AdminMenuService {
    
    /**
     * 分頁查詢菜單項目
     */
    public PageResult<MenuItem> getMenuItems(MenuQueryRequest request) {
        // 1. 構建動態查詢條件
        // 2. 執行分頁查詢
        // 3. 載入統計數據
        // 4. 組裝回應結果
    }
    
    /**
     * 創建菜品
     */
    public MenuItem createMenuItem(CreateMenuItemRequest request) {
        // 1. 驗證菜品資料
        // 2. 處理圖片上傳
        // 3. 儲存菜品資訊
        // 4. 記錄操作日誌
        // 5. 清除相關緩存
    }
    
    /**
     * 批量操作菜品
     */
    public BatchOperationResult batchOperateItems(BatchOperationRequest request) {
        // 1. 驗證操作權限
        // 2. 並行處理操作
        // 3. 記錄操作結果
        // 4. 發送變更通知
    }
    
    /**
     * 圖片上傳處理
     */
    public String uploadMenuImage(MultipartFile imageFile) {
        // 1. 驗證圖片格式
        // 2. 壓縮圖片大小
        // 3. 上傳到CDN
        // 4. 返回圖片URL
    }
}
```

#### 4. 訂單管理服務 (AdminOrderService)
```java
@Service
@Transactional
public class AdminOrderService {
    
    /**
     * 分頁查詢訂單
     */
    public PageResult<Order> getOrders(OrderQueryRequest request) {
        // 1. 構建查詢條件
        // 2. 執行分頁查詢
        // 3. 載入關聯數據
        // 4. 計算統計指標
    }
    
    /**
     * 更新訂單狀態
     */
    public Order updateOrderStatus(String orderId, UpdateStatusRequest request) {
        // 1. 查詢訂單資訊
        // 2. 驗證狀態轉換
        // 3. 更新訂單狀態
        // 4. 記錄時間軸
        // 5. 推送即時通知
        // 6. 更新員工績效
    }
    
    /**
     * 問題訂單處理
     */
    public void handleProblemOrder(String orderId, ProblemHandlingRequest request) {
        // 1. 記錄問題類型
        // 2. 執行補償方案
        // 3. 發送道歉訊息
        // 4. 更新客戶記錄
        // 5. 生成問題報告
    }
    
    /**
     * 訂單超時檢查
     */
    @Scheduled(fixedRate = 60000) // 每分鐘檢查
    public void checkOvertimeOrders() {
        // 1. 查詢超時訂單
        // 2. 標記緊急狀態
        // 3. 發送警報通知
        // 4. 推送即時更新
    }
}
```

#### 5. 用戶管理服務 (AdminUserService)
```java
@Service
@Transactional
public class AdminUserService {
    
    /**
     * 分頁查詢用戶
     */
    public PageResult<User> getUsers(UserQueryRequest request) {
        // 1. 根據類型查詢
        // 2. 載入統計數據
        // 3. 計算用戶價值
    }
    
    /**
     * 員工管理
     */
    public StaffDetail getStaffDetail(String staffId) {
        // 1. 查詢員工基本資料
        // 2. 載入績效數據
        // 3. 計算效率指標
        // 4. 載入權限設定
    }
    
    /**
     * 會員等級管理
     */
    public void updateMemberLevel(Integer userId, String newLevel) {
        // 1. 驗證等級規則
        // 2. 更新會員等級
        // 3. 發送升級通知
        // 4. 記錄變更日誌
    }
}
```

#### 6. 報表服務 (AdminReportService)
```java
@Service
public class AdminReportService {
    
    /**
     * 營收分析報表
     */
    public RevenueReport getRevenueReport(String period, String date) {
        // 1. 查詢營收數據
        // 2. 計算成長趨勢
        // 3. 分析熱門菜品
        // 4. 緩存報表結果
    }
    
    /**
     * 運營效率分析
     */
    public EfficiencyReport getEfficiencyReport() {
        // 1. 分析平均處理時間
        // 2. 計算完成率
        // 3. 評估員工效率
        // 4. 生成改善建議
    }
    
    /**
     * 客戶滿意度分析
     */
    public SatisfactionReport getSatisfactionReport() {
        // 1. 分析評分分布
        // 2. 提取評論關鍵字
        // 3. 識別改善重點
        // 4. 生成行動計劃
    }
    
    /**
     * 定時生成報表快照
     */
    @Scheduled(cron = "0 0 1 * * ?") // 每日1點執行
    public void generateDailySnapshot() {
        // 1. 生成各類報表
        // 2. 儲存快照數據
        // 3. 發送日報郵件
    }
}
```

#### 7. 系統設定服務 (AdminSystemService)
```java
@Service
@Transactional
public class AdminSystemService {
    
    /**
     * 獲取系統設定
     */
    public SystemSettings getSystemSettings() {
        // 1. 查詢設定項目
        // 2. 按分類組織
        // 3. 載入預設值
        // 4. 緩存設定數據
    }
    
    /**
     * 更新系統設定
     */
    public void updateSettings(UpdateSettingsRequest request) {
        // 1. 驗證設定值
        // 2. 批量更新設定
        // 3. 清除設定緩存
        // 4. 記錄變更日誌
        // 5. 推送設定變更
    }
    
    /**
     * 系統備份
     */
    public BackupResult createBackup() {
        // 1. 導出資料庫
        // 2. 打包系統文件
        // 3. 上傳備份文件
        // 4. 記錄備份信息
    }
    
    /**
     * 系統監控
     */
    public SystemStatus getSystemStatus() {
        // 1. 檢查系統資源
        // 2. 檢查服務狀態
        // 3. 檢查資料庫連接
        // 4. 生成健康報告
    }
}
```

#### 8. 通知服務 (AdminNotificationService)
```java
@Service
public class AdminNotificationService {
    
    /**
     * 發送即時通知
     */
    public void sendRealtimeNotification(NotificationRequest request) {
        // 1. 判斷通知類型
        // 2. 選擇推送管道
        // 3. 發送WebSocket通知
        // 4. 記錄通知日誌
    }
    
    /**
     * 郵件通知
     */
    public void sendEmailNotification(String recipient, String subject, String content) {
        // 1. 構建郵件內容
        // 2. 發送郵件
        // 3. 記錄發送狀態
    }
    
    /**
     * 系統警報
     */
    public void triggerSystemAlert(AlertType type, String message, Object data) {
        // 1. 創建警報記錄
        // 2. 發送即時通知
        // 3. 推送到管理端
        // 4. 記錄處理狀態
    }
}
```

#### 9. WebSocket服務 (AdminWebSocketService)
```java
@Service
public class AdminWebSocketService {
    
    private final Map<String, WebSocketSession> adminSessions = new ConcurrentHashMap<>();
    
    /**
     * 管理員連接
     */
    public void onAdminConnected(String adminId, WebSocketSession session) {
        // 1. 記錄連接會話
        // 2. 發送歡迎訊息
        // 3. 推送待處理通知
    }
    
    /**
     * 廣播訂單更新
     */
    public void broadcastOrderUpdate(OrderUpdateEvent event) {
        // 1. 構建更新訊息
        // 2. 向所有管理員推送
        // 3. 記錄推送結果
    }
    
    /**
     * 發送個人通知
     */
    public void sendPersonalNotification(String adminId, NotificationData data) {
        // 1. 查找管理員會話
        // 2. 發送個人訊息
        // 3. 處理發送失敗
    }
}
```

---

## 🔐 認證與權限系統

### 🎯 JWT Token設計
```java
// JWT Payload結構
{
  "sub": "admin_user_id",
  "name": "王店長",
  "email": "admin@ranbow.com", 
  "role": "super-admin",
  "permissions": ["MENU_MANAGE", "ORDER_MANAGE", "USER_MANAGE"],
  "iat": 1692614400,
  "exp": 1692621600,
  "jti": "session_uuid"
}
```

### 🛡️ 權限控制註解
```java
// 權限檢查註解
@PreAuthorize("hasAdminPermission('MENU_MANAGE')")
public MenuItem createMenuItem(CreateMenuItemRequest request) {
    // 菜單創建邏輯
}

@PreAuthorize("hasAdminRole('super-admin') or hasAdminRole('store-manager')")
public void deleteMenuItem(Integer itemId) {
    // 菜單刪除邏輯
}
```

### 🔒 安全配置
```java
@Configuration
@EnableWebSecurity
public class AdminSecurityConfig {
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
    
    @Bean
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/api/admin/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/auth/login").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

---

## 🚀 部署與運維

### 📦 Docker部署配置
```dockerfile
# 管理員後端Dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app
COPY target/ranbow-admin-backend.jar app.jar

EXPOSE 8087

ENV PROFILES=production
ENV DATABASE_URL=postgresql://192.168.0.114:5432/ranbow_restaurant
ENV REDIS_URL=redis://192.168.0.113:6379

CMD ["java", "-jar", "app.jar", "--spring.profiles.active=${PROFILES}"]
```

### ⚙️ 環境配置
```yaml
# application-production.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME:ranbow_admin}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  redis:
    url: ${REDIS_URL}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 20
        max-idle: 10

  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: 7200 # 2小時
      refresh-expiration: 604800 # 7天

logging:
  level:
    com.ranbow.restaurant.admin: DEBUG
  file:
    name: /var/log/ranbow-admin.log

management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info
  endpoint:
    health:
      show-details: always
```

---

## 🔄 前後端整合

### 📡 前端API調用範例
```javascript
// API Client配置
class AdminApiClient {
    constructor() {
        this.baseURL = 'http://192.168.0.113:8087/api/admin';
        this.token = localStorage.getItem('admin_token');
    }
    
    // 自動添加認證頭
    async request(url, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            }
        };
        
        const response = await fetch(`${this.baseURL}${url}`, config);
        
        if (response.status === 401) {
            // Token過期，重新登入
            this.redirectToLogin();
            return;
        }
        
        return response.json();
    }
    
    // 登入請求
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success) {
            this.token = response.data.token;
            localStorage.setItem('admin_token', this.token);
            localStorage.setItem('admin_info', JSON.stringify(response.data.adminInfo));
        }
        
        return response;
    }
    
    // 儀表板數據
    async getDashboardData() {
        return await this.request('/dashboard/overview');
    }
    
    // 菜單管理
    async getMenuItems(params) {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/menu?${query}`);
    }
    
    // 即時訂單WebSocket
    connectOrderMonitor() {
        const ws = new WebSocket(`ws://192.168.0.113:8087/api/admin/orders/realtime?token=${this.token}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleOrderUpdate(data);
        };
        
        return ws;
    }
}

// 使用範例
const apiClient = new AdminApiClient();

// 登入
await apiClient.login({
    email: 'admin@ranbow.com',
    password: 'password123',
    role: 'super-admin'
});

// 載入儀表板
const dashboardData = await apiClient.getDashboardData();
updateDashboardUI(dashboardData.data);

// 連接即時訂單監控
const orderWS = apiClient.connectOrderMonitor();
```

### 🔄 狀態管理
```javascript
// 全域狀態管理
class AdminStateManager {
    constructor() {
        this.state = {
            admin: null,
            dashboard: null,
            orders: [],
            notifications: []
        };
        this.listeners = new Map();
    }
    
    // 更新狀態
    setState(key, value) {
        this.state[key] = value;
        this.notifyListeners(key, value);
    }
    
    // 監聽狀態變化
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }
    
    // 通知監聽者
    notifyListeners(key, value) {
        const callbacks = this.listeners.get(key) || [];
        callbacks.forEach(callback => callback(value));
    }
}

const stateManager = new AdminStateManager();

// 訂閱狀態變化
stateManager.subscribe('orders', (orders) => {
    updateOrderDisplay(orders);
});

stateManager.subscribe('notifications', (notifications) => {
    updateNotificationBadge(notifications.length);
});
```

---

這個管理員端設計提供了完整的餐廳管理功能，讓管理人員能夠有效監控營運狀況、管理各項資源，並透過數據分析做出明智的商業決策。後端系統採用分層架構設計，確保系統的可維護性、擴展性和安全性。