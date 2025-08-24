import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  Play, 
  Monitor, 
  Settings, 
  RefreshCw,
  TestTube,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  KitchenQueue, 
  CookingTimer, 
  WorkstationView, 
  PreparationList, 
  KitchenDisplay 
} from '../components';
import { 
  useKitchenQueue, 
  useCookingTimer, 
  useKitchenOperations 
} from '../hooks';
import { 
  useKitchenStore, 
  WorkstationType,
  startTimerUpdates,
  stopTimerUpdates,
} from '../store/kitchenStore';

// 測試組件選項
const TEST_COMPONENTS = [
  { id: 'queue', name: '訂單隊列', icon: Play },
  { id: 'workstation', name: '工作站管理', icon: Settings },
  { id: 'preparation', name: '準備清單', icon: CheckCircle },
  { id: 'timer', name: '烹飪計時器', icon: AlertTriangle },
  { id: 'display', name: '大屏顯示', icon: Monitor },
];

// 測試統計組件
const TestStats: React.FC = () => {
  const { stats, isLoading, error } = useKitchenQueue();
  const { isConnected, timers } = useKitchenStore();

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-500 text-white rounded-lg p-4">
        <div className="text-2xl font-bold">{stats.queued}</div>
        <div className="text-sm opacity-90">排隊訂單</div>
      </div>
      
      <div className="bg-yellow-500 text-white rounded-lg p-4">
        <div className="text-2xl font-bold">{stats.active}</div>
        <div className="text-sm opacity-90">製作中</div>
      </div>
      
      <div className="bg-green-500 text-white rounded-lg p-4">
        <div className="text-2xl font-bold">{timers.length}</div>
        <div className="text-sm opacity-90">活動計時器</div>
      </div>
      
      <div className="bg-purple-500 text-white rounded-lg p-4">
        <div className="text-2xl font-bold">{isConnected ? 'ON' : 'OFF'}</div>
        <div className="text-sm opacity-90">連接狀態</div>
      </div>
    </div>
  );
};

// 測試操作面板
const TestOperations: React.FC = () => {
  const { 
    refreshAllData, 
    showSuccessNotification, 
    showErrorNotification,
    showWarningNotification,
  } = useKitchenOperations();
  
  const { fetchOrders } = useKitchenStore();

  const handleTestNotifications = () => {
    showSuccessNotification('成功通知測試');
    setTimeout(() => showWarningNotification('警告通知測試'), 1000);
    setTimeout(() => showErrorNotification('錯誤通知測試'), 2000);
  };

  const handleRefreshData = async () => {
    const success = await refreshAllData();
    console.log('數據刷新結果:', success);
  };

  const handleStartTimers = () => {
    startTimerUpdates();
    showSuccessNotification('計時器更新已啟動');
  };

  const handleStopTimers = () => {
    stopTimerUpdates();
    showWarningNotification('計時器更新已停止');
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <TestTube className="w-5 h-5 mr-2" />
        測試操作
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTestNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          測試通知
        </button>
        
        <button
          onClick={handleRefreshData}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          刷新數據
        </button>
        
        <button
          onClick={handleStartTimers}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          啟動計時器
        </button>
        
        <button
          onClick={handleStopTimers}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          停止計時器
        </button>
        
        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        >
          獲取訂單
        </button>
      </div>
    </div>
  );
};

// 主測試頁面組件
export const KitchenTestPage: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState('queue');
  const [selectedWorkstation, setSelectedWorkstation] = useState<WorkstationType | null>(null);

  // 渲染選中的組件
  const renderSelectedComponent = () => {
    const commonProps = {
      className: "h-full min-h-[400px]",
    };

    switch (selectedComponent) {
      case 'queue':
        return (
          <KitchenQueue
            workstationFilter={selectedWorkstation}
            showActions={true}
            compactMode={false}
            maxItems={10}
            {...commonProps}
          />
        );

      case 'workstation':
        return (
          <WorkstationView
            selectedWorkstation={selectedWorkstation}
            onWorkstationSelect={setSelectedWorkstation}
            showTimers={true}
            showStats={true}
            compactMode={false}
            {...commonProps}
          />
        );

      case 'preparation':
        return (
          <PreparationList
            workstation={selectedWorkstation}
            showAllSteps={true}
            compactMode={false}
            showTimer={true}
            {...commonProps}
          />
        );

      case 'timer':
        return (
          <div className={cn('space-y-4', commonProps.className)}>
            <h3 className="text-lg font-bold">計時器測試</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CookingTimer
                orderId={1}
                size="medium"
                showControls={true}
                autoStart={false}
              />
              <CookingTimer
                orderId={2}
                size="small"
                showControls={true}
                autoStart={false}
              />
            </div>
          </div>
        );

      case 'display':
        return (
          <div className={cn('bg-gray-900 rounded-lg', commonProps.className)}>
            <KitchenDisplay
              autoRefresh={false}
              showControls={true}
              defaultFullscreen={false}
            />
          </div>
        );

      default:
        return <div>未知組件</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast 通知容器 */}
      <Toaster position="top-right" />
      
      {/* 標題 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <TestTube className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">廚房系統測試頁面</h1>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>測試環境</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* 主內容 */}
      <div className="p-6">
        {/* 統計概覽 */}
        <TestStats />

        {/* 測試操作 */}
        <TestOperations />

        {/* 組件選擇器 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <h3 className="text-lg font-bold mb-4">選擇測試組件</h3>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {TEST_COMPONENTS.map(component => {
              const IconComponent = component.icon;
              const isSelected = selectedComponent === component.id;
              
              return (
                <button
                  key={component.id}
                  onClick={() => setSelectedComponent(component.id)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded transition-colors',
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{component.name}</span>
                </button>
              );
            })}
          </div>

          {/* 工作站篩選 */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">工作站篩選:</span>
            <select
              value={selectedWorkstation || ''}
              onChange={(e) => setSelectedWorkstation(e.target.value as WorkstationType || null)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">全部工作站</option>
              <option value="cold">冷盤區</option>
              <option value="hot">熱食區</option>
              <option value="grill">燒烤區</option>
              <option value="prep">備料區</option>
              <option value="dessert">甜點區</option>
              <option value="beverage">飲品區</option>
            </select>
          </div>
        </div>

        {/* 組件展示區 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {TEST_COMPONENTS.find(c => c.id === selectedComponent)?.name} - 測試預覽
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新載入</span>
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            {renderSelectedComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenTestPage;