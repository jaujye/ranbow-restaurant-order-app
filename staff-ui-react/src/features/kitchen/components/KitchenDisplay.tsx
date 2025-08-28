import React, { useState, useEffect, useMemo } from 'react';
import { 
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Timer,
  ChefHat,
  Activity,
  Wifi,
  WifiOff,
  Bell,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  KitchenOrder,
  KitchenOrderStatus,
  WorkstationType,
  useKitchenStore,
  useKitchenOrders,
  useKitchenTimers,
  useKitchenSettings,
  startTimerUpdates,
  stopTimerUpdates,
} from '../store/kitchenStore';

// 組件屬性介面
interface KitchenDisplayProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showControls?: boolean;
  defaultFullscreen?: boolean;
}

// 大屏訂單卡片屬性
interface LargeOrderCardProps {
  order: KitchenOrder;
  timer?: any;
  position: number;
  onStart: (orderId: number) => void;
  onComplete: (orderId: number) => void;
}

// 狀態統計屬性
interface StatusStatsProps {
  orders: KitchenOrder[];
  className?: string;
}

// 工作站狀態列表屬性
interface WorkstationStatusListProps {
  className?: string;
}

// 工作站顏色映射
const workstationColors: Record<WorkstationType, string> = {
  cold: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  hot: 'bg-gradient-to-r from-red-500 to-orange-500',
  grill: 'bg-gradient-to-r from-orange-500 to-yellow-500',
  prep: 'bg-gradient-to-r from-green-500 to-emerald-500',
  dessert: 'bg-gradient-to-r from-purple-500 to-pink-500',
  beverage: 'bg-gradient-to-r from-cyan-500 to-blue-500',
};

// 工作站名稱
const workstationNames: Record<WorkstationType, string> = {
  cold: '冷盤區',
  hot: '熱食區',
  grill: '燒烤區',
  prep: '備料區',
  dessert: '甜點區',
  beverage: '飲品區',
};

// 狀態顏色
const statusStyles: Record<KitchenOrderStatus, { bg: string; text: string; border: string }> = {
  queued: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  active: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-600' },
  overdue: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  completed: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
};

