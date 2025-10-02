# Frontend 架構說明文檔

**專案**: Ranbow Restaurant Order Application
**版本**: 1.0.0
**最後更新**: 2025-10-02

---

## 📋 概覽

本專案採用**雙前端架構**，分別為顧客端(Customer UI)和員工端(Staff UI)提供最佳化的用戶體驗。兩個前端系統使用不同的架構模式，這是經過深思熟慮的設計決策。

---

## 🎨 架構對比

### Customer UI - 傳統分層架構 (Layered Architecture)

```
customer-ui-react/src/
├── components/          # UI組件層
│   ├── ui/             # 通用UI組件 (Button, Card, Modal等)
│   ├── layout/         # 佈局組件 (Header, BottomNav, Layout)
│   ├── business/       # 業務組件 (CartItem, MenuItemCard, OrderItem)
│   └── dev/            # 開發工具組件
├── pages/              # 頁面層
│   ├── auth/           # 認證頁面
│   ├── home/           # 首頁
│   ├── menu/           # 菜單頁面
│   ├── cart/           # 購物車
│   ├── checkout/       # 結帳流程
│   ├── payment/        # 付款頁面
│   ├── orders/         # 訂單管理
│   └── profile/        # 個人資料
├── services/           # API服務層
│   └── api/            # RESTful API客戶端
├── store/              # 狀態管理層 (Zustand)
│   ├── authStore.ts
│   ├── cartStore.ts
│   ├── menuStore.ts
│   └── orderStore.ts
├── hooks/              # 自定義React Hooks
├── lib/                # 工具庫 (validations等)
└── utils/              # 通用工具函數
```

**技術棧**:
- React 18 + TypeScript
- Zustand (狀態管理)
- React Router (路由)
- Tailwind CSS (樣式)
- Axios (HTTP客戶端)

---

### Staff UI - Feature-Sliced Design (FSD)

```
staff-ui-react/src/
├── app/                # 應用層
│   ├── App.tsx
│   └── providers.tsx
├── features/           # 功能模塊層
│   ├── auth/           # 認證模塊
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── services/
│   ├── kitchen/        # 廚房顯示系統
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── providers/
│   ├── orders/         # 訂單管理
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── providers/
│   ├── statistics/     # 統計分析
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   ├── notifications/  # 通知系統
│   │   ├── components/
│   │   ├── pages/
│   │   └── types/
│   └── dashboard/      # 儀表板
│       ├── components/
│       └── pages/
├── shared/             # 共享資源層
│   ├── components/     # 共享組件
│   │   ├── ui/
│   │   └── auth/
│   ├── services/       # 共享服務
│   │   ├── api/
│   │   └── websocket/
│   └── stores/         # 共享狀態
│       ├── ThemeProvider.tsx
│       └── NotificationProvider.tsx
├── config/             # 配置層
└── styles/             # 全局樣式
```

**技術棧**:
- React 18 + TypeScript
- TanStack Query (React Query v5)
- React Router
- Tailwind CSS
- WebSocket (即時通訊)

---

## 🎯 架構選擇理由

### Customer UI - 為何選擇傳統分層架構？

#### ✅ 優勢

1. **簡單直觀**
   - 新手開發者易於理解
   - 檔案組織清晰，按技術職責分層
   - 快速定位問題所在層級

2. **適合線性流程**
   - 顧客點餐流程固定: 登入 → 瀏覽菜單 → 加入購物車 → 結帳 → 付款
   - 頁面間依賴關係簡單
   - 狀態管理需求相對單純

3. **快速開發**
   - 減少架構複雜度
   - 專注於業務邏輯實現
   - 適合MVP快速迭代

4. **適用場景**
   ```
   用戶旅程: 單向流程，少量分支
   功能耦合度: 中等 (購物車、訂單、支付相關)
   團隊規模: 小型 (1-3人)
   迭代速度: 快速迭代
   ```

#### ⚠️ 限制

- 當功能模塊增長時，可能出現跨層依賴
- 大型應用中，`components/`和`pages/`目錄可能過於龐大
- 功能間的界限不夠清晰

---

### Staff UI - 為何選擇 Feature-Sliced Design？

#### ✅ 優勢

1. **高度模塊化**
   - 每個功能模塊完全獨立
   - 廚房系統、訂單管理、統計分析各自封裝
   - 減少模塊間耦合

2. **易於擴展**
   - 新增功能只需添加新的feature目錄
   - 不影響現有模塊
   - 符合開放封閉原則(OCP)

3. **團隊協作友好**
   - 不同團隊成員可並行開發不同feature
   - 減少代碼衝突
   - 清晰的責任邊界

4. **適合複雜業務**
   ```
   功能模塊:
   - 🍳 廚房顯示系統 (KDS)
   - 📦 訂單管理 (多狀態流轉)
   - 📊 統計分析 (複雜圖表)
   - 🔔 即時通知 (WebSocket)
   - 👥 員工管理 (權限控制)

   特點: 功能獨立、互不干擾
   ```

5. **維護性佳**
   - 功能刪除只需移除對應feature目錄
   - 重構影響範圍可控
   - 測試隔離性好

#### ⚠️ 複雜度

