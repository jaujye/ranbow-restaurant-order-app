import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle,
  Clock, 
  AlertTriangle,
  ChefHat,
  Utensils,
  Timer,
  Star,
  CheckCheck,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  KitchenOrder, 
  KitchenOrderItem,
  PreparationStep,
  WorkstationType,
  useKitchenStore,
  useKitchenOrders,
} from '../store/kitchenStore';

// 組件屬性介面
interface PreparationListProps {
  orderId?: number;
  itemId?: number;
  workstation?: WorkstationType;
  className?: string;
  showAllSteps?: boolean;
  compactMode?: boolean;
  showTimer?: boolean;
  onStepComplete?: (orderId: number, itemId: number, stepId: string) => void;
  onAllStepsComplete?: (orderId: number, itemId: number) => void;
}

// 準備步驟項目屬性
interface PreparationStepItemProps {
  step: PreparationStep;
  orderId: number;
  itemId: number;
  isActive: boolean;
  onToggle: (stepId: string, completed: boolean) => void;
  onStartTimer: (stepId: string, duration: number) => void;
  compactMode?: boolean;
}

// 項目準備清單屬性
interface ItemPreparationListProps {
  order: KitchenOrder;
  item: KitchenOrderItem;
  onStepComplete: (stepId: string, completed: boolean) => void;
  compactMode?: boolean;
  showTimer?: boolean;
}

// 步驟計時器狀態
interface StepTimer {
  stepId: string;
  startTime: Date;
  duration: number;
  remaining: number;
  isRunning: boolean;
}

// 工作站顏色映射
const workstationColors: Record<WorkstationType, string> = {
  cold: 'border-blue-200 bg-blue-50',
  hot: 'border-red-200 bg-red-50',
  grill: 'border-orange-200 bg-orange-50',
  prep: 'border-green-200 bg-green-50',
  dessert: 'border-purple-200 bg-purple-50',
  beverage: 'border-cyan-200 bg-cyan-50',
};

// 格式化時間
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分鐘`;
};

// 準備步驟項目組件
const PreparationStepItem: React.FC<PreparationStepItemProps> = ({
  step,
  orderId,
  itemId,
  isActive,
  onToggle,
  onStartTimer,
  compactMode = false,
}) => {
  const [timer, setTimer] = useState<StepTimer | null>(null);
  const [showDetails, setShowDetails] = useState(!compactMode);

  // 計時器邏輯
  React.useEffect(() => {
    if (!timer || !timer.isRunning) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (!prev) return null;
        
        const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
        const remaining = Math.max(0, prev.duration - elapsed);
        
        if (remaining === 0 && prev.isRunning) {
          // 計時結束，自動標記完成
          onToggle(step.id, true);
          return { ...prev, remaining: 0, isRunning: false };
        }
        
        return { ...prev, remaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.isRunning]);

  const handleToggle = () => {
    const newCompleted = !step.completed;
    onToggle(step.id, newCompleted);
    
    // 如果標記完成，停止計時器
    if (newCompleted && timer) {
      setTimer(prev => prev ? { ...prev, isRunning: false } : null);
    }
  };

  const handleStartTimer = () => {
    if (!timer) {
      const newTimer: StepTimer = {
        stepId: step.id,
        startTime: new Date(),
        duration: step.estimatedTime,
        remaining: step.estimatedTime,
        isRunning: true,
      };
      setTimer(newTimer);
      onStartTimer(step.id, step.estimatedTime);
    } else {
      setTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null);
    }
  };

  const handleResetTimer = () => {
    setTimer({
      stepId: step.id,
      startTime: new Date(),
      duration: step.estimatedTime,
      remaining: step.estimatedTime,
      isRunning: false,
    });
  };

  const isOverdue = timer && timer.remaining === 0 && timer.isRunning;

  return (
    <div className={cn(
      'border rounded-lg p-3 transition-all duration-200',
      step.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white',
      isActive && !step.completed && 'border-blue-300 bg-blue-50 ring-1 ring-blue-200',
      isOverdue && 'border-red-300 bg-red-50 ring-1 ring-red-200',
      compactMode ? 'p-2' : 'p-3'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* 完成狀態按鈕 */}
          <button
            onClick={handleToggle}
            className={cn(
              'mt-0.5 transition-colors',
              step.completed 
                ? 'text-green-600 hover:text-green-700' 
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {step.completed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* 步驟內容 */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className={cn(
                'font-medium transition-colors',
                step.completed ? 'text-green-700 line-through' : 'text-gray-900',
                compactMode ? 'text-sm' : 'text-base'
              )}>
                {step.description}
              </h4>
              
              {!compactMode && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showDetails ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* 時間資訊 */}
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>預計: {formatDuration(step.estimatedTime)}</span>
              </div>
              
              {step.actualTime && (
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <CheckCheck className="w-3 h-3" />
                  <span>實際: {formatDuration(step.actualTime)}</span>
                </div>
              )}
            </div>

            {/* 計時器顯示 */}
            {timer && showDetails && (
              <div className={cn(
                'mt-2 p-2 rounded border',
                isOverdue ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Timer className={cn(
                      'w-4 h-4',
                      isOverdue ? 'text-red-600' : 'text-blue-600'
                    )} />
                    <span className={cn(
                      'font-mono text-sm',
                      isOverdue ? 'text-red-700' : 'text-blue-700'
                    )}>
                      {Math.floor(timer.remaining / 60)}:{(timer.remaining % 60).toString().padStart(2, '0')}
                    </span>
                    {isOverdue && (
                      <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleStartTimer}
                      className={cn(
                        'p-1 rounded text-xs',
                        timer.isRunning 
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      )}
                      title={timer.isRunning ? '暫停' : '開始'}
                    >
                      {timer.isRunning ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleResetTimer}
                      className="p-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                      title="重置"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* 進度條 */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className={cn(
                        'h-1 rounded-full transition-all duration-1000',
                        isOverdue ? 'bg-red-500' : 'bg-blue-500'
                      )}
                      style={{ 
                        width: `${Math.max(0, ((timer.duration - timer.remaining) / timer.duration) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 快速操作按鈕 */}
        {!compactMode && (
          <div className="flex items-center space-x-1 ml-2">
            {!step.completed && (
              <button
                onClick={handleStartTimer}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="開始計時"
              >
                <Timer className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 項目準備清單組件
const ItemPreparationList: React.FC<ItemPreparationListProps> = ({
  order,
  item,
  onStepComplete,
  compactMode = false,
  showTimer = true,
}) => {
  const completedSteps = item.preparationSteps?.filter(step => step.completed).length || 0;
  const totalSteps = item.preparationSteps?.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // 自動推進到下一個未完成步驟
  React.useEffect(() => {
    if (!item.preparationSteps) return;
    
    const nextUncompletedIndex = item.preparationSteps.findIndex(step => !step.completed);
    if (nextUncompletedIndex !== -1) {
      setActiveStepIndex(nextUncompletedIndex);
    }
  }, [item.preparationSteps]);

  const handleStepComplete = (stepId: string, completed: boolean) => {
    onStepComplete(stepId, completed);
    
    // 記錄實際完成時間
    if (completed && item.preparationSteps) {
      const step = item.preparationSteps.find(s => s.id === stepId);
      if (step) {
        step.actualTime = Math.floor((Date.now() - Date.now()) / 1000); // 這裡需要實際的開始時間
      }
    }
  };

  const handleStartStepTimer = (stepId: string, duration: number) => {
    console.log(`開始步驟 ${stepId} 的計時器，時長: ${duration}秒`);
  };

  if (!item.preparationSteps || item.preparationSteps.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Utensils className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">此項目沒有準備步驟</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white rounded-lg border',
      workstationColors[item.workstation],
      compactMode ? 'p-3' : 'p-4'
    )}>
      {/* 項目標題 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-gray-600" />
            <h3 className={cn(
              'font-bold text-gray-900',
              compactMode ? 'text-base' : 'text-lg'
            )}>
              {item.name}
            </h3>
            {item.quantity > 1 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                x{item.quantity}
              </span>
            )}
          </div>
          
          {isComplete && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">已完成</span>
            </div>
          )}
        </div>

        {/* 進度顯示 */}
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">
            {completedSteps}/{totalSteps} 步驟
          </div>
          <div className="w-20 h-2 bg-gray-200 rounded-full">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                isComplete ? 'bg-green-500' : 'bg-blue-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 特殊要求 */}
      {item.specialRequests && !compactMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">特殊要求:</span>
          </div>
          <p className="text-yellow-700 mt-1 text-sm">{item.specialRequests}</p>
        </div>
      )}

      {/* 準備步驟列表 */}
      <div className="space-y-3">
        {item.preparationSteps.map((step, index) => (
          <PreparationStepItem
            key={step.id}
            step={step}
            orderId={order.id}
            itemId={item.id}
            isActive={index === activeStepIndex}
            onToggle={handleStepComplete}
            onStartTimer={handleStartStepTimer}
            compactMode={compactMode}
          />
        ))}
      </div>

      {/* 項目狀態 */}
      {!compactMode && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                狀態: <span className={cn(
                  'font-medium',
                  item.status === 'ready' ? 'text-green-600' :
                  item.status === 'preparing' ? 'text-blue-600' : 'text-gray-600'
                )}>
                  {item.status === 'pending' && '待準備'}
                  {item.status === 'preparing' && '準備中'}
                  {item.status === 'ready' && '已完成'}
                </span>
              </span>
              
              <span className="text-gray-600">
                預計: {formatDuration(item.estimatedTime * 60)}
              </span>
            </div>
            
            <div className="text-gray-500">
              進度: {progress.toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 主準備清單組件
export const PreparationList: React.FC<PreparationListProps> = ({
  orderId,
  itemId,
  workstation,
  className,
  showAllSteps = false,
  compactMode = false,
  showTimer = true,
  onStepComplete,
  onAllStepsComplete,
}) => {
  const orders = useKitchenOrders();
  const { completeOrderItem } = useKitchenStore();

  // 篩選訂單和項目
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (orderId) {
      filtered = filtered.filter(order => order.id === orderId);
    }

    if (workstation) {
      filtered = filtered.filter(order => 
        order.assignedWorkstation === workstation ||
        order.items.some(item => item.workstation === workstation)
      );
    }

    // 只顯示有準備步驟的訂單
    return filtered.filter(order => 
      order.items.some(item => item.preparationSteps && item.preparationSteps.length > 0)
    );
  }, [orders, orderId, workstation]);

  const handleStepComplete = (targetOrderId: number, targetItemId: number, stepId: string, completed: boolean) => {
    if (onStepComplete) {
      onStepComplete(targetOrderId, targetItemId, stepId);
    }

    // 檢查項目是否全部完成
    const order = filteredOrders.find(o => o.id === targetOrderId);
    const item = order?.items.find(i => i.id === targetItemId);
    
    if (item && item.preparationSteps) {
      const allCompleted = item.preparationSteps.every(step => 
        step.id === stepId ? completed : step.completed
      );
      
      if (allCompleted) {
        completeOrderItem(targetOrderId, targetItemId);
        if (onAllStepsComplete) {
          onAllStepsComplete(targetOrderId, targetItemId);
        }
      }
    }
  };

  if (filteredOrders.length === 0) {
    return (
      <div className={cn(
        'bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center',
        className
      )}>
        <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 mb-2">沒有需要準備的項目</p>
        <p className="text-sm text-gray-400">
          {orderId ? '此訂單' : workstation ? `${workstation}工作站` : '目前'}沒有準備步驟
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {filteredOrders.map(order => (
        <div key={order.id} className="space-y-3">
          {/* 訂單標題 */}
          {!compactMode && filteredOrders.length > 1 && (
            <div className="bg-gray-100 rounded-lg p-3">
              <h2 className="font-bold text-gray-900">
                訂單 #{order.orderNumber}
                {order.customerName && ` - ${order.customerName}`}
              </h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>項目數: {order.items.length}</span>
                <span>狀態: {order.status}</span>
                {order.assignedStaffName && (
                  <span>負責人: {order.assignedStaffName}</span>
                )}
              </div>
            </div>
          )}

          {/* 項目準備清單 */}
          {order.items
            .filter(item => 
              (!itemId || item.id === itemId) &&
              (!workstation || item.workstation === workstation) &&
              item.preparationSteps && item.preparationSteps.length > 0
            )
            .map(item => (
              <ItemPreparationList
                key={item.id}
                order={order}
                item={item}
                onStepComplete={(stepId, completed) => 
                  handleStepComplete(order.id, item.id, stepId, completed)
                }
                compactMode={compactMode}
                showTimer={showTimer}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export default PreparationList;