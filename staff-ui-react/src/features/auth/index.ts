/**
 * 員工認證模組導出
 * 
 * 統一導出認證相關的所有組件、服務和類型
 */

// Store
export { 
  useStaffAuthStore, 
  useStaffAuth, 
  useStaffAuthActions,
  type StaffAuthResponse 
} from './store/authStore';

// API Services
export { 
  StaffAuthApi, 
  setupAuthInterceptor, 
  httpClient 
} from './services/authApi';

// Components
export { LoginForm } from './components/LoginForm';
export { QuickSwitchPanel } from './components/QuickSwitchPanel';
export { StaffProfileCard } from './components/StaffProfileCard';

// Pages
export { LoginPage } from './pages/LoginPage';
export { ProfilePage } from './pages/ProfilePage';

// Utilities and Hooks
export { default as useAuthGuard } from './hooks/useAuthGuard';
export { default as useAuthSetup } from './hooks/useAuthSetup';

// Re-export types from shared
export type {
  Staff,
  StaffProfile,
  StaffLoginRequest,
  StaffSwitchRequest,
  StaffPosition,
  StaffShift,
} from '@/shared/types/api';