// 格式化時間
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(Math.abs(seconds) / 60);
  const remainingSeconds = Math.abs(seconds) % 60;
  const sign = seconds < 0 ? '-' : '';
  return `${sign}${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 獲取當前時間
const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('zh-TW', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 狀態統計組件
const StatusStats: React.FC<StatusStatsProps> = ({ orders, className }) => {
  const stats = useMemo(() => {
    const total = orders.length;
    const queued = orders.filter(o => o.status === 'queued').length;
    const active = orders.filter(o => o.status === 'active').length;
    const overdue = orders.filter(o => o.status === 'overdue').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    
    return { total, queued, active, overdue, completed };
  }, [orders]);

  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      <div className="bg-blue-500 text-white rounded-lg p-6 text-center">
        <div className="text-4xl font-bold mb-2">{stats.queued}</div>
        <div className="text-lg">排隊中</div>
      </div>
      
      <div className="bg-yellow-500 text-black rounded-lg p-6 text-center">
        <div className="text-4xl font-bold mb-2">{stats.active}</div>
        <div className="text-lg">製作中</div>
      </div>
      
      <div className="bg-red-500 text-white rounded-lg p-6 text-center">
        <div className="text-4xl font-bold mb-2">{stats.overdue}</div>
        <div className="text-lg">逾時</div>
      </div>
      
      <div className="bg-green-500 text-white rounded-lg p-6 text-center">
        <div className="text-4xl font-bold mb-2">{stats.completed}</div>
        <div className="text-lg">已完成</div>
      </div>
    </div>
  );
};

// 工作站狀態列表組件
const WorkstationStatusList: React.FC<WorkstationStatusListProps> = ({ className }) => {
  const { workstations } = useKitchenStore();
  const orders = useKitchenOrders();

  const workstationStats = useMemo(() => {
    return workstations.map(ws => {
      const wsOrders = orders.filter(order => 
        order.assignedWorkstation === ws.type ||
        order.items.some(item => item.workstation === ws.type)
      );
      
      const activeCount = wsOrders.filter(o => o.status === 'active').length;
      const queuedCount = wsOrders.filter(o => o.status === 'queued').length;
      const utilization = Math.min((activeCount / ws.capacity) * 100, 100);
      
      return {
        ...ws,
        activeCount,
        queuedCount,
        utilization,
      };
    });
  }, [workstations, orders]);

  return (
    <div className={cn('space-y-3', className)}>
      {workstationStats.map(ws => (
        <div key={ws.type} className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('w-4 h-4 rounded-full', ws.isActive ? 'bg-green-400' : 'bg-red-400')} />
              <h3 className="text-lg font-bold text-gray-900">{workstationNames[ws.type]}</h3>
              {ws.assignedStaffName && (
                <span className="text-gray-600">({ws.assignedStaffName})</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-lg">
              <div className="text-blue-600 font-bold">{ws.queuedCount}</div>
              <div className="text-yellow-600 font-bold">{ws.activeCount}/{ws.capacity}</div>
              <div className={cn(
                'font-bold',
                ws.utilization >= 90 ? 'text-red-600' :
                ws.utilization >= 70 ? 'text-yellow-600' : 'text-green-600'
              )}>
                {ws.utilization.toFixed(0)}%
              </div>
            </div>
          </div>
          
          {/* 利用率進度條 */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={cn(
                  'h-3 rounded-full transition-all duration-300',
                  ws.utilization >= 90 ? 'bg-red-500' :
                  ws.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${ws.utilization}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 大屏訂單卡片組件
const LargeOrderCard: React.FC<LargeOrderCardProps> = ({
  order,
  timer,
  position,
  onStart,
  onComplete,
}) => {
  const isOverdue = timer?.isOverdue || order.status === 'overdue';
  const isActive = order.status === 'active';
  const statusStyle = statusStyles[order.status];

  const elapsedTime = order.actualStartTime 
    ? Math.floor((new Date().getTime() - order.actualStartTime.getTime()) / 1000)
    : 0;

  return (
    <div className={cn(
      'bg-white rounded-xl border-4 p-6 transition-all duration-300',
      statusStyle.border,
      isOverdue && 'animate-pulse ring-4 ring-red-300',
      'hover:shadow-xl transform hover:scale-[1.02]'
    )}>
      {/* 訂單標題區 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-6xl font-bold text-gray-900">#{position}</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">#{order.orderNumber}</h2>
            {order.customerName && (
              <p className="text-xl text-gray-600">{order.customerName}</p>
            )}
          </div>
        </div>
        
        {/* 狀態標籤 */}
        <div className={cn(
          'px-6 py-3 rounded-full text-2xl font-bold border-4',
          statusStyle.bg,
          statusStyle.text,
          statusStyle.border
        )}>
          {order.status === 'queued' && '排隊中'}
          {order.status === 'active' && '製作中'}
          {order.status === 'overdue' && '逾時!'}
          {order.status === 'completed' && '已完成'}
        </div>
      </div>

      {/* 時間資訊 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 計時器顯示 */}
        {isActive && timer && (
          <div className={cn(
            'p-4 rounded-lg text-center',
            isOverdue ? 'bg-red-100' : 'bg-blue-100'
          )}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className={cn('w-6 h-6', isOverdue ? 'text-red-600' : 'text-blue-600')} />
              <span className="text-lg font-medium">剩餘時間</span>
              {isOverdue && <Bell className="w-6 h-6 text-red-600 animate-bounce" />}
            </div>
            <div className={cn(
              'text-4xl font-bold font-mono',
              isOverdue ? 'text-red-700' : 'text-blue-700'
            )}>
              {formatTime(timer.remainingTime)}
            </div>
          </div>
        )}
        
        {/* 預估時間 */}
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-6 h-6 text-gray-600" />
            <span className="text-lg font-medium">預估時間</span>
          </div>
          <div className="text-4xl font-bold text-gray-700">
            {order.estimatedTime}分
          </div>
        </div>
        
        {/* 已用時間 */}
        {order.actualStartTime && (
          <div className="p-4 bg-purple-100 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-medium">已用時間</span>
            </div>
            <div className="text-4xl font-bold text-purple-700">
              {formatTime(elapsedTime)}
            </div>
          </div>
        )}
      </div>

      {/* 訂單項目 */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xl font-bold text-gray-900">訂單項目</h3>
        {order.items.map(item => (
          <div key={item.id} className={cn(
            'flex items-center justify-between p-4 rounded-lg border-2',
            item.status === 'ready' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center space-x-3">
              <div className={cn(
                'px-3 py-2 rounded-full text-sm font-bold text-white',
                workstationColors[item.workstation]
              )}>
                {workstationNames[item.workstation]}
              </div>
              
              <span className="text-xl font-medium">{item.name}</span>
              
              {item.quantity > 1 && (
                <span className="text-lg text-gray-500">x{item.quantity}</span>
              )}
              
              {item.status === 'ready' && (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
            </div>
            
            <div className="text-lg text-gray-600">
              {item.estimatedTime}分
            </div>
          </div>
        ))}
      </div>

      {/* 特殊說明 */}
      {order.specialInstructions && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h4 className="text-lg font-bold text-yellow-800 mb-2">特殊說明:</h4>
          <p className="text-lg text-yellow-700">{order.specialInstructions}</p>
        </div>
      )}

      {/* 過敏原警告 */}
      {order.allergenAlerts && order.allergenAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h4 className="text-lg font-bold text-red-800">過敏原警告:</h4>
          </div>
          <p className="text-lg text-red-700">{order.allergenAlerts.join(', ')}</p>
        </div>
      )}

      {/* 員工資訊 */}
      {order.assignedStaffName && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-6 h-6 text-blue-600" />
            <span className="text-lg text-blue-800">負責人: {order.assignedStaffName}</span>
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex justify-center space-x-4">
        {order.status === 'queued' && (
          <button
            onClick={() => onStart(order.id)}
            className="flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-700 transition-colors"
          >
            <Play className="w-6 h-6" />
            <span>開始製作</span>
          </button>
        )}
        
        {order.status === 'active' && (
          <button
            onClick={() => onComplete(order.id)}
            className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>標記完成</span>
          </button>
        )}
        
        {isOverdue && (
          <div className="flex items-center space-x-2 px-8 py-4 bg-red-100 text-red-800 rounded-xl text-xl font-bold">
            <AlertTriangle className="w-6 h-6" />
            <span>需要立即處理!</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 主廚房顯示屏組件
export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 5000,
  showControls = true,
  defaultFullscreen = false,
}) => {
  const orders = useKitchenOrders();
  const timers = useKitchenTimers();
  const settings = useKitchenSettings();
  const { 
    isConnected, 
    fetchOrders, 
    startOrder, 
    completeOrder, 
    isFullscreen,
    toggleFullscreen,
    updateSettings,
  } = useKitchenStore();

  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  // 篩選和排序訂單 - 只顯示需要顯示的訂單
  const displayOrders = useMemo(() => {
    return orders
      .filter(order => order.status !== 'completed')
      .sort((a, b) => {
        // 優先級排序：逾時 > 製作中 > 排隊中
        const statusOrder = { overdue: 3, active: 2, queued: 1 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[b.status] - statusOrder[a.status];
        }
        
        // 優先級排序
        const priorityOrder = { urgent: 3, high: 2, normal: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        
        // 時間排序
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, 6); // 大屏最多顯示6個訂單
  }, [orders]);

  // 時鐘更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh || isPaused) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isPaused, fetchOrders]);

  // 計時器更新
  useEffect(() => {
    startTimerUpdates();
    return () => stopTimerUpdates();
  }, []);

  // 全屏處理
  useEffect(() => {
    if (defaultFullscreen && !isFullscreen) {
      toggleFullscreen();
    }
  }, [defaultFullscreen]);

  // 音效設定同步
  useEffect(() => {
    if (soundEnabled !== settings.soundEnabled) {
      updateSettings({ soundEnabled });
    }
  }, [soundEnabled, settings.soundEnabled, updateSettings]);

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white',
      isFullscreen && 'fixed inset-0 z-50',
      className
    )}>
      {/* 頂部狀態欄 */}
      <div className="bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          {/* 左側：系統狀態 */}
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-bold">廚房顯示系統</h1>
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-6 h-6 text-green-400" />
                  <span className="text-lg text-green-400">已連線</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-red-400" />
                  <span className="text-lg text-red-400">連線中斷</span>
                </>
              )}
            </div>
            
            <div className="text-lg">
              訂單總數: <span className="font-bold text-yellow-400">{displayOrders.length}</span>
            </div>
          </div>

          {/* 中央：時間顯示 */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold">{currentTime}</div>
            <div className="text-lg text-gray-400">
              {new Date().toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* 右側：控制按鈕 */}
          {showControls && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleSound}
                className={cn(
                  'p-3 rounded-lg transition-colors',
                  soundEnabled 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                )}
                title={soundEnabled ? '關閉音效' : '開啟音效'}
              >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
              
              <button
                onClick={handleTogglePause}
                className={cn(
                  'p-3 rounded-lg transition-colors',
                  isPaused 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                )}
                title={isPaused ? '恢復更新' : '暫停更新'}
              >
                {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>
              
              <button
                onClick={handleRefresh}
                className="p-3 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                title="手動刷新"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                title={isFullscreen ? '退出全屏' : '進入全屏'}
              >
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 主內容區 */}
      <div className="p-6">
        {displayOrders.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Clock className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2 className="text-4xl font-bold mb-4">目前沒有待處理的訂單</h2>
              <p className="text-2xl text-gray-400">系統運行正常，等待新訂單...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayOrders.map((order, index) => {
              const timer = timers.find(t => t.orderId === order.id);
              
              return (
                <LargeOrderCard
                  key={order.id}
                  order={order}
                  timer={timer}
                  position={index + 1}
                  onStart={startOrder}
                  onComplete={completeOrder}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 底部統計區 */}
      <div className="bg-black bg-opacity-50 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 狀態統計 */}
          <div className="lg:col-span-3">
            <h3 className="text-xl font-bold mb-4">訂單狀態統計</h3>
            <StatusStats orders={orders} />
          </div>

          {/* 工作站狀態 */}
          <div>
            <h3 className="text-xl font-bold mb-4">工作站狀態</h3>
            <WorkstationStatusList />
          </div>
        </div>
      </div>
      
      {/* 暫停覆蓋層 */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-2xl p-12 text-center">
            <Pause className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
            <h2 className="text-4xl font-bold mb-4">系統已暫停</h2>
            <p className="text-xl text-gray-600 mb-8">點擊恢復按鈕繼續更新</p>
            <button
              onClick={handleTogglePause}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors"
            >
              恢復更新
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;