- 初期學習曲線較陡
- 需要理解FSD架構規範
- 小型功能可能感覺過度工程

---

## 📊 決策矩陣

| 評估維度 | Customer UI (分層架構) | Staff UI (FSD) |
|---------|----------------------|---------------|
| **功能複雜度** | ⭐⭐ 簡單 | ⭐⭐⭐⭐⭐ 複雜 |
| **模塊獨立性** | ⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 高度獨立 |
| **團隊規模** | ⭐⭐ 1-3人 | ⭐⭐⭐⭐ 3-6人 |
| **學習曲線** | ⭐⭐⭐⭐⭐ 平緩 | ⭐⭐ 陡峭 |
| **開發速度** | ⭐⭐⭐⭐⭐ 快速 | ⭐⭐⭐ 中等 |
| **長期維護** | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 優秀 |
| **代碼重用** | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 良好 |
| **測試隔離** | ⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 優秀 |

---

## 🔄 何時考慮重構？

### Customer UI → FSD 的重構時機

**建議重構的情境**:
1. ✅ 顧客端功能模塊超過10個獨立頁面
2. ✅ 出現多個獨立業務領域 (如社交功能、會員系統、遊戲化)
3. ✅ 團隊規模擴展到4人以上
4. ✅ `components/`目錄超過50個組件
5. ✅ 跨層依賴頻繁出現

**目前狀態**: ❌ **不建議重構**
- 當前9個主要頁面，功能邊界清晰
- 分層架構運作良好
- 團隊規模適中

### Staff UI → 分層架構的降級時機

**幾乎不會發生**，除非:
- 功能模塊縮減到3個以下
- 團隊規模減少到1人
- 複雜度大幅降低

---

## 🛠️ 開發指南

### Customer UI 開發規範

```typescript
// ✅ 正確: 按技術職責分層
customer-ui-react/src/
├── components/ui/Button.tsx          // UI組件
├── pages/menu/MenuList.tsx          // 頁面組件
├── services/api/menuService.ts      // API服務
└── store/menuStore.ts               // 狀態管理

// ❌ 錯誤: 不要創建功能目錄
customer-ui-react/src/
└── features/menu/  // ❌ 不符合分層架構
```

**狀態管理**:
- 使用 Zustand 的簡單全局 store
- 每個業務領域一個 store (auth, cart, menu, order)

**API調用**:
- 集中在 `services/api/` 目錄
- 使用 Axios instance 統一配置

---

### Staff UI 開發規範

```typescript
// ✅ 正確: 功能模塊完全獨立
staff-ui-react/src/features/
├── kitchen/
│   ├── components/KitchenDisplay.tsx
│   ├── pages/KitchenDisplayPage.tsx
│   ├── store/kitchenStore.ts
│   └── services/kitchenApi.ts
└── orders/
    ├── components/OrderCard.tsx
    ├── pages/OrdersPage.tsx
    ├── store/ordersStore.ts
    └── providers/OrderWebSocketProvider.tsx

// ❌ 錯誤: 跨feature直接導入組件
// orders/components/OrderCard.tsx
import { KitchenDisplay } from '../../kitchen/components/KitchenDisplay'  // ❌

// ✅ 正確: 通過shared層共享
import { Button } from '@/shared/components/ui/Button'  // ✅
```

**狀態管理**:
- 使用 TanStack Query 管理服務器狀態
- WebSocket 通過 Provider 模式集成

**模塊通訊**:
- 通過 `shared/` 層共享組件和服務
- 使用事件總線或Context進行跨模塊通訊

---

## 📚 參考資源

### Customer UI (分層架構)
- [React 官方文檔 - Thinking in React](https://react.dev/learn/thinking-in-react)
- [Zustand 狀態管理](https://zustand-demo.pmnd.rs/)

### Staff UI (Feature-Sliced Design)
- [Feature-Sliced Design 官方文檔](https://feature-sliced.design/)
- [TanStack Query 文檔](https://tanstack.com/query/latest)

---

## 🎓 團隊培訓建議

### 新成員加入

**Customer UI 團隊**:
1. 學習React基礎 (2-3天)
2. 理解分層架構概念 (1天)
3. 熟悉Zustand狀態管理 (1天)
4. 實戰開發 (1週)

**Staff UI 團隊**:
1. 學習React基礎 (2-3天)
2. 理解FSD架構規範 (2天)
3. 學習TanStack Query (2天)
4. 了解WebSocket集成 (1天)
5. 實戰開發 (2週)

---

## ✅ 總結

### 核心原則

1. **Customer UI**: 簡單優先，快速迭代
2. **Staff UI**: 模塊化優先，長期維護

### 架構一致性

雖然兩個前端使用不同架構，但**底層技術棧保持一致**:
- ✅ React 18 + TypeScript
- ✅ Tailwind CSS
- ✅ React Router
- ✅ 相同的API客戶端配置

### 未來展望

- Customer UI: 保持簡潔，除非功能複雜度顯著增加
- Staff UI: 持續優化模塊邊界，考慮微前端演進

---

**維護者**: Ranbow Development Team
**審查週期**: 每季度審查一次架構適配性
**下次審查**: 2025-12-02
