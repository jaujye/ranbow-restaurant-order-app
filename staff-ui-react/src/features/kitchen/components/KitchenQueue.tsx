import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause, 
  Users,
  ChefHat,
  Timer,
  Bell,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  KitchenOrder, 
  KitchenOrderStatus, 
  WorkstationType,
  useKitchenStore,
  useKitchenOrders,
  useKitchenTimers,
} from '../store/kitchenStore';

// 組件屬性介面
interface KitchenQueueProps {
  className?: string;
  workstationFilter?: WorkstationType | null;
  statusFilter?: KitchenOrderStatus[];
  showActions?: boolean;
  compactMode?: boolean;
  maxItems?: number;
}

// 訂單卡片屬性
interface OrderCardProps {
  order: KitchenOrder;
  timer?: any;
  onStart: (orderId: number) => void;
  onComplete: (orderId: number) => void;
  onSelect: (orderId: number) => void;
  isSelected: boolean;
  compactMode?: boolean;
  showActions?: boolean;
}

// 工作站顏色映射
const workstationColors: Record<WorkstationType, string> = {
  cold: 'bg-blue-100 text-blue-800 border-blue-200',
  hot: 'bg-red-100 text-red-800 border-red-200',
  grill: 'bg-orange-100 text-orange-800 border-orange-200',
  prep: 'bg-green-100 text-green-800 border-green-200',
  dessert: 'bg-purple-100 text-purple-800 border-purple-200',
  beverage: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

// 工作站名稱映射
const workstationNames: Record<WorkstationType, string> = {
  cold: '冷盤區',
  hot: '熱食區',
  grill: '燒烤區',
  prep: '備料區',
  dessert: '甜點區',
  beverage: '飲品區',
};

// 狀態顏色映射
const statusColors: Record<KitchenOrderStatus, string> = {
  queued: 'bg-gray-100 text-gray-800 border-gray-300',
  active: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  overdue: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
};

// 優先級顏色映射
const priorityColors = {
  normal: 'text-gray-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

// 格式化時間函數
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 計算經過時間
const getElapsedTime = (startTime: Date): number => {
  return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
};

// 訂單卡片組件
const OrderCard: React.FC<OrderCardProps> = ({
  order,
  timer,
  onStart,
  onComplete,
  onSelect,
  isSelected,
  compactMode = false,
  showActions = true,
}) => {
  const elapsedTime = order.actualStartTime ? getElapsedTime(order.actualStartTime) : 0;
  const isOverdue = timer?.isOverdue || order.status === 'overdue';
  const isActive = order.status === 'active';
  
  const handleCardClick = () => {
    onSelect(order.id);
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart(order.id);
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(order.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer',
        'hover:shadow-md transform hover:scale-[1.02]',
        isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200',
        isOverdue && 'ring-2 ring-red-400 bg-red-50',
        compactMode ? 'p-3' : 'p-4'
      )}
    >
      {/* 訂單標題區 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* 訂單編號和優先級 */}
          <div className="flex items-center space-x-2">
            <h3 className={cn(
              'font-bold',
              compactMode ? 'text-lg' : 'text-xl',
              priorityColors[order.priority]
            )}>
              #{order.orderNumber}
            </h3>
            
            {order.priority !== 'normal' && (
              <div className="flex items-center">
                {order.priority === 'urgent' && (
                  <ArrowUp className="w-4 h-4 text-red-600" />
                )}
                {order.priority === 'high' && (
                  <ArrowUp className="w-4 h-4 text-orange-600" />
                )}
              </div>
            )}
          </div>
          
          {/* 狀態標籤 */}
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium border',
            statusColors[order.status]
          )}>
            {order.status === 'queued' && '排隊中'}
            {order.status === 'active' && '製作中'}
            {order.status === 'overdue' && '逾時'}
            {order.status === 'completed' && '已完成'}
          </span>
        </div>
        
        {/* 時間顯示 */}
        <div className="flex items-center space-x-2">
          {isActive && timer && (
            <div className={cn(
              'flex items-center space-x-1 px-2 py-1 rounded text-sm font-mono',
              isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            )}>
              <Timer className="w-4 h-4" />
              <span>{formatTime(timer.remainingTime)}</span>
              {isOverdue && <Bell className="w-4 h-4 animate-bounce" />}
            </div>
          )}
          
          {order.actualStartTime && (
            <div className="text-sm text-gray-600">
              經過: {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>

      {/* 客戶資訊 */}
      {order.customerName && !compactMode && (
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{order.customerName}</span>
        </div>
      )}

      {/* 訂單項目 */}
      <div className="space-y-2 mb-3">
        {order.items.map((item, index) => (
          <div key={item.id} className={cn(
            'flex items-center justify-between p-2 rounded border',
            item.status === 'ready' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200',
            compactMode && 'text-sm'
          )}>
            <div className="flex items-center space-x-2">
              <span className={cn(
                'px-2 py-1 rounded text-xs border',
                workstationColors[item.workstation]
              )}>
                {workstationNames[item.workstation]}
              </span>
              
              <span className="font-medium">{item.name}</span>
              {item.quantity > 1 && (
                <span className="text-gray-500">x{item.quantity}</span>
              )}
              
              {item.status === 'ready' && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              {formatTime(item.estimatedTime * 60)}分鐘
            </div>
          </div>
        ))}
      </div>

      {/* 特殊說明 */}
      {order.specialInstructions && !compactMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
          <p className="text-sm text-yellow-800">
            <strong>特殊說明:</strong> {order.specialInstructions}
          </p>
        </div>
      )}

      {/* 過敏原警告 */}
      {order.allergenAlerts && order.allergenAlerts.length > 0 && !compactMode && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">過敏原警告:</span>
          </div>
          <p className="text-sm text-red-800 mt-1">
            {order.allergenAlerts.join(', ')}
          </p>
        </div>
      )}

      {/* 工作人員資訊 */}
      {order.assignedStaffName && !compactMode && (
        <div className="flex items-center space-x-2 mb-3">
          <ChefHat className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">負責人: {order.assignedStaffName}</span>
        </div>
      )}

      {/* 操作按鈕 */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            預估: {order.estimatedTime}分鐘
          </div>
          
          <div className="flex space-x-2">
            {order.status === 'queued' && (
              <button
                onClick={handleStartClick}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>開始</span>
              </button>
            )}
            
            {order.status === 'active' && (
              <button
                onClick={handleCompleteClick}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                <span>完成</span>
              </button>
            )}
            
            {isOverdue && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                <AlertTriangle className="w-3 h-3" />
                <span>逾時</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 主廚房隊列組件
export const KitchenQueue: React.FC<KitchenQueueProps> = ({
  className,
  workstationFilter,
  statusFilter,
  showActions = true,
  compactMode = false,
  maxItems,
}) => {
  const orders = useKitchenOrders();
  const timers = useKitchenTimers();
  const { selectedOrderId, selectOrder, startOrder, completeOrder } = useKitchenStore();
  
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'status'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 篩選和排序訂單
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    // 工作站篩選
    if (workstationFilter) {
      filtered = filtered.filter(order =>
        order.assignedWorkstation === workstationFilter ||
        order.items.some(item => item.workstation === workstationFilter)
      );
    }

    // 狀態篩選
    if (statusFilter && statusFilter.length > 0) {
      filtered = filtered.filter(order => statusFilter.includes(order.status));
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
          
        case 'time':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
          
        case 'status':
          const statusOrder = { overdue: 4, active: 3, queued: 2, completed: 1 };
          comparison = statusOrder[b.status] - statusOrder[a.status];
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // 限制數量
    if (maxItems && maxItems > 0) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [orders, workstationFilter, statusFilter, sortBy, sortOrder, maxItems]);

  // 統計數據
  const stats = useMemo(() => {
    const total = filteredAndSortedOrders.length;
    const queued = filteredAndSortedOrders.filter(o => o.status === 'queued').length;
    const active = filteredAndSortedOrders.filter(o => o.status === 'active').length;
    const overdue = filteredAndSortedOrders.filter(o => o.status === 'overdue').length;
    const completed = filteredAndSortedOrders.filter(o => o.status === 'completed').length;
    
    return { total, queued, active, overdue, completed };
  }, [filteredAndSortedOrders]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className={cn('bg-gray-50 rounded-lg', className)}>
      {/* 標題和統計 */}
      <div className="bg-white rounded-t-lg border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">廚房隊列</h2>
          
          {/* 統計標籤 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>排隊: {stats.queued}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>製作中: {stats.active}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>逾時: {stats.overdue}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>完成: {stats.completed}</span>
            </div>
          </div>
        </div>

        {/* 排序控制 */}
        {!compactMode && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">排序:</span>
            
            <button
              onClick={() => handleSortChange('priority')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                sortBy === 'priority'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              優先級
              {sortBy === 'priority' && (
                sortOrder === 'desc' ? <ArrowDown className="inline w-3 h-3 ml-1" /> : <ArrowUp className="inline w-3 h-3 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => handleSortChange('time')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                sortBy === 'time'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              時間
              {sortBy === 'time' && (
                sortOrder === 'desc' ? <ArrowDown className="inline w-3 h-3 ml-1" /> : <ArrowUp className="inline w-3 h-3 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => handleSortChange('status')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                sortBy === 'status'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              狀態
              {sortBy === 'status' && (
                sortOrder === 'desc' ? <ArrowDown className="inline w-3 h-3 ml-1" /> : <ArrowUp className="inline w-3 h-3 ml-1" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 訂單列表 */}
      <div className={cn(
        'p-4 space-y-3 max-h-screen overflow-y-auto',
        compactMode ? 'max-h-96' : 'max-h-[calc(100vh-200px)]'
      )}>
        {filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>目前沒有訂單</p>
          </div>
        ) : (
          filteredAndSortedOrders.map((order) => {
            const timer = timers.find(t => t.orderId === order.id);
            
            return (
              <OrderCard
                key={order.id}
                order={order}
                timer={timer}
                onStart={startOrder}
                onComplete={completeOrder}
                onSelect={selectOrder}
                isSelected={selectedOrderId === order.id}
                compactMode={compactMode}
                showActions={showActions}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default KitchenQueue;