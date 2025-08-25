import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Activity,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Users,
  RefreshCw,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { StaffProfileCard } from '../components/StaffProfileCard';
import { QuickSwitchPanel } from '../components/QuickSwitchPanel';
import { DebugStaffData } from '../components/DebugStaffData';
import { useStaffAuth, useStaffAuthActions, useStaffAuthStore } from '../store/authStore';
import type { Staff } from '@/shared/types/api';

/**
 * 頁面標籤枚舉
 */
enum ProfileTab {
  OVERVIEW = 'overview',
  STATISTICS = 'statistics',
  SETTINGS = 'settings',
  SWITCH = 'switch'
}

/**
 * 標籤配置
 */
const tabConfig = {
  [ProfileTab.OVERVIEW]: {
    label: '個人概覽',
    icon: User,
    description: '查看個人資訊和今日統計'
  },
  [ProfileTab.STATISTICS]: {
    label: '績效統計',
    icon: TrendingUp,
    description: '詳細的工作績效和數據分析'
  },
  [ProfileTab.SETTINGS]: {
    label: '帳戶設定',
    icon: Settings,
    description: '修改個人資訊和系統設定'
  },
  [ProfileTab.SWITCH]: {
    label: '快速切換',
    icon: Users,
    description: '切換到其他員工帳戶'
  }
};

/**
 * 簡化的編輯表單組件
 */
interface EditFormProps {
  staff: Staff;
  onSave: (updates: Partial<Staff>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditForm({ staff, onSave, onCancel, isLoading }: EditFormProps) {
  const [formData, setFormData] = useState({
    name: staff.name,
    email: staff.email,
    phone: staff.phone
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const hasChanges = 
    formData.name !== staff.name ||
    formData.email !== staff.email ||
    formData.phone !== staff.phone;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
          required
        />
      </div>

      <div className="flex space-x-2 pt-2">
        <Button
          type="submit"
          disabled={!hasChanges || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">儲存中...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              儲存變更
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          取消
        </Button>
      </div>
    </form>
  );
}

/**
 * 統計卡片組件
 */
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ icon: Icon, title, value, subtitle, color, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

/**
 * 員工個人資料頁面
 * 
 * 特性：
 * - 分頁式界面設計
 * - 個人資訊管理
 * - 績效統計展示
 * - 快速員工切換
 * - 設定管理
 * - 響應式設計
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const { currentStaff, staffProfile, isLoading } = useStaffAuth();
  const { updateProfile, loadProfile, logout } = useStaffAuthActions();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.OVERVIEW);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * 處理個人資料更新
   */
  const handleUpdateProfile = async (updates: Partial<Staff>) => {
    if (!currentStaff) return;
    
    setIsUpdating(true);
    try {
      const success = await updateProfile(updates);
      if (success) {
        setIsEditing(false);
        // 重新載入個人資料
        await loadProfile(currentStaff.staffId);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 處理登出
   */
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  /**
   * 處理員工切換成功
   */
  const handleSwitchSuccess = (staff: Staff) => {
    console.log('Switched to staff:', staff.name);
  };

  /**
   * 返回上一頁
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  // 載入個人資料和處理重定向
  useEffect(() => {
    console.log('[ProfilePage] Auth state check:', {
      isLoading,
      hasCurrentStaff: !!currentStaff,
      staffId: currentStaff?.staffId,
      hasStaffProfile: !!staffProfile,
      staffName: currentStaff?.name
    });

    // 等待 isLoading 完成，避免在 store rehydration 期間進行判斷
    if (isLoading) {
      console.log('[ProfilePage] Still loading, waiting...');
      return;
    }

    // 如果沒有 currentStaff，重定向到登錄頁
    if (!currentStaff) {
      console.log('[ProfilePage] No currentStaff, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    // 如果有員工但沒有 staffId，檢查是否為 rehydration 問題
    if (!currentStaff.staffId) {
      const { token } = useStaffAuthStore.getState();
      console.log('[ProfilePage] Staff missing staffId:', {
        hasToken: !!token,
        staffName: currentStaff.name,
        tokenLength: token?.length
      });
      
      // 只有在確實沒有 token 的情況下才登出
      if (!token) {
        console.error('[ProfilePage] Current staff missing staffId and token, logging out:', currentStaff);
        logout();
        navigate('/login', { replace: true });
        return;
      }
      
      // 如果有 token，等待 rehydration 完成，不執行登出
      console.log('[ProfilePage] Has token but no staffId, waiting for rehydration...');
      return;
    }

    // 如果有員工和 staffId，但沒有個人資料，載入個人資料
    if (!staffProfile) {
      console.log('[ProfilePage] Loading profile for staffId:', currentStaff.staffId);
      loadProfile(currentStaff.staffId);
    }
  }, [isLoading, currentStaff, staffProfile, navigate, loadProfile, logout]);

  if (isLoading || !currentStaff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">載入個人資料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">個人資料</h1>
                <p className="text-sm text-gray-500">{currentStaff.name} • {currentStaff.staffId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新整理
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 分頁導航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {Object.entries(tabConfig).map(([key, config]) => {
              const tab = key as ProfileTab;
              const Icon = config.icon;
              const isActive = activeTab === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {config.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 個人概覽 */}
        {activeTab === ProfileTab.OVERVIEW && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* 個人資訊卡片 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">基本資訊</h2>
                  {!isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      編輯
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  <EditForm
                    staff={currentStaff}
                    onSave={handleUpdateProfile}
                    onCancel={() => setIsEditing(false)}
                    isLoading={isUpdating}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">員工ID</label>
                        <p className="text-sm text-gray-900">{currentStaff.staffId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                        <p className="text-sm text-gray-900">{currentStaff.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">職位</label>
                        <p className="text-sm text-gray-900">{currentStaff.position}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
                        <p className="text-sm text-gray-900">{currentStaff.department}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-sm text-gray-900">{currentStaff.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                        <p className="text-sm text-gray-900">{currentStaff.phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">工作狀態</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currentStaff.isOnDuty 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currentStaff.isOnDuty ? '在職' : '離線'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 今日統計 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">今日表現</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Activity}
                    title="處理訂單"
                    value={staffProfile?.todayStats?.ordersProcessed || 0}
                    subtitle="今日累計"
                    color="bg-blue-100 text-blue-600"
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatCard
                    icon={Clock}
                    title="平均時間"
                    value={`${Math.round(staffProfile?.todayStats?.averageProcessingTime || 15)}分`}
                    subtitle="每單處理"
                    color="bg-green-100 text-green-600"
                    trend={{ value: 8, isPositive: false }}
                  />
                  <StatCard
                    icon={Award}
                    title="效率指數"
                    value={`${Math.round((staffProfile?.todayStats?.efficiency || 0.85) * 100)}%`}
                    subtitle="工作效率"
                    color="bg-purple-100 text-purple-600"
                    trend={{ value: 5, isPositive: true }}
                  />
                  <StatCard
                    icon={Calendar}
                    title="工作時數"
                    value={`${staffProfile?.todayStats?.totalWorkingHours || 
                           (currentStaff?.isOnDuty ? 8 : 0)}h`}
                    subtitle="今日累計"
                    color="bg-orange-100 text-orange-600"
                  />
                </div>
              </div>
            </div>

            {/* 側邊欄 */}
            <div className="space-y-6">
              <StaffProfileCard
                showActions={true}
                showStatistics={true}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* 績效統計 */}
        {activeTab === ProfileTab.STATISTICS && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">績效統計功能</h3>
              <p className="text-gray-600">詳細的統計分析功能正在開發中...</p>
            </div>
          </div>
        )}

        {/* 帳戶設定 */}
        {activeTab === ProfileTab.SETTINGS && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">帳戶設定</h3>
              <p className="text-gray-600">系統設定功能正在開發中...</p>
            </div>
          </div>
        )}

        {/* 快速切換 */}
        {activeTab === ProfileTab.SWITCH && (
          <div className="max-w-2xl mx-auto">
            <QuickSwitchPanel
              maxDisplay={10}
              onSwitchSuccess={handleSwitchSuccess}
              className="shadow-sm"
            />
          </div>
        )}
      </main>
      
      {/* 調試組件 - 智能顯示控制 */}
      <DebugStaffData />
    </div>
  );
}

export default ProfilePage;