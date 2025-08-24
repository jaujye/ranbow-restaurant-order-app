import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Maximize2,
  Settings,
  Home,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  useKitchenStore,
  useKitchenSettings,
  useKitchenError,
  startTimerUpdates,
  stopTimerUpdates,
} from '../store/kitchenStore';
import { useKitchenOperations } from '../hooks';
import KitchenDisplay from '../components/KitchenDisplay';

// 組件屬性
interface KitchenDisplayPageProps {
  defaultFullscreen?: boolean;
  autoStart?: boolean;
  showNavigation?: boolean;
}

// 大屏幕控制面板組件
const DisplayControlPanel: React.FC<{
  isVisible: boolean;
  onToggleFullscreen: () => void;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
  isFullscreen: boolean;
}> = ({ 
  isVisible, 
  onToggleFullscreen, 
  onNavigateHome, 
  onOpenSettings,
  isFullscreen 
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 bg-black bg-opacity-75 rounded-lg p-3',
      'flex items-center space-x-2 transition-opacity duration-300',
      'backdrop-blur-sm border border-gray-600'
    )}>
      <button
        onClick={onToggleFullscreen}
        className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        title={isFullscreen ? '退出全屏' : '進入全屏'}
      >
        <Maximize2 className="w-5 h-5" />
      </button>
      
      <button
        onClick={onOpenSettings}
        className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        title="顯示設定"
      >
        <Settings className="w-5 h-5" />
      </button>
      
      <button
        onClick={onNavigateHome}
        className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        title="返回工作站"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>
  );
};

// 連接狀態指示器
const ConnectionIndicator: React.FC = () => {
  const { isConnected } = useKitchenStore();
  const [showIndicator, setShowIndicator] = useState(false);

  // 只在連接狀態改變時短暫顯示
  useEffect(() => {
    setShowIndicator(true);
    const timer = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, [isConnected]);

  if (!showIndicator) return null;

  return (
    <div className={cn(
      'fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg',
      'backdrop-blur-sm border transition-all duration-300',
      isConnected 
        ? 'bg-green-500 bg-opacity-90 text-white border-green-400' 
        : 'bg-red-500 bg-opacity-90 text-white border-red-400'
    )}>
      {isConnected ? (
        <Wifi className="w-5 h-5" />
      ) : (
        <WifiOff className="w-5 h-5" />
      )}
      <span className="font-medium">
        {isConnected ? '已連線' : '連線中斷'}
      </span>
    </div>
  );
};

// 大屏設定面板
const DisplaySettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const settings = useKitchenSettings();
  const { updateSettings } = useKitchenStore();

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[500px] max-w-90vw">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">大屏顯示設定</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* 自動刷新設定 */}
          <div>
            <label className="block text-lg font-medium mb-3">自動刷新間隔</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="30"
                value={localSettings.autoRefreshInterval / 1000}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  autoRefreshInterval: parseInt(e.target.value) * 1000
                })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-lg font-mono w-16 text-center">
                {localSettings.autoRefreshInterval / 1000}秒
              </span>
            </div>
          </div>
          
          {/* 音效設定 */}
          <div>
            <label className="flex items-center space-x-3 text-lg">
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  soundEnabled: e.target.checked
                })}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <span>啟用音效通知</span>
            </label>
          </div>
          
          {/* 音量控制 */}
          {localSettings.soundEnabled && (
            <div>
              <label className="block text-lg font-medium mb-3">音量設定</label>
              <div className="flex items-center space-x-3">
                <span className="text-sm">靜音</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.alertVolume}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    alertVolume: parseFloat(e.target.value)
                  })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm">最大</span>
                <span className="text-lg font-mono w-12 text-center">
                  {Math.round(localSettings.alertVolume * 100)}%
                </span>
              </div>
            </div>
          )}
          
          {/* 逾時警告設定 */}
          <div>
            <label className="block text-lg font-medium mb-3">逾時警告閾值</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="5"
                max="60"
                value={localSettings.overdueThreshold}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  overdueThreshold: parseInt(e.target.value)
                })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-lg font-mono w-16 text-center">
                {localSettings.overdueThreshold}分
              </span>
            </div>
          </div>
          
          {/* 語言設定 */}
          <div>
            <label className="block text-lg font-medium mb-3">顯示語言</label>
            <select
              value={localSettings.language}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                language: e.target.value as any
              })}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
          
          {/* 顯示選項 */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium">顯示選項</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localSettings.showCustomerNames}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  showCustomerNames: e.target.checked
                })}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <span>顯示客戶姓名</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localSettings.showEstimatedTimes}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  showEstimatedTimes: e.target.checked
                })}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <span>顯示預估時間</span>
            </label>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-lg border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存設定
          </button>
        </div>
      </div>
    </div>
  );
};

// 錯誤覆蓋層
const ErrorOverlay: React.FC<{
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-red-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-12 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">系統錯誤</h2>
        <p className="text-gray-700 mb-8">{error}</p>
        
        <div className="flex space-x-4">
          <button
            onClick={onDismiss}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            忽略
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重試
          </button>
        </div>
      </div>
    </div>
  );
};

// 主大屏顯示頁面組件
export const KitchenDisplayPage: React.FC<KitchenDisplayPageProps> = ({
  defaultFullscreen = false,
  autoStart = true,
  showNavigation = true,
}) => {
  const navigate = useNavigate();
  const { displayId } = useParams<{ displayId?: string }>();
  
  const { 
    isFullscreen,
    toggleFullscreen,
    fetchOrders,
    clearError,
  } = useKitchenStore();
  
  const error = useKitchenError();
  const { refreshAllData } = useKitchenOperations();
  
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mouseInactive, setMouseInactive] = useState(false);

  // 滑鼠不活動計時器
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetMouseTimer = () => {
      setMouseInactive(false);
      setShowControls(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setMouseInactive(true);
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetMouseTimer();
    const handleMouseEnter = () => resetMouseTimer();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    // 初始顯示控制
    resetMouseTimer();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(timeout);
    };
  }, []);

  // 初始化
  useEffect(() => {
    // 啟動計時器更新
    startTimerUpdates();
    
    // 自動開始全屏
    if (defaultFullscreen && !isFullscreen) {
      toggleFullscreen();
    }
    
    // 自動開始數據載入
    if (autoStart) {
      fetchOrders();
    }

    return () => {
      stopTimerUpdates();
    };
  }, []);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'F11':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey) {
            event.preventDefault();
            refreshAllData();
          }
          break;
        case 's':
        case 'S':
          if (event.ctrlKey) {
            event.preventDefault();
            setShowSettings(true);
          }
          break;
        case 'h':
        case 'H':
          if (event.ctrlKey && showNavigation) {
            event.preventDefault();
            navigate('/staff/kitchen');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, toggleFullscreen, refreshAllData, navigate, showNavigation]);

  const handleNavigateHome = () => {
    if (showNavigation) {
      navigate('/staff/kitchen');
    }
  };

  const handleRetryError = () => {
    clearError();
    refreshAllData();
  };

  const handleDismissError = () => {
    clearError();
  };

  return (
    <div className={cn(
      'relative',
      mouseInactive && 'cursor-none'
    )}>
      {/* 主要顯示內容 */}
      <KitchenDisplay
        autoRefresh={true}
        refreshInterval={5000}
        showControls={false}
        defaultFullscreen={defaultFullscreen}
      />

      {/* 控制面板 */}
      {showNavigation && (
        <DisplayControlPanel
          isVisible={showControls}
          onToggleFullscreen={toggleFullscreen}
          onNavigateHome={handleNavigateHome}
          onOpenSettings={() => setShowSettings(true)}
          isFullscreen={isFullscreen}
        />
      )}

      {/* 連接狀態指示器 */}
      <ConnectionIndicator />

      {/* 設定面板 */}
      <DisplaySettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* 錯誤覆蓋層 */}
      {error && (
        <ErrorOverlay
          error={error}
          onRetry={handleRetryError}
          onDismiss={handleDismissError}
        />
      )}

      {/* 快捷鍵提示 */}
      {showControls && !isFullscreen && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white rounded-lg p-3 text-sm backdrop-blur-sm">
          <div className="space-y-1">
            <div><kbd className="bg-gray-700 px-1 rounded">F11</kbd> 全屏切換</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+R</kbd> 刷新數據</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+S</kbd> 設定</div>
            {showNavigation && (
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+H</kbd> 返回工作站</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplayPage;