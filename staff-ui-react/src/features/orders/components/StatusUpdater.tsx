import React, { useState } from 'react';
import { 
  CheckCircle, Play, Package, AlertTriangle, Clock, 
  ArrowRight, RotateCcw, Zap, Star, X, Check
} from 'lucide-react';
import { Order, OrderStatus, OrderPriority } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';

interface StatusUpdaterProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: OrderStatus, notes?: string, estimatedTime?: number) => void;
  onPriorityUpdate: (orderId: string, priority: OrderPriority, reason?: string) => void;
  isUpdating?: boolean;
  showConfirmDialog?: boolean;
  className?: string;
  variant?: 'buttons' | 'dropdown' | 'timeline' | 'quick';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusUpdater({
  order,
  onStatusUpdate,
  onPriorityUpdate,
  isUpdating = false,
  showConfirmDialog = true,
  className,
  variant = 'buttons',
  size = 'md'
}: StatusUpdaterProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'status' | 'priority';
    value: any;
    label: string;
    color: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [reason, setReason] = useState('');

  // Status configuration with next possible actions
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.PENDING]: {
        icon: AlertTriangle,
        color: 'text-yellow-600 bg-yellow-50',
        label: '待處理',
        nextActions: [
          {
            status: OrderStatus.CONFIRMED,
            label: '確認訂單',
            icon: CheckCircle,
            color: 'bg-blue-600 hover:bg-blue-700 text-white',
            description: '確認訂單詳情並開始處理',
            requiresTime: false
          },
          {
            status: OrderStatus.CANCELLED,
            label: '取消訂單',
            icon: X,
            color: 'bg-red-600 hover:bg-red-700 text-white',
            description: '取消此訂單',
            requiresTime: false
          }
        ]
      },
      [OrderStatus.CONFIRMED]: {
        icon: CheckCircle,
        color: 'text-blue-600 bg-blue-50',
        label: '已確認',
        nextActions: [
          {
            status: OrderStatus.PREPARING,
            label: '開始製作',
            icon: Play,
            color: 'bg-orange-600 hover:bg-orange-700 text-white',
            description: '開始製作訂單商品',
            requiresTime: true
          }
        ]
      },
      [OrderStatus.PREPARING]: {
        icon: Play,
        color: 'text-orange-600 bg-orange-50',
        label: '製作中',
        nextActions: [
          {
            status: OrderStatus.READY,
            label: '標記完成',
            icon: Package,
            color: 'bg-green-600 hover:bg-green-700 text-white',
            description: '訂單製作完成，準備交付',
            requiresTime: false
          }
        ]
      },
      [OrderStatus.READY]: {
        icon: Package,
        color: 'text-green-600 bg-green-50',
        label: '準備完成',
        nextActions: [
          {
            status: OrderStatus.COMPLETED,
            label: '交付完成',
            icon: CheckCircle,
            color: 'bg-gray-600 hover:bg-gray-700 text-white',
            description: '訂單已交付給客戶',
            requiresTime: false
          }
        ]
      },
      [OrderStatus.COMPLETED]: {
        icon: CheckCircle,
        color: 'text-gray-600 bg-gray-50',
        label: '已完成',
        nextActions: []
      },
      [OrderStatus.CANCELLED]: {
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50',
        label: '已取消',
        nextActions: []
      }
    };
    return configs[status];
  };

  // Priority actions
  const priorityActions = [
    {
      priority: OrderPriority.LOW,
      label: '低優先級',
      icon: ArrowRight,
      color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    },
    {
      priority: OrderPriority.NORMAL,
      label: '普通',
      icon: ArrowRight,
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
    },
    {
      priority: OrderPriority.HIGH,
      label: '高優先級',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    },
    {
      priority: OrderPriority.URGENT,
      label: '緊急',
      icon: Zap,
      color: 'bg-red-100 text-red-600 hover:bg-red-200'
    }
  ];

  const currentStatusConfig = getStatusConfig(order.status);
  const currentPriority = order.priority;

  // Handle confirm action
  const handleConfirm = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'status') {
      onStatusUpdate(
        order.id, 
        confirmAction.value, 
        notes || undefined, 
        estimatedTime > 0 ? estimatedTime : undefined
      );
    } else if (confirmAction.type === 'priority') {
      onPriorityUpdate(order.id, confirmAction.value, reason || undefined);
    }

    // Reset state
    setShowConfirm(false);
    setConfirmAction(null);
    setNotes('');
    setEstimatedTime(0);
    setReason('');
  };

  // Handle action click
  const handleActionClick = (type: 'status' | 'priority', value: any, label: string, color: string) => {
    if (!showConfirmDialog) {
      if (type === 'status') {
        onStatusUpdate(order.id, value);
      } else {
        onPriorityUpdate(order.id, value);
      }
      return;
    }

    setConfirmAction({ type, value, label, color });
    setShowConfirm(true);
  };

  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        button: 'px-2 py-1 text-xs',
        text: 'text-xs',
        icon: 'w-3 h-3'
      },
      md: {
        button: 'px-3 py-1.5 text-sm',
        text: 'text-sm',
        icon: 'w-4 h-4'
      },
      lg: {
        button: 'px-4 py-2 text-base',
        text: 'text-base',
        icon: 'w-5 h-5'
      }
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  // Render confirmation dialog
  const renderConfirmDialog = () => {
    if (!showConfirm || !confirmAction) return null;

    const action = confirmAction.type === 'status' 
      ? currentStatusConfig.nextActions.find(a => a.status === confirmAction.value)
      : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <div className={cn('p-3 rounded-full mr-4', confirmAction.color.replace('hover:', ''))}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                確認操作
              </h3>
              <p className="text-gray-600">
                確定要{confirmAction.label}嗎？
              </p>
            </div>
          </div>

          {/* Order info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">訂單資訊</div>
            <div className="font-medium text-gray-900">#{order.orderNumber}</div>
            <div className="text-sm text-gray-600">{order.customer.name}</div>
          </div>

          {/* Additional inputs based on action */}
          {action?.requiresTime && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                預計製作時間（分鐘）
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：15"
              />
            </div>
          )}

          {/* Notes input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {confirmAction.type === 'status' ? '備註' : '原因'}（選填）
            </label>
            <textarea
              rows={3}
              value={confirmAction.type === 'status' ? notes : reason}
              onChange={(e) => {
                if (confirmAction.type === 'status') {
                  setNotes(e.target.value);
                } else {
                  setReason(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={confirmAction.type === 'status' ? '請輸入備註...' : '請說明原因...'}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUpdating}
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating}
              className={cn(
                'flex-1 px-4 py-2 font-medium rounded-lg transition-colors',
                confirmAction.color,
                isUpdating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>處理中...</span>
                </div>
              ) : (
                `確認${confirmAction.label}`
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render buttons variant
  const renderButtons = () => (
    <div className="space-y-4">
      {/* Status Actions */}
      {currentStatusConfig.nextActions.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">狀態操作</div>
          <div className="flex flex-wrap gap-2">
            {currentStatusConfig.nextActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleActionClick('status', action.status, action.label, action.color)}
                  disabled={isUpdating}
                  className={cn(
                    'flex items-center space-x-2 font-medium rounded-lg transition-colors',
                    action.color,
                    sizeClasses.button,
                    isUpdating && 'opacity-50 cursor-not-allowed'
                  )}
                  title={action.description}
                >
                  <Icon className={sizeClasses.icon} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority Actions */}
      {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">優先級設定</div>
          <div className="flex flex-wrap gap-2">
            {priorityActions
              .filter(action => action.priority !== currentPriority)
              .slice(0, 2)
              .map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleActionClick('priority', action.priority, action.label, action.color)}
                    disabled={isUpdating}
                    className={cn(
                      'flex items-center space-x-2 font-medium rounded-lg border transition-colors',
                      action.color,
                      sizeClasses.button,
                      isUpdating && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Icon className={sizeClasses.icon} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  // Render quick variant (minimal buttons)
  const renderQuick = () => {
    if (currentStatusConfig.nextActions.length === 0) return null;

    const primaryAction = currentStatusConfig.nextActions[0];
    const Icon = primaryAction.icon;

    return (
      <button
        onClick={() => handleActionClick('status', primaryAction.status, primaryAction.label, primaryAction.color)}
        disabled={isUpdating}
        className={cn(
          'flex items-center space-x-2 font-medium rounded-lg transition-colors',
          primaryAction.color,
          sizeClasses.button,
          isUpdating && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Icon className={sizeClasses.icon} />
        <span>{primaryAction.label}</span>
      </button>
    );
  };

  // Render timeline variant (visual progress)
  const renderTimeline = () => {
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED, 
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED
    ];

    const currentIndex = statuses.indexOf(order.status);

    return (
      <div className="space-y-4">
        {/* Timeline */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {statuses.map((status, index) => {
            const config = getStatusConfig(status);
            const Icon = config.icon;
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status} className="flex items-center flex-shrink-0">
                <div className={cn(
                  'p-2 rounded-full border-2 transition-colors',
                  isActive 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400',
                  isCurrent && 'ring-2 ring-blue-200'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {index < statuses.length - 1 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-2',
                    isActive ? 'bg-blue-500' : 'bg-gray-300'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current status and actions */}
        <div className="text-center">
          <div className={cn('text-sm font-medium', sizeClasses.text)}>
            目前狀態：{currentStatusConfig.label}
          </div>
          {currentStatusConfig.nextActions.length > 0 && (
            <div className="mt-3 flex justify-center">
              {renderQuick()}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render dropdown variant
  const renderDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={cn(
            'flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
            sizeClasses.button,
            isUpdating && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="flex items-center space-x-2">
            <span>更新狀態</span>
          </span>
          <ArrowRight className={cn('transform transition-transform', isOpen ? 'rotate-90' : 'rotate-0', sizeClasses.icon)} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <div className="py-1">
              {currentStatusConfig.nextActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      handleActionClick('status', action.status, action.label, action.color);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Icon className={sizeClasses.icon} />
                    <div>
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'buttons':
        return renderButtons();
      case 'dropdown':
        return renderDropdown();
      case 'timeline':
        return renderTimeline();
      case 'quick':
        return renderQuick();
      default:
        return renderButtons();
    }
  };

  return (
    <div className={cn('relative', className)}>
      {renderContent()}
      {renderConfirmDialog()}
    </div>
  );
}

export default StatusUpdater;