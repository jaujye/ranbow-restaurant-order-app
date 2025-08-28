import React, { useState, useMemo } from 'react';
import { 
  ChefHat, 
  Users, 
  Clock, 
  Activity,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Settings,
  RotateCcw,
  UserPlus,
  UserMinus,
  Power,
  PowerOff,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { 
  WorkstationType,
  WorkstationStatus,
  KitchenOrder,
  useKitchenStore,
  useWorkstations,
  useKitchenOrders,
  useKitchenTimers,
} from '../store/kitchenStore';
import CookingTimer from './CookingTimer';

// 組件屬性介面
interface WorkstationViewProps {
  className?: string;
  selectedWorkstation?: WorkstationType | null;
  onWorkstationSelect?: (workstation: WorkstationType) => void;
  showTimers?: boolean;
  showStats?: boolean;
  compactMode?: boolean;
}

// 工作站卡片屬性
interface WorkstationCardProps {
  workstation: WorkstationStatus;
  orders: KitchenOrder[];
  isSelected: boolean;
  onSelect: (type: WorkstationType) => void;
  onToggleActive: (type: WorkstationType, active: boolean) => void;
  onAssignStaff: (type: WorkstationType) => void;
  onUnassignStaff: (type: WorkstationType) => void;
  compactMode?: boolean;
  showStats?: boolean;
}

// 工作站統計屬性
interface WorkstationStatsProps {
  workstation: WorkstationStatus;
  orders: KitchenOrder[];
  className?: string;
}

// 員工分配模態屬性
interface StaffAssignmentModalProps {
  workstation: WorkstationType;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffId: number, staffName: string) => void;
}

// 工作站顏色映射
const workstationColors: Record<WorkstationType, string> = {
  cold: 'from-blue-500 to-cyan-500',
  hot: 'from-red-500 to-orange-500', 
  grill: 'from-orange-500 to-yellow-500',
  prep: 'from-green-500 to-emerald-500',
  dessert: 'from-purple-500 to-pink-500',
  beverage: 'from-cyan-500 to-blue-500',
};

// 工作站圖示映射
const workstationIcons: Record<WorkstationType, React.ReactNode> = {
  cold: <div className="text-2xl">🥗</div>,
  hot: <div className="text-2xl">🍳</div>,
  grill: <div className="text-2xl">🔥</div>,
  prep: <div className="text-2xl">🔪</div>,
  dessert: <div className="text-2xl">🍰</div>,
  beverage: <div className="text-2xl">🥤</div>,
};

// 工作站名稱映射
const workstationNames: Record<WorkstationType, string> = {
  cold: '冷盤工作站',
  hot: '熱食工作站',
  grill: '燒烤工作站',
  prep: '備料工作站',
  dessert: '甜點工作站',
  beverage: '飲品工作站',
};

// 工作站統計組件
const WorkstationStats: React.FC<WorkstationStatsProps> = ({ 
  workstation, 
  orders, 
  className 
}) => {
  const activeOrders = orders.filter(order => order.status === 'active').length;
  const queuedOrders = orders.filter(order => order.status === 'queued').length;
  const overdueOrders = orders.filter(order => order.status === 'overdue').length;
  const completedToday = orders.filter(order => 
    order.status === 'completed' && 
    new Date(order.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const utilizationPercentage = Math.min((activeOrders / workstation.capacity) * 100, 100);
  const efficiencyTrend = workstation.efficiency >= 85 ? 'up' : 'down';

  return (
    <div className={cn('space-y-3', className)}>
      {/* 工作負載 */}
      <div className="bg-gray-50 rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">工作負載</span>
          <span className="text-sm text-gray-500">{activeOrders}/{workstation.capacity}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              utilizationPercentage >= 90 ? 'bg-red-500' :
              utilizationPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            )}
            style={{ width: `${utilizationPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          利用率: {utilizationPercentage.toFixed(0)}%
        </div>
      </div>

      {/* 統計數據 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded p-2">
          <div className="text-lg font-bold text-blue-700">{queuedOrders}</div>
          <div className="text-xs text-blue-600">排隊中</div>
        </div>
        
        <div className="bg-red-50 rounded p-2">
          <div className="text-lg font-bold text-red-700">{overdueOrders}</div>
          <div className="text-xs text-red-600">逾時</div>
        </div>
        
        <div className="bg-green-50 rounded p-2">
          <div className="text-lg font-bold text-green-700">{completedToday}</div>
          <div className="text-xs text-green-600">今日完成</div>
        </div>
        
        <div className="bg-purple-50 rounded p-2">
          <div className="flex items-center space-x-1">
            <div className="text-lg font-bold text-purple-700">
              {workstation.efficiency}%
            </div>
            {efficiencyTrend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
          </div>
          <div className="text-xs text-purple-600">效率</div>
        </div>
      </div>
    </div>
  );
};

// 員工分配模態組件
const StaffAssignmentModal: React.FC<StaffAssignmentModalProps> = ({
  workstation,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState('');

  // 模擬員工列表 (實際應用中應從 API 獲取)
  const availableStaff = [
    { id: 1, name: '王師傅', experience: 5, speciality: ['hot', 'grill'] },
    { id: 2, name: '李廚師', experience: 3, speciality: ['cold', 'prep'] },
    { id: 3, name: '張師傅', experience: 8, speciality: ['dessert', 'beverage'] },
    { id: 4, name: '陳廚師', experience: 2, speciality: ['prep', 'cold'] },
  ];

  const handleAssign = () => {
    if (selectedStaffId && staffName) {
      onAssign(selectedStaffId, staffName);
      onClose();
      setSelectedStaffId(null);
      setStaffName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <h3 className="text-lg font-bold mb-4">
          分配員工到 {workstationNames[workstation]}
        </h3>
        
        <div className="space-y-3 mb-6">
          {availableStaff.map(staff => (
            <div
              key={staff.id}
              onClick={() => {
                setSelectedStaffId(staff.id);
                setStaffName(staff.name);
              }}
              className={cn(
                'p-3 border rounded cursor-pointer transition-colors',
                selectedStaffId === staff.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-sm text-gray-500">
                    經驗: {staff.experience}年 | 擅長: {staff.speciality.join(', ')}
                  </div>
                </div>
                {staff.speciality.includes(workstation) && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedStaffId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            分配
          </button>
        </div>
      </div>
    </div>
  );
};

// 工作站卡片組件
const WorkstationCard: React.FC<WorkstationCardProps> = ({
  workstation,
  orders,
  isSelected,
  onSelect,
  onToggleActive,
  onAssignStaff,
  onUnassignStaff,
  compactMode = false,
  showStats = true,
}) => {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  
  const activeOrders = orders.filter(order => order.status === 'active');
  const queuedOrders = orders.filter(order => order.status === 'queued');
  const overdueOrders = orders.filter(order => order.status === 'overdue');
  
  const hasOverdue = overdueOrders.length > 0;
  const isOverloaded = activeOrders.length >= workstation.capacity;

  const handleStaffAssign = (staffId: number, staffName: string) => {
    // 使用 store 中的方法
    const { assignStaffToWorkstation } = useKitchenStore.getState();
    assignStaffToWorkstation(staffId, staffName, workstation.type);
    setShowAssignmentModal(false);
  };

  return (
    <>
      <div
        onClick={() => onSelect(workstation.type)}
        className={cn(
          'bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer',
          'hover:shadow-md transform hover:scale-[1.02]',
          isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
          !workstation.isActive && 'opacity-60 bg-gray-50',
          hasOverdue && 'border-red-300 bg-red-50',
          compactMode ? 'p-2 md:p-3' : 'p-3 md:p-4'
        )}
      >
        {/* 工作站標題 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* 圖示和漸變背景 */}
            <div className={cn(
              'p-2 rounded-lg bg-gradient-to-r',
              workstationColors[workstation.type]
            )}>
              <div className="text-white">
                {workstationIcons[workstation.type]}
              </div>
            </div>
            
            <div>
              <h3 className={cn(
                'font-bold text-gray-900',
                compactMode ? 'text-xs md:text-sm' : 'text-sm md:text-lg'
              )}>
                {workstationNames[workstation.type]}
              </h3>
              
              {!compactMode && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    workstation.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  )}>
                    {workstation.isActive ? '運行中' : '已停用'}
                  </span>
                  
                  {isOverloaded && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      超負荷
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 狀態指示器 */}
          <div className="flex items-center space-x-2">
            {hasOverdue && (
              <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
            )}
            
            <div className={cn(
              'w-3 h-3 rounded-full',
              workstation.isActive ? 'bg-green-400' : 'bg-red-400'
            )} />
          </div>
        </div>

        {/* 員工資訊 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {workstation.assignedStaffName || '未分配員工'}
              </span>
            </div>
            
            {!compactMode && (
              <div className="flex items-center space-x-1">
                {workstation.assignedStaffId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnassignStaff(workstation.type);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="移除員工"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAssignmentModal(true);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="分配員工"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(workstation.type, !workstation.isActive);
                  }}
                  className={cn(
                    'p-1 rounded',
                    workstation.isActive 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  )}
                  title={workstation.isActive ? '停用工作站' : '啟用工作站'}
                >
                  {workstation.isActive ? (
                    <PowerOff className="w-4 h-4" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 訂單概覽 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-1.5 md:p-2 bg-blue-50 rounded">
            <div className="text-sm md:text-lg font-bold text-blue-700">{queuedOrders.length}</div>
            <div className="text-xs text-blue-600">排隊</div>
          </div>
          
          <div className="text-center p-1.5 md:p-2 bg-yellow-50 rounded">
            <div className="text-sm md:text-lg font-bold text-yellow-700">{activeOrders.length}</div>
            <div className="text-xs text-yellow-600">製作中</div>
          </div>
          
          <div className="text-center p-1.5 md:p-2 bg-red-50 rounded">
            <div className="text-sm md:text-lg font-bold text-red-700">{overdueOrders.length}</div>
            <div className="text-xs text-red-600">逾時</div>
          </div>
        </div>

        {/* 詳細統計 */}
        {showStats && !compactMode && (
          <WorkstationStats 
            workstation={workstation} 
            orders={orders}
          />
        )}

        {/* 當前訂單列表 */}
        {!compactMode && activeOrders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">當前製作:</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {activeOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">#{order.orderNumber}</span>
                  <span className="text-gray-500">{order.customerName}</span>
                </div>
              ))}
              {activeOrders.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  還有 {activeOrders.length - 3} 個訂單...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 員工分配模態 */}
      <StaffAssignmentModal
        workstation={workstation.type}
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onAssign={handleStaffAssign}
      />
    </>
  );
};

// 主工作站視圖組件
export const WorkstationView: React.FC<WorkstationViewProps> = ({
  className,
  selectedWorkstation,
  onWorkstationSelect,
  showTimers = true,
  showStats = true,
  compactMode = false,
}) => {
  const workstations = useWorkstations();
  const orders = useKitchenOrders();
  const { updateWorkstationStatus, assignStaffToWorkstation, selectedWorkstation: storeSelectedWorkstation, selectWorkstation } = useKitchenStore();
  
  const currentSelected = selectedWorkstation ?? storeSelectedWorkstation;

  // 按工作站分組訂單
  const ordersByWorkstation = useMemo(() => {
    const grouped: Record<WorkstationType, KitchenOrder[]> = {
      cold: [],
      hot: [],
      grill: [],
      prep: [],
      dessert: [],
      beverage: [],
    };

    orders.forEach(order => {
      if (order.assignedWorkstation) {
        grouped[order.assignedWorkstation].push(order);
      } else {
        // 根據訂單項目分配到工作站
        order.items.forEach(item => {
          if (!grouped[item.workstation].find(o => o.id === order.id)) {
            grouped[item.workstation].push(order);
          }
        });
      }
    });

    return grouped;
  }, [orders]);

  const handleWorkstationSelect = (workstation: WorkstationType) => {
    if (onWorkstationSelect) {
      onWorkstationSelect(workstation);
    } else {
      selectWorkstation(workstation === currentSelected ? null : workstation);
    }
  };

  const handleToggleActive = (type: WorkstationType, active: boolean) => {
    updateWorkstationStatus(type, { isActive: active });
  };

  const handleAssignStaff = (type: WorkstationType) => {
    // 這個方法會由 WorkstationCard 內部的模態處理
  };

  const handleUnassignStaff = (type: WorkstationType) => {
    updateWorkstationStatus(type, { 
      assignedStaffId: undefined, 
      assignedStaffName: undefined 
    });
  };

  const activeWorkstations = workstations.filter(ws => ws.isActive);
  const totalOrders = Object.values(ordersByWorkstation).flat().length;
  const activeOrders = Object.values(ordersByWorkstation).flat().filter(o => o.status === 'active').length;
  const overdueOrders = Object.values(ordersByWorkstation).flat().filter(o => o.status === 'overdue').length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* 總覽統計 */}
      {!compactMode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">工作站總覽</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-blue-600" />
              <div className="text-lg md:text-2xl font-bold text-blue-700">{activeWorkstations.length}</div>
              <div className="text-xs md:text-sm text-blue-600">活躍工作站</div>
            </div>
            
            <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-green-600" />
              <div className="text-lg md:text-2xl font-bold text-green-700">{totalOrders}</div>
              <div className="text-xs md:text-sm text-green-600">總訂單數</div>
            </div>
            
            <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
              <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-yellow-600" />
              <div className="text-lg md:text-2xl font-bold text-yellow-700">{activeOrders}</div>
              <div className="text-xs md:text-sm text-yellow-600">製作中</div>
            </div>
            
            <div className="text-center p-3 md:p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 text-red-600" />
              <div className="text-lg md:text-2xl font-bold text-red-700">{overdueOrders}</div>
              <div className="text-xs md:text-sm text-red-600">逾時警告</div>
            </div>
          </div>
        </div>
      )}

      {/* 工作站網格 */}
      <div className={cn(
        'grid gap-4',
        compactMode 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      )}>
        {workstations.map(workstation => (
          <WorkstationCard
            key={workstation.type}
            workstation={workstation}
            orders={ordersByWorkstation[workstation.type]}
            isSelected={currentSelected === workstation.type}
            onSelect={handleWorkstationSelect}
            onToggleActive={handleToggleActive}
            onAssignStaff={handleAssignStaff}
            onUnassignStaff={handleUnassignStaff}
            compactMode={compactMode}
            showStats={showStats}
          />
        ))}
      </div>

      {/* 選中工作站的計時器 */}
      {showTimers && currentSelected && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {workstationNames[currentSelected]} - 活動計時器
          </h3>
          
          {ordersByWorkstation[currentSelected].filter(o => o.status === 'active').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByWorkstation[currentSelected]
                .filter(order => order.status === 'active')
                .map(order => (
                  <CookingTimer
                    key={order.id}
                    orderId={order.id}
                    size="small"
                    showControls={true}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>該工作站目前沒有活動訂單</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkstationView;