# 📱 Ranbow Restaurant 響應式設計指南

## 🎯 響應式設計目標

### 核心原則
- **行動優先**: 從手機設計開始，逐步擴展到更大螢幕
- **一致體驗**: 確保所有裝置上的功能和視覺保持一致
- **觸控友好**: 針對觸控操作優化所有互動元素
- **性能優化**: 快速載入與流暢動畫

---

## 📏 斷點設計系統

### 標準斷點
```css
/* 手機版 (默認) */
@media screen and (max-width: 767px) {
  /* Mobile-first 基礎樣式 */
}

/* 平板直向 */
@media screen and (min-width: 768px) and (max-width: 1023px) {
  /* Tablet Portrait */
}

/* 平板橫向 / 小筆電 */
@media screen and (min-width: 1024px) and (max-width: 1279px) {
  /* Tablet Landscape / Small Desktop */
}

/* 桌面版 */
@media screen and (min-width: 1280px) {
  /* Large Desktop */
}

/* 超大螢幕 */
@media screen and (min-width: 1920px) {
  /* Extra Large Desktop */
}
```

### 常見裝置尺寸
```
📱 手機裝置:
- iPhone SE: 375px × 667px
- iPhone 12/13: 390px × 844px
- iPhone 12 Pro Max: 428px × 926px
- Android小機型: 360px × 640px
- Android大機型: 412px × 915px

📱 平板裝置:
- iPad: 768px × 1024px
- iPad Pro 11": 834px × 1194px
- iPad Pro 12.9": 1024px × 1366px
- Android平板: 800px × 1280px

🖥️ 桌面裝置:
- 筆記型電腦: 1366px × 768px
- 標準桌機: 1920px × 1080px
- 4K顯示器: 3840px × 2160px
```

---

## 🎨 響應式佈局策略

### 1. 顧客端響應式佈局

#### 手機版 (320px - 767px)
```css
.container {
  width: 100%;
  padding: 0 16px;
  margin: 0 auto;
}

.menu-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-card {
  width: 100%;
  padding: 16px;
}

/* 底部導航固定 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: space-around;
  background: white;
  border-top: 1px solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### 平板版 (768px - 1023px)
```css
@media screen and (min-width: 768px) {
  .container {
    max-width: 720px;
    padding: 0 24px;
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  /* 側邊欄導航 */
  .layout {
    display: flex;
  }
  
  .sidebar {
    width: 280px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
  }
  
  .main-content {
    margin-left: 280px;
    flex: 1;
  }
}
```

#### 桌面版 (1024px+)
```css
@media screen and (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 0 32px;
  }

  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  /* 懸停效果 */
  .menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
}
```

### 2. 員工端響應式佈局

#### 手機版工作台
```css
/* 緊湊的訂單卡片 */
.order-card-mobile {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.order-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.order-actions button {
  flex: 1;
  min-height: 44px;
}
```

#### 平板橫屏工作台
```css
@media screen and (min-width: 768px) and (orientation: landscape) {
  .kitchen-workspace {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    height: 100vh;
  }

  .order-column {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
  }

  .order-column h3 {
    text-align: center;
    padding: 8px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .urgent-column h3 { background: #ffe6e6; }
  .processing-column h3 { background: #e6f3ff; }
  .waiting-column h3 { background: #f0f8e6; }
}
```

### 3. 管理員端響應式佈局

#### 平板管理介面
```css
@media screen and (min-width: 768px) {
  .admin-dashboard {
    display: grid;
    grid-template-columns: 250px 1fr;
    height: 100vh;
  }

  .admin-sidebar {
    background: #2c3e50;
    color: white;
    padding: 24px 16px;
  }

  .admin-main {
    padding: 24px;
    overflow-y: auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
}
```

#### 桌面版儀表板
```css
@media screen and (min-width: 1024px) {
  .admin-dashboard {
    grid-template-columns: 280px 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .dashboard-charts {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
}
```

---

## 🖱️ 觸控與互動優化

### 觸控目標尺寸
```css
/* 最小觸控目標 44px x 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 推薦觸控目標 48px x 48px */
.button-primary {
  height: 48px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 16px;
}

/* 重要動作按鈕 56px */
.cta-button {
  height: 56px;
  padding: 0 24px;
  font-size: 18px;
  font-weight: 600;
}
```

### 手勢操作支援
```css
/* 滑動操作 */
.swipe-item {
  position: relative;
  overflow: hidden;
}

.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.swipe-item.swiped .swipe-actions {
  transform: translateX(0);
}

/* 長按效果 */
.long-press {
  user-select: none;
  -webkit-touch-callout: none;
}

.long-press:active {
  background-color: rgba(0,0,0,0.05);
}
```

### 下拉刷新
```css
.pull-to-refresh {
  position: relative;
  overflow: hidden;
}

.refresh-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.pull-to-refresh.pulling .refresh-indicator {
  opacity: 1;
}
```

---

## 📱 安全區域處理

### iOS 安全區域
```css
/* 頂部安全區域 (劉海/狀態列) */
.header-safe {
  padding-top: env(safe-area-inset-top);
}

/* 底部安全區域 (Home Indicator) */
.footer-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 左右安全區域 (圓角螢幕) */
.content-safe {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* 全螢幕安全區域 */
.fullscreen-safe {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

### Android 導航列處理
```css
@media screen and (min-height: 600px) {
  .bottom-navigation {
    /* 為虛擬導航鍵預留空間 */
    margin-bottom: 48px;
  }
}

/* 全螢幕手勢導航 */
@supports (display-mode: standalone) {
  .bottom-navigation {
    margin-bottom: 0;
  }
}
```

---

## 🎨 響應式圖片和媒體

### 圖片響應式處理
```css
/* 響應式圖片 */
.responsive-image {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: cover;
}

/* 菜品圖片 */
.menu-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

@media screen and (min-width: 768px) {
  .menu-image {
    height: 240px;
  }
}

@media screen and (min-width: 1024px) {
  .menu-image {
    height: 280px;
  }
}

/* 高解析度顯示器優化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .hero-image {
    background-image: url('hero-image@2x.jpg');
  }
}
```

### 視頻響應式
```css
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## ⚡ 性能優化策略

### CSS 優化
```css
/* 使用 will-change 優化動畫 */
.animated-element {
  will-change: transform;
}

/* 避免佈局重排 */
.smooth-transition {
  transform: translateZ(0); /* 啟用 GPU 加速 */
  transition: transform 0.3s ease;
}

/* 圖片延遲載入 */
.lazy-image {
  opacity: 0;
  transition: opacity 0.3s;
}

.lazy-image.loaded {
  opacity: 1;
}
```

### JavaScript 優化
```javascript
// 視口檢測
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 節流函數優化滾動事件
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 響應式圖片載入
function loadResponsiveImages() {
  const images = document.querySelectorAll('.lazy-image');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}
```

---

## 📋 響應式測試清單

### ✅ 功能測試
- [ ] 所有功能在手機上正常運作
- [ ] 平板橫/直向模式切換流暢
- [ ] 桌面版懸停效果正常
- [ ] 觸控操作回應靈敏
- [ ] 手勢操作(滑動、長按)有效

### ✅ 視覺測試
- [ ] 文字在所有尺寸下清晰可讀
- [ ] 圖片不變形、不模糊
- [ ] 間距和比例協調一致
- [ ] 色彩對比度符合可用性標準
- [ ] 品牌識別在各裝置保持一致

### ✅ 效能測試
- [ ] 頁面載入速度 < 3秒
- [ ] 動畫流暢(60fps)
- [ ] 圖片載入優化
- [ ] JavaScript 執行效能良好
- [ ] 記憶體使用量合理

### ✅ 可用性測試
- [ ] 導航清晰易懂
- [ ] 操作流程邏輯順暢
- [ ] 錯誤訊息明確
- [ ] 載入狀態提示清楚
- [ ] 離線功能(如需要)正常

---

## 🛠️ 開發工具與框架建議

### CSS 框架
```scss
// 推薦使用 Tailwind CSS 或自定義工具類
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

// 或使用 CSS Grid 和 Flexbox
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

### JavaScript 框架
```javascript
// React 響應式 Hook
import { useState, useEffect } from 'react';

function useViewport() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);
  
  return { width, isMobile: width < 768 };
}

// Vue 響應式組合式函數
import { ref, onMounted, onUnmounted } from 'vue';

export function useBreakpoints() {
  const windowWidth = ref(window.innerWidth);
  
  const onWidthChange = () => windowWidth.value = window.innerWidth;
  onMounted(() => window.addEventListener('resize', onWidthChange));
  onUnmounted(() => window.removeEventListener('resize', onWidthChange));
  
  const isMobile = computed(() => windowWidth.value < 768);
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
  const isDesktop = computed(() => windowWidth.value >= 1024);
  
  return { windowWidth, isMobile, isTablet, isDesktop };
}
```

---

這個響應式設計指南確保 Ranbow Restaurant App 在所有裝置上都能提供優秀的用戶體驗，從小螢幕手機到大尺寸桌面顯示器，每個界面都經過精心設計和優化。