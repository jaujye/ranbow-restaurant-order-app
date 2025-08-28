import React, { useState, useEffect } from 'react';
import { User, UserCheck, Clock, Shield, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { useStaffAuth, useStaffAuthActions } from '../store/authStore';
import type { Staff, StaffPosition } from '@/shared/types/api';

/**
 * 職位圖標映射
 */
const positionIcons: Record<StaffPosition, React.ComponentType<{ className?: string }>> = {
  MANAGER: Shield,
  SUPERVISOR: UserCheck,
  COOK: User,
  SERVER: User,
  CASHIER: User,
  CLEANER: User,
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
 * QuickSwitchPanel Props
 */
interface QuickSwitchPanelProps {
  className?: string;
  maxDisplay?: number;
  onSwitchSuccess?: (staff: Staff) => void;
  onSwitchError?: (error: string) => void;
}

/**
 * 員工快速切換面板組件
 * 
 * 特性：
 * - 顯示可切換的員工列表
 * - 支援快速切換
 * - 顯示員工狀態（在線/離線）
 * - 權限等級顯示
 * - 自動重新整理
 * - 載入狀態處理
 */
export function QuickSwitchPanel({
  className = '',
  maxDisplay = 6,
  onSwitchSuccess,
  onSwitchError,
}: QuickSwitchPanelProps) {
  const { currentStaff, isLoading } = useStaffAuth();
  const { switchToStaff, getAvailableStaff } = useStaffAuthActions();
  
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /**
   * 載入可切換的員工列表
   */
  const loadAvailableStaff = async () => {
    if (!currentStaff) return;

    setIsLoadingStaff(true);
    setError(null);

    try {
      const staff = await getAvailableStaff(currentStaff.staffId);
      setAvailableStaff(staff);
      setLastRefresh(new Date());
    } catch (error: any) {
      const errorMessage = error.message || '載入可切換員工列表失敗';
      setError(errorMessage);
      console.error('Failed to load available staff:', error);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  /**
   * 處理員工切換
   */
  const handleSwitchStaff = async (targetStaff: Staff) => {
    if (!currentStaff || isSwitching) return;

    setIsSwitching(targetStaff.staffId);
    setError(null);

    try {
      const success = await switchToStaff(targetStaff.staffId);
      
      if (success) {
        onSwitchSuccess?.(targetStaff);
        // 切換成功後重新載入列表
        setTimeout(() => {
          loadAvailableStaff();
        }, 1000);
      } else {
        const errorMessage = `切換至 ${targetStaff.name} 失敗`;
        setError(errorMessage);
        onSwitchError?.(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || `切換至 ${targetStaff.name} 失敗`;
      setError(errorMessage);
      onSwitchError?.(errorMessage);
    } finally {
      setIsSwitching(null);
    }
  };

  /**
   * 手動重新整理
   */
  const handleRefresh = () => {
    loadAvailableStaff();
  };

  /**
   * 組件載入時獲取員工列表
   */
  useEffect(() => {
    if (currentStaff) {
      loadAvailableStaff();
    }
  }, [currentStaff]);

  /**
   * 自動重新整理（每5分鐘）
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStaff && !isLoadingStaff && !isSwitching) {
        loadAvailableStaff();
      }
    }, 5 * 60 * 1000); // 5分鐘

    return () => clearInterval(interval);
  }, [currentStaff, isLoadingStaff, isSwitching]);

  // 如果沒有當前員工，不顯示面板
  if (!currentStaff) {
    return null;
  }

  // 限制顯示數量
  const displayStaff = availableStaff.slice(0, maxDisplay);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 面板標題 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">快速切換員工</h3>
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
              onClick={handleRefresh}
              disabled={isLoadingStaff}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingStaff ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 面板內容 */}
      <div className="p-4">
        {/* 錯誤顯示 */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 載入狀態 */}
        {isLoadingStaff && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-500">載入員工列表...</span>
          </div>
        )}

        {/* 員工列表 */}
        {!isLoadingStaff && (
          <div className="space-y-3">
            {displayStaff.length === 0 ? (
              <div className="text-center py-6">
                <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">目前沒有可切換的員工</p>
              </div>
            ) : (
              displayStaff.map((staff) => {
                const IconComponent = positionIcons[staff.position];
                const isCurrentlySwitching = isSwitching === staff.staffId;
                
                return (
                  <div
                    key={staff.staffId}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    {/* 員工資訊 */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {staff.name}
                          </p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${positionColors[staff.position]}`}>
                            {positionNames[staff.position]}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {staff.department} • {staff.staffId}
                          </p>
                          {staff.isOnDuty && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              在班中
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 切換按鈕 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitchStaff(staff)}
                      disabled={isCurrentlySwitching || isSwitching !== null}
                      className="flex items-center space-x-1 ml-2"
                    >
                      {isCurrentlySwitching ? (
                        <>
                          <LoadingSpinner size="xs" />
                          <span className="text-xs">切換中</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-xs">切換</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 更多員工提示 */}
        {availableStaff.length > maxDisplay && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              還有 {availableStaff.length - maxDisplay} 位員工可切換
            </p>
          </div>
        )}

        {/* 說明文字 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-1">使用說明</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 只能切換到當前在班且有權限的員工</li>
            <li>• 切換後將繼承該員工的權限和設置</li>
            <li>• 系統會自動記錄切換操作</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QuickSwitchPanel;