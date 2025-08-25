import React, { useState, useEffect } from 'react';
import { 
  Monitor,
  Grid3X3,
  List,
  Settings,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  WorkstationType,
  useKitchenStore,
  useKitchenSettings,
  useKitchenError,
  startTimerUpdates,
  stopTimerUpdates,
} from '../store/kitchenStore';
import { useKitchenQueue, useKitchenOperations } from '../hooks';
import KitchenQueue from '../components/KitchenQueue';
import WorkstationView from '../components/WorkstationView';
import PreparationList from '../components/PreparationList';
import CookingTimer, { MultiTimer } from '../components/CookingTimer';

// 視圖類型
type ViewMode = 'queue' | 'workstation' | 'preparation' | 'timers';

// 佈局類型  
type LayoutMode = 'single' | 'split' | 'grid';

// 組件屬性
interface KitchenWorkstationPageProps {
  defaultWorkstation?: WorkstationType;
  defaultView?: ViewMode;
  defaultLayout?: LayoutMode;
}

// 視圖配置
const viewConfigs = {
  queue: {
    title: '訂單隊列',
    icon: List,
    description: '查看和管理所有待處理訂單',
  },
  workstation: {
    title: '工作站管理',
    icon: Grid3X3,
    description: '管理各工作站狀態和分配',
  },
  preparation: {
    title: '準備清單',
    icon: AlertCircle,
    description: '查看詳細的製作步驟',
  },
  timers: {
    title: '計時器監控',
    icon: TrendingUp,
    description: '監控所有活動計時器',
  },
};

// 快速統計組件
const QuickStats: React.FC = () => {
  const { stats } = useKitchenQueue();
  const { workstations } = useKitchenStore();
  
  const activeWorkstations = workstations.filter(ws => ws.isActive).length;
  const totalCapacity = workstations.reduce((sum, ws) => sum + ws.capacity, 0);
  const currentLoad = workstations.reduce((sum, ws) => sum + ws.currentOrders.length, 0);
  const utilization = totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
      <div className="bg-blue-500 text-white rounded-lg p-2 md:p-4">
        <div className="text-lg md:text-2xl font-bold">{stats.queued}</div>
        <div className="text-xs md:text-sm opacity-90">排隊中</div>
      </div>
      
      <div className="bg-yellow-500 text-white rounded-lg p-2 md:p-4">
        <div className="text-lg md:text-2xl font-bold">{stats.active}</div>
        <div className="text-xs md:text-sm opacity-90">製作中</div>
      </div>
      
      <div className="bg-red-500 text-white rounded-lg p-2 md:p-4">
        <div className="text-lg md:text-2xl font-bold">{stats.overdue}</div>
        <div className="text-xs md:text-sm opacity-90">逾時</div>
      </div>
      
      <div className="bg-green-500 text-white rounded-lg p-2 md:p-4">
        <div className="text-lg md:text-2xl font-bold">{activeWorkstations}</div>
        <div className="text-xs md:text-sm opacity-90">活躍工作站</div>
      </div>
    </div>
  );
};

// 視圖切換器組件
const ViewSwitcher: React.FC<{
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}> = ({ currentView, onViewChange, className }) => {
  return (
    <div className={cn('flex space-x-2', className)}>
      {Object.entries(viewConfigs).map(([key, config]) => {
        const IconComponent = config.icon;
        const isActive = currentView === key;
        
        return (
          <button
            key={key}
            onClick={() => onViewChange(key as ViewMode)}
            className={cn(
              'flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 rounded-lg transition-colors text-sm',
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
            title={config.description}
          >
            <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline text-xs md:text-sm">{config.title}</span>
          </button>
        );
      })}
    </div>
  );
};

// 設定面板組件
const SettingsPanel: React.FC<{
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">廚房設定</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {/* 自動刷新設定 */}
          <div>
            <label className="block text-sm font-medium mb-2">自動刷新間隔 (秒)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.autoRefreshInterval / 1000}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                autoRefreshInterval: parseInt(e.target.value) * 1000
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          {/* 音效設定 */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  soundEnabled: e.target.checked
                })}
              />
              <span>啟用音效</span>
            </label>
          </div>
          
          {/* 音量設定 */}
          <div>
            <label className="block text-sm font-medium mb-2">音量</label>
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
              className="w-full"
              disabled={!localSettings.soundEnabled}
            />
          </div>
          
          {/* 逾時警告設定 */}
          <div>
            <label className="block text-sm font-medium mb-2">逾時警告 (分鐘)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={localSettings.overdueThreshold}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                overdueThreshold: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          {/* 顯示模式設定 */}
          <div>
            <label className="block text-sm font-medium mb-2">顯示模式</label>
            <select
              value={localSettings.displayMode}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                displayMode: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="workstation">工作站模式</option>
              <option value="unified">統一模式</option>
              <option value="timeline">時間軸模式</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// 主工作站頁面組件
export const KitchenWorkstationPage: React.FC<KitchenWorkstationPageProps> = ({
  defaultWorkstation,
  defaultView = 'queue',
  defaultLayout = 'single',
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>(defaultView);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(defaultLayout);
  const [selectedWorkstation, setSelectedWorkstation] = useState<WorkstationType | null>(defaultWorkstation || null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { refreshOrders } = useKitchenQueue();
  const { refreshAllData, showSuccessNotification } = useKitchenOperations();
  const { isConnected, isLoading } = useKitchenStore();
  const error = useKitchenError();

  // 初始化計時器更新
  useEffect(() => {
    startTimerUpdates();
    return () => stopTimerUpdates();
  }, []);

  // 處理手動刷新
  const handleRefresh = async () => {
    const success = await refreshAllData();
    if (success) {
      setLastRefresh(new Date());
      showSuccessNotification('數據已刷新');
    }
  };

  // 渲染當前視圖
  const renderCurrentView = () => {
    const commonProps = {
      selectedWorkstation,
      onWorkstationSelect: setSelectedWorkstation,
      className: "h-full",
    };

    switch (currentView) {
      case 'queue':
        return (
          <KitchenQueue
            workstationFilter={selectedWorkstation}
            showActions={true}
            compactMode={layoutMode === 'grid'}
          />
        );
        
      case 'workstation':
        return (
          <WorkstationView
            {...commonProps}
            showTimers={true}
            showStats={true}
            compactMode={layoutMode === 'grid'}
          />
        );
        
      case 'preparation':
        return (
          <PreparationList
            workstation={selectedWorkstation}
            showAllSteps={true}
            compactMode={layoutMode === 'grid'}
            showTimer={true}
          />
        );
        
      case 'timers':
        const { orders } = useKitchenQueue({ 
          statusFilter: ['active'],
          workstation: selectedWorkstation 
        });
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">活動計時器</h3>
            {orders.length > 0 ? (
              <MultiTimer
                orderIds={orders.map(o => o.id)}
                size="medium"
                columns={layoutMode === 'grid' ? 4 : 2}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>目前沒有活動的計時器</p>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>未知視圖</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航欄 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900">廚房工作站</h1>
            
            {/* 連接狀態 */}
            <div className={cn(
              'flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm',
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            )}>
              <div className={cn(
                'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )} />
              <span className="hidden sm:inline">{isConnected ? '已連線' : '連線中斷'}</span>
            </div>
            
            {/* 最後更新時間 */}
            <span className="hidden md:inline text-xs md:text-sm text-gray-500">
              最後更新: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center space-x-1 md:space-x-3">
            {/* 視圖切換器 */}
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              className="hidden sm:flex"
            />
            
            {/* 控制按鈕 */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={cn(
                'p-1.5 md:p-2 rounded-lg transition-colors',
                isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
              title="刷新數據"
            >
              <RefreshCw className={cn('w-3 h-3 md:w-4 md:h-4', isLoading && 'animate-spin')} />
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 md:p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              title="設定"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 手機版視圖選擇器 */}
      <div className="sm:hidden px-3 py-2 bg-white border-b border-gray-200">
        <select
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value as ViewMode)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
        >
          {Object.entries(viewConfigs).map(([key, config]) => (
            <option key={key} value={key}>
              {config.title}
            </option>
          ))}
        </select>
      </div>

      {/* 快速統計 */}
      <div className="px-3 md:px-6 py-3 md:py-4">
        <QuickStats />
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="mx-3 md:mx-6 mb-3 md:mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            <span className="text-red-800 font-medium text-sm md:text-base">錯誤:</span>
            <span className="text-red-700 text-sm md:text-base">{error}</span>
          </div>
        </div>
      )}

      {/* 主內容區 */}
      <div className="px-3 md:px-6 pb-3 md:pb-6">
        <div className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6 min-h-[calc(100vh-280px)]',
          layoutMode === 'grid' && 'grid grid-cols-2 gap-3 md:gap-6'
        )}>
          {renderCurrentView()}
        </div>
      </div>

      {/* 設定面板 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default KitchenWorkstationPage;