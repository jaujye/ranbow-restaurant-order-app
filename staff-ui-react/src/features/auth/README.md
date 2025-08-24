# 員工認證模組 (Staff Authentication Module)

## 概述

這是彩虹餐廳員工作業系統的認證模組，提供完整的員工登入、權限管理、快速切換和個人資料管理功能。

## 🏗️ 架構設計

```
features/auth/
├── components/           # UI 組件
│   ├── LoginForm.tsx        # 登入表單 (工號/Email + 密碼)
│   ├── QuickSwitchPanel.tsx # 快速切換員工面板
│   └── StaffProfileCard.tsx # 員工資料卡片
├── pages/               # 頁面組件
│   ├── LoginPage.tsx        # 完整登入頁面
│   └── ProfilePage.tsx      # 個人資料頁面
├── store/               # 狀態管理
│   ├── authStore.ts         # Zustand 認證狀態
│   └── AuthProvider.tsx     # 認證提供者組件
├── services/            # API 服務
│   └── authApi.ts           # 認證 API 客戶端
├── hooks/               # 自定義 Hooks
│   ├── useAuthGuard.ts      # 權限守衛
│   └── useAuthSetup.ts      # 認證設置
└── index.ts             # 模組導出
```

## 🚀 核心功能

### 1. 員工登入 (LoginForm.tsx)
- 支援工號或Email登入
- React Hook Form + Zod 表單驗證
- 密碼顯示/隱藏切換
- 錯誤處理和載入狀態
- 響應式設計

```typescript
// 使用範例
import { LoginForm } from '@/features/auth';

<LoginForm
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => console.error(error)}
  autoFocus={true}
/>
```

### 2. 快速切換功能 (QuickSwitchPanel.tsx)
- 顯示可切換的員工列表
- 員工狀態顯示（在線/離線）
- 權限等級和職位顯示
- 自動重新整理
- 切換操作追蹤

```typescript
// 使用範例
import { QuickSwitchPanel } from '@/features/auth';

<QuickSwitchPanel
  maxDisplay={5}
  onSwitchSuccess={(staff) => console.log('切換至:', staff.name)}
  onSwitchError={(error) => console.error(error)}
/>
```

### 3. 個人資料顯示 (StaffProfileCard.tsx)
- 員工基本資訊展示
- 今日統計數據
- 未讀通知提醒
- 操作按鈕（編輯、設定、登出）
- 權限列表顯示

```typescript
// 使用範例
import { StaffProfileCard } from '@/features/auth';

<StaffProfileCard
  showActions={true}
  showStatistics={true}
  onEditProfile={() => setEditing(true)}
  onLogout={() => handleLogout()}
/>
```

## 🗃️ 狀態管理 (Zustand)

### authStore.ts
```typescript
// 狀態結構
interface StaffAuthState {
  currentStaff: Staff | null;
  staffProfile: StaffProfile | null;
  token: string | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: StaffLoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  switchToStaff: (targetStaffId: string) => Promise<boolean>;
  refreshAuth: () => Promise<boolean>;
  // ... 其他操作
}

// 使用範例
import { useStaffAuth, useStaffAuthActions } from '@/features/auth';

function MyComponent() {
  const { currentStaff, isAuthenticated, isLoading } = useStaffAuth();
  const { login, logout } = useStaffAuthActions();
  
  // ...
}
```

## 🔗 API 整合

### 支援的後端端點：
- `POST /api/staff/login` - 員工登入
- `POST /api/staff/logout` - 員工登出
- `POST /api/staff/refresh-token` - 刷新 Token
- `POST /api/staff/switch` - 快速切換員工
- `GET /api/staff/available/{staffId}` - 取得可切換員工
- `GET /api/staff/profile/{staffId}` - 取得員工資料
- `PUT /api/staff/profile/{staffId}` - 更新員工資料

### HTTP 客戶端特性：
- 自動 JWT Token 攔截器
- 請求/響應日誌記錄
- 錯誤統一處理
- 請求超時設定
- Token 自動刷新

## 🛡️ 權限系統

### useAuthGuard Hook
```typescript
import { useAuthGuard } from '@/features/auth';

// 基本認證檢查
const { isAuthenticated } = useAuthGuard();

// 職位權限檢查
const { isAuthorized } = useAuthGuard({
  requiredPositions: ['MANAGER', 'SUPERVISOR']
});

// 特定權限檢查
const { isAuthorized } = useAuthGuard({
  requiredPermissions: ['ORDER_MANAGE', 'KITCHEN_ACCESS']
});
```

### ProtectedRoute 組件
```typescript
import { ProtectedRoute } from '@/shared/components/auth';

<ProtectedRoute
  requiredPositions={['MANAGER']}
  requiredPermissions={['ADMIN_ACCESS']}
>
  <AdminPanel />
</ProtectedRoute>
```

## 🎨 UI/UX 特性

### 設計系統：
- TypeScript 類型安全
- Tailwind CSS 響應式設計
- Lucide React 圖標系統
- 彩虹主題品牌化
- 深色模式支援
- 無障礙性 (WCAG) 合規

### 用戶體驗：
- 直觀的表單設計
- 即時驗證反饋
- 載入狀態指示
- 錯誤訊息友善顯示
- 自動焦點管理
- 鍵盤導航支援

## 📱 響應式設計

所有組件都支援多種設備尺寸：
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

使用 Mobile-First 設計策略，從手機版開始設計，逐步增強桌面版體驗。

## 🔧 開發指南

### 環境變數設定：
```env
# .env
VITE_API_URL=http://localhost:8081/api
VITE_WS_URL=ws://localhost:8081/ws
VITE_MOCK_API=false
VITE_DEBUG_MODE=true
```

### 開發模式功能：
- 詳細的錯誤訊息
- API 請求日誌
- 狀態變化追蹤
- 模擬 API 支援

### 測試建議：
1. **單元測試**: 測試 Store actions 和 API 服務
2. **組件測試**: 使用 React Testing Library
3. **整合測試**: 測試認證流程
4. **E2E 測試**: 使用 Playwright 測試用戶流程

## 🛠️ 使用指南

### 1. 在應用中整合：
```typescript
// App.tsx
import { AuthProvider } from '@/features/auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* 其他路由 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 2. 保護路由：
```typescript
// 在路由中使用 ProtectedRoute
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

### 3. 在組件中使用認證：
```typescript
import { useStaffAuth, useStaffAuthActions } from '@/features/auth';

function MyComponent() {
  const { currentStaff, isAuthenticated } = useStaffAuth();
  const { logout } = useStaffAuthActions();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return (
    <div>
      <p>歡迎, {currentStaff?.name}!</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

## 🚨 故障排除

### 常見問題：

1. **Token 過期錯誤**
   - 檢查 `refreshAuth()` 是否正常運作
   - 確認 `refresh_token` 存在且有效

2. **API 連接失敗**
   - 確認 `VITE_API_URL` 環境變數設定正確
   - 檢查後端服務是否運行
   - 查看網路控制台的錯誤訊息

3. **權限問題**
   - 確認用戶具有必要的職位和權限
   - 檢查 `useAuthGuard` 的權限設定

4. **狀態同步問題**
   - 確認 `AuthProvider` 正確包裝應用
   - 檢查 Zustand 狀態是否正確持久化

### 調試技巧：
```typescript
// 啟用調試模式
localStorage.setItem('auth-debug', 'true');

// 查看認證狀態
console.log(useStaffAuthStore.getState());
```

## 🔄 更新日誌

### v2.0.0 (2024-08-24)
- ✨ 完整認證模組實現
- 🏗️ Zustand 狀態管理整合
- 🔐 JWT Token 自動刷新
- 👥 員工快速切換功能
- 📱 響應式設計優化
- 🛡️ 權限守衛系統
- 🎨 彩虹主題 UI 設計

---

**開發團隊**: 彩虹餐廳開發組  
**技術棧**: React 18 + TypeScript + Zustand + Tailwind CSS  
**文件更新**: 2024-08-24