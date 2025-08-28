import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Badge, 
  Clock, 
  TrendingUp, 
  Bell, 
  Settings, 
  LogOut,
  Edit3,
  Calendar,
  DollarSign,
  Award,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { useStaffAuth, useStaffAuthActions } from '../store/authStore';
import type { StaffProfile, StaffPosition, StaffShift } from '@/shared/types/api';

/**
 * 職位顏色映射
 */
const positionColors: Record<StaffPosition, string> = {
  MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
  SUPERVISOR: 'bg-blue-100 text-blue-800 border-blue-200',
  COOK: 'bg-green-100 text-green-800 border-green-200',
  SERVER: 'bg-orange-100 text-orange-800 border-orange-200',
  CASHIER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CLEANER: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * 職位名稱映射
 */
const positionNames: Record<StaffPosition, string> = {
  MANAGER: '經理',
  SUPERVISOR: '主管',
  COOK: '廚師',
  SERVER: '服務員',
  CASHIER: '收銀員',
  CLEANER: '清潔員',
};

/**
 * 班次名稱映射
 */
const shiftNames: Record<StaffShift, string> = {
  MORNING: '早班',
  AFTERNOON: '午班',
  EVENING: '晚班',
  NIGHT: '夜班',
};

/**
 * StaffProfileCard Props
 */
interface StaffProfileCardProps {
  className?: string;
  showActions?: boolean;
  showStatistics?: boolean;
  onEditProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

/**
 * 統計數據項目組件
 */
interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  suffix?: string;
}

function StatItem({ icon: Icon, label, value, color, suffix = '' }: StatItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">
          {value}{suffix}
        </p>
      </div>
    </div>
  );
}

/**
 * 員工個人資料卡片組件
 * 
 * 特性：
 * - 顯示員工基本資訊
 * - 今日統計數據
 * - 未讀通知數量
 * - 操作按鈕（編輯、設定、登出）
 * - 自動重新整理
 * - 響應式設計
 */
export function StaffProfileCard({
  className = '',
  showActions = true,
  showStatistics = true,
  onEditProfile,
  onSettings,
  onLogout,
}: StaffProfileCardProps) {
  const { currentStaff, staffProfile, isLoading } = useStaffAuth();
  const { loadProfile, logout } = useStaffAuthActions();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /**
   * 重新載入個人資料
   */
  const handleRefreshProfile = async () => {
    if (!currentStaff || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await loadProfile(currentStaff.staffId);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * 處理登出
   */
  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      await logout();
      onLogout?.();
    }
  };

  /**
   * 自動重新整理個人資料（每10分鐘）
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStaff && !isRefreshing) {
        handleRefreshProfile();
      }
    }, 10 * 60 * 1000); // 10分鐘

    return () => clearInterval(interval);
  }, [currentStaff, isRefreshing]);

  // 如果沒有當前員工，顯示載入狀態
  if (!currentStaff) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-500">載入個人資料...</span>
        </div>
      </div>
    );
  }

  const profile = staffProfile || currentStaff;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 卡片標題 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">個人資料</h3>
          </div>
          <div className="flex items-center space-x-2">
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                <Clock className="h-3 w-3 inline mr-1" />
                {lastRefresh.toLocaleTimeString('zh-TW', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="p-4">
        {/* 基本資訊 */}
        <div className="flex items-start space-x-4 mb-6">
          {/* 頭像 */}
          <div className="flex-shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center ring-2 ring-gray-200">
                <User className="h-8 w-8 text-gray-600" />
              </div>
            )}
            {/* 在線狀態指示器 */}
            {profile.isOnDuty && (
              <div className="absolute -mt-4 ml-12">
                <div className="h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            )}
          </div>

          {/* 個人資訊 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-lg font-semibold text-gray-900">{profile.name}</h4>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${positionColors[profile.position]}`}>
                {positionNames[profile.position]}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Badge className="h-4 w-4 mr-2" />
                <span>{profile.staffId} • {profile.department}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{shiftNames[profile.shift]}</span>
                {profile.isOnDuty && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    在班中
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 通知提醒 */}
        {staffProfile?.unreadNotifications > 0 && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                您有 <span className="font-semibold">{staffProfile.unreadNotifications}</span> 則未讀通知
              </p>
            </div>
          </div>
        )}

        {/* 今日統計 */}
        {showStatistics && staffProfile?.todayStats && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-900 mb-3">今日統計</h5>
            <div className="grid grid-cols-2 gap-3">
              <StatItem
                icon={TrendingUp}
                label="處理訂單"
                value={staffProfile.todayStats.ordersProcessed}
                color="bg-blue-100 text-blue-600"
                suffix="單"
              />
              <StatItem
                icon={Clock}
                label="平均處理時間"
                value={Math.round(staffProfile.todayStats.averageProcessingTime)}
                color="bg-green-100 text-green-600"
                suffix="分鐘"
              />
              <StatItem
                icon={DollarSign}
                label="營業額"
                value={staffProfile.todayStats.revenue.toLocaleString()}
                color="bg-purple-100 text-purple-600"
                suffix="元"
              />
              <StatItem
                icon={Award}
                label="效率指數"
                value={Math.round(staffProfile.todayStats.efficiency * 100)}
                color="bg-orange-100 text-orange-600"
                suffix="%"
              />
            </div>
          </div>
        )}

        {/* 會話資訊 */}
        {staffProfile?.currentSession && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800 font-medium">當前會話</span>
              </div>
              <span className="text-xs text-blue-600">
                {new Date(staffProfile.currentSession.loginTime).toLocaleString('zh-TW', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} 登入
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              最後活動：{new Date(staffProfile.currentSession.lastActivity).toLocaleTimeString('zh-TW', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {/* 操作按鈕 */}
        {showActions && (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="flex-1"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                編輯資料
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSettings}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                設定
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        )}

        {/* 權限列表 */}
        {profile.permissions && profile.permissions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h6 className="text-xs font-medium text-gray-900 mb-2">權限</h6>
            <div className="flex flex-wrap gap-1">
              {profile.permissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffProfileCard;