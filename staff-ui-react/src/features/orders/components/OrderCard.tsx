import React from 'react';
import { Clock, User, Phone, MapPin, AlertTriangle, CheckCircle, Play, Package } from 'lucide-react';
import { Order, OrderStatus, OrderPriority } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onSelect?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  onPriorityUpdate?: (orderId: string, priority: OrderPriority) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  isSelected?: boolean;
  isUpdating?: boolean;
}

export function OrderCard({
  order,
  onSelect,
  onStatusUpdate,
  onPriorityUpdate,
  className,
  variant = 'default',
  showActions = true,
  isSelected = false,
  isUpdating = false
}: OrderCardProps) {
  
  // Status styling configuration
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.PENDING]: {
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        label: '待處理'
      },
      [OrderStatus.CONFIRMED]: {
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-800', 
        icon: CheckCircle,
        label: '已確認'
      },
      [OrderStatus.PREPARING]: {
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        badge: 'bg-orange-100 text-orange-800',
        icon: Play,
        label: '製作中'
      },
      [OrderStatus.READY]: {
        color: 'text-green-700 bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800',
        icon: Package,
        label: '已完成'
      },
      [OrderStatus.COMPLETED]: {
        color: 'text-gray-700 bg-gray-50 border-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
        label: '已交付'
      },
      [OrderStatus.CANCELLED]: {
        color: 'text-red-700 bg-red-50 border-red-200',
        badge: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        label: '已取消'
      }
    };
    return configs[status];
  };

  // Priority styling
  const getPriorityConfig = (priority: OrderPriority) => {
    const configs = {
      [OrderPriority.LOW]: { color: 'text-gray-600', badge: 'bg-gray-100 text-gray-600', label: '低' },
      [OrderPriority.NORMAL]: { color: 'text-blue-600', badge: 'bg-blue-100 text-blue-600', label: '普通' },
      [OrderPriority.HIGH]: { color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-600', label: '高' },
      [OrderPriority.URGENT]: { color: 'text-red-600', badge: 'bg-red-100 text-red-600', label: '緊急' }
    };
    return configs[priority];
  };

  const statusConfig = getStatusConfig(order.status) || {
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    icon: AlertTriangle,
    label: '未知狀態'
  };
  const priorityConfig = getPriorityConfig(order.priority) || {
    color: 'text-blue-600', 
    badge: 'bg-blue-100 text-blue-600', 
    label: '普通'
  };
  const StatusIcon = statusConfig.icon;

  // Calculate time since order creation
  const timeSinceCreation = () => {
    const now = new Date();
    const created = new Date(order.createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '剛剛';
    if (diffMinutes < 60) return `${diffMinutes}分鐘前`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小時前`;
    return format(created, 'MM/dd HH:mm');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Quick action buttons
  const getQuickActions = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return [
          { label: '確認', status: OrderStatus.CONFIRMED, color: 'bg-blue-600 hover:bg-blue-700' },
          { label: '取消', status: OrderStatus.CANCELLED, color: 'bg-red-600 hover:bg-red-700' }
        ];
      case OrderStatus.CONFIRMED:
        return [
          { label: '開始製作', status: OrderStatus.PREPARING, color: 'bg-orange-600 hover:bg-orange-700' }
        ];
      case OrderStatus.PREPARING:
        return [
          { label: '完成', status: OrderStatus.READY, color: 'bg-green-600 hover:bg-green-700' }
        ];
      case OrderStatus.READY:
        return [
          { label: '交付', status: OrderStatus.COMPLETED, color: 'bg-gray-600 hover:bg-gray-700' }
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  // Compact variant
  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          'p-3 border rounded-lg cursor-pointer transition-all duration-200',
          statusConfig.color,
          isSelected && 'ring-2 ring-blue-500 ring-offset-2',
          isUpdating && 'opacity-50 pointer-events-none',
          className
        )}
        onClick={() => onSelect?.(order)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-4 h-4" />
            <span className="font-medium text-sm">#{order.orderNumber}</span>
            {order.isUrgent && (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</div>
            <div className="text-xs text-gray-500">{timeSinceCreation()}</div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        'bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
        'border-l-4',
        statusConfig.color.split(' ')[2], // Extract border color
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isUpdating && 'opacity-50',
        className
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer" 
        onClick={() => onSelect?.(order)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <StatusIcon className={cn("w-5 h-5", statusConfig.color.split(' ')[0])} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                #{order.orderNumber}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  statusConfig.badge
                )}>
                  {statusConfig.label}
                </span>
                {order.priority !== OrderPriority.NORMAL && (
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    priorityConfig.badge
                  )}>
                    優先級：{priorityConfig.label}
                  </span>
                )}
                {order.isUrgent && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>緊急</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </div>
            <div className="text-sm text-gray-500">
              {timeSinceCreation()}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-medium">{order.customer.name}</span>
            {order.customer.phone && (
              <>
                <Phone className="w-4 h-4 ml-2" />
                <span>{order.customer.phone}</span>
              </>
            )}
          </div>
          
          {order.tableNumber && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>桌號：{order.tableNumber}</span>
            </div>
          )}
          
          {order.estimatedPrepTime && order.status === OrderStatus.PREPARING && (
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <Clock className="w-4 h-4" />
              <span>預計完成時間：{order.estimatedPrepTime}分鐘</span>
            </div>
          )}
        </div>

        {/* Order Items Preview */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            訂單內容 ({order.items.length}項)
          </div>
          <div className="space-y-1">
            {order.items.slice(0, variant === 'detailed' ? undefined : 3).map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
            {variant !== 'detailed' && order.items.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                還有 {order.items.length - 3} 項商品...
              </div>
            )}
          </div>
        </div>

        {order.specialInstructions && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs font-medium text-yellow-800 mb-1">特殊要求：</div>
            <div className="text-sm text-yellow-700">{order.specialInstructions}</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && quickActions.length > 0 && (
        <div className="border-t bg-gray-50 px-4 py-3 rounded-b-xl">
          <div className="flex space-x-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusUpdate?.(order.id, action.status);
                }}
                disabled={isUpdating}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors duration-200',
                  action.color,
                  isUpdating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isUpdating ? '更新中...' : action.label}
              </button>
            ))}
            
            {/* Priority toggle */}
            {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newPriority = order.isUrgent 
                    ? OrderPriority.NORMAL 
                    : OrderPriority.URGENT;
                  onPriorityUpdate?.(order.id, newPriority);
                }}
                disabled={isUpdating}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 border',
                  order.isUrgent 
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                )}
              >
                {order.isUrgent ? '取消緊急' : '標記緊急'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-xl">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            <span>更新中...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderCard;