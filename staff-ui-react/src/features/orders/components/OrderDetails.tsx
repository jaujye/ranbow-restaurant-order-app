import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Clock, CreditCard, 
  AlertTriangle, CheckCircle, Play, Package, Calendar,
  MessageSquare, Star, Printer, RefreshCw
} from 'lucide-react';
import { Order, OrderStatus, OrderPriority, PaymentStatus } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface OrderDetailsProps {
  order: Order | null;
  onClose?: () => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  onPriorityUpdate?: (orderId: string, priority: OrderPriority) => void;
  onRefresh?: (orderId: string) => void;
  isUpdating?: boolean;
  className?: string;
  showPrintOptions?: boolean;
}

export function OrderDetails({
  order,
  onClose,
  onStatusUpdate,
  onPriorityUpdate,
  onRefresh,
  isUpdating = false,
  className,
  showPrintOptions = true
}: OrderDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  if (!order) {
    return null;
  }

  // Status configuration
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.PENDING]: {
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        label: '待處理',
        nextActions: [
          { label: '確認訂單', status: OrderStatus.CONFIRMED, color: 'bg-blue-600 hover:bg-blue-700' },
          { label: '取消訂單', status: OrderStatus.CANCELLED, color: 'bg-red-600 hover:bg-red-700' }
        ]
      },
      [OrderStatus.CONFIRMED]: {
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        label: '已確認',
        nextActions: [
          { label: '開始製作', status: OrderStatus.PREPARING, color: 'bg-orange-600 hover:bg-orange-700' }
        ]
      },
      [OrderStatus.PREPARING]: {
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        badge: 'bg-orange-100 text-orange-800',
        icon: Play,
        label: '製作中',
        nextActions: [
          { label: '標記完成', status: OrderStatus.READY, color: 'bg-green-600 hover:bg-green-700' }
        ]
      },
      [OrderStatus.READY]: {
        color: 'text-green-700 bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800',
        icon: Package,
        label: '準備完成',
        nextActions: [
          { label: '交付給客戶', status: OrderStatus.COMPLETED, color: 'bg-gray-600 hover:bg-gray-700' }
        ]
      },
      [OrderStatus.COMPLETED]: {
        color: 'text-gray-700 bg-gray-50 border-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
        label: '已完成',
        nextActions: []
      },
      [OrderStatus.CANCELLED]: {
        color: 'text-red-700 bg-red-50 border-red-200',
        badge: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        label: '已取消',
        nextActions: []
      }
    };
    return configs[status];
  };

  // Payment status configuration
  const getPaymentStatusConfig = (status: PaymentStatus) => {
    const configs = {
      [PaymentStatus.PENDING]: { badge: 'bg-yellow-100 text-yellow-800', label: '待付款' },
      [PaymentStatus.PAID]: { badge: 'bg-green-100 text-green-800', label: '已付款' },
      [PaymentStatus.FAILED]: { badge: 'bg-red-100 text-red-800', label: '付款失敗' },
      [PaymentStatus.REFUNDED]: { badge: 'bg-gray-100 text-gray-800', label: '已退款' }
    };
    return configs[status];
  };

  // Priority configuration
  const getPriorityConfig = (priority: OrderPriority) => {
    const configs = {
      [OrderPriority.LOW]: { badge: 'bg-gray-100 text-gray-600', label: '低優先級' },
      [OrderPriority.NORMAL]: { badge: 'bg-blue-100 text-blue-600', label: '普通' },
      [OrderPriority.HIGH]: { badge: 'bg-yellow-100 text-yellow-600', label: '高優先級' },
      [OrderPriority.URGENT]: { badge: 'bg-red-100 text-red-600', label: '緊急' }
    };
    return configs[priority];
  };

  const statusConfig = getStatusConfig(order.status);
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
  const priorityConfig = getPriorityConfig(order.priority);
  const StatusIcon = statusConfig.icon;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP HH:mm', { locale: zhTW });
  };

  // Calculate time durations
  const getTimeDurations = () => {
    const created = new Date(order.createdAt);
    const updated = new Date(order.updatedAt);
    const now = new Date();
    
    const timeSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    const timeSinceUpdated = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    return {
      sinceCreated: timeSinceCreated,
      sinceUpdated: timeSinceUpdated,
      createdText: timeSinceCreated < 1 ? '剛剛' : `${timeSinceCreated}分鐘前`,
      updatedText: timeSinceUpdated < 1 ? '剛剛' : `${timeSinceUpdated}分鐘前`
    };
  };

  const timeDurations = getTimeDurations();

  // Handle print functions
  const handlePrint = (type: 'receipt' | 'kitchen' | 'label') => {
    window.print(); // This would be replaced with actual print functionality
  };

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              'p-3 rounded-full',
              statusConfig.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')
            )}>
              <StatusIcon className="w-6 h-6" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                訂單 #{order.orderNumber}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                <span className={cn('px-3 py-1 text-sm font-medium rounded-full', statusConfig.badge)}>
                  {statusConfig.label}
                </span>
                <span className={cn('px-3 py-1 text-sm font-medium rounded-full', paymentConfig.badge)}>
                  {paymentConfig.label}
                </span>
                {order.priority !== OrderPriority.NORMAL && (
                  <span className={cn('px-3 py-1 text-sm font-medium rounded-full', priorityConfig.badge)}>
                    {priorityConfig.label}
                  </span>
                )}
                {order.isUrgent && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>緊急訂單</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={() => onRefresh(order.id)}
                disabled={isUpdating}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className={cn('w-5 h-5', isUpdating && 'animate-spin')} />
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-sm text-gray-600">訂單金額</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-sm text-gray-600">下單時間</div>
            <div className="text-lg font-semibold text-gray-900">
              {timeDurations.createdText}
            </div>
          </div>
          
          {order.estimatedPrepTime && (
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-sm text-gray-600">預計完成</div>
              <div className="text-lg font-semibold text-gray-900">
                {order.estimatedPrepTime}分鐘
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Customer Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            客戶資訊
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">客戶姓名</div>
                <div className="font-medium text-gray-900">{order.customer.name}</div>
              </div>
              
              {order.customer.phone && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">聯絡電話</div>
                  <div className="font-medium text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {order.customer.phone}
                  </div>
                </div>
              )}
              
              {order.customer.email && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">電子郵件</div>
                  <div className="font-medium text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {order.customer.email}
                  </div>
                </div>
              )}
              
              {order.tableNumber && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">桌號</div>
                  <div className="font-medium text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {order.tableNumber}
                  </div>
                </div>
              )}
            </div>
            
            {order.customer.address && (
              <div>
                <div className="text-sm text-gray-600 mb-1">地址</div>
                <div className="font-medium text-gray-900">{order.customer.address}</div>
              </div>
            )}
          </div>
        </section>
        
        {/* Order Items */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              訂單明細 ({order.items.length}項)
            </h3>
            
            {order.items.length > 5 && (
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAllItems ? '收起' : '顯示全部'}
              </button>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {(showAllItems ? order.items : order.items.slice(0, 5)).map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.specialInstructions && (
                      <div className="text-sm text-yellow-700 mt-1 flex items-start">
                        <MessageSquare className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{item.specialInstructions}</span>
                      </div>
                    )}
                    {item.category && (
                      <div className="text-sm text-gray-500 mt-1">{item.category}</div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.price)} x {item.quantity}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!showAllItems && order.items.length > 5 && (
              <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">
                還有 {order.items.length - 5} 項商品未顯示
              </div>
            )}
            
            {/* Total */}
            <div className="p-4 bg-gray-100 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">總計</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Special Instructions */}
        {order.specialInstructions && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              特殊要求
            </h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-yellow-800">{order.specialInstructions}</div>
            </div>
          </section>
        )}
        
        {/* Payment Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            付款資訊
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">付款狀態</div>
                <span className={cn('px-3 py-1 text-sm font-medium rounded-full', paymentConfig.badge)}>
                  {paymentConfig.label}
                </span>
              </div>
              
              {order.paymentMethod && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">付款方式</div>
                  <div className="font-medium text-gray-900">{order.paymentMethod}</div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Timeline */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            訂單時程
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">下單時間</span>
              <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">最後更新</span>
              <span className="font-medium text-gray-900">{formatDate(order.updatedAt)}</span>
            </div>
            
            {order.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">完成時間</span>
                <span className="font-medium text-gray-900">{formatDate(order.completedAt)}</span>
              </div>
            )}
            
            {order.actualPrepTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">實際製作時間</span>
                <span className="font-medium text-gray-900">{order.actualPrepTime}分鐘</span>
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <div className="flex flex-wrap gap-3">
          {/* Status Actions */}
          {statusConfig.nextActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onStatusUpdate?.(order.id, action.status)}
              disabled={isUpdating}
              className={cn(
                'px-6 py-2 font-medium text-white rounded-lg transition-colors duration-200',
                action.color,
                isUpdating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUpdating ? '更新中...' : action.label}
            </button>
          ))}
          
          {/* Priority Actions */}
          {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
            <>
              {!order.isUrgent && (
                <button
                  onClick={() => onPriorityUpdate?.(order.id, OrderPriority.URGENT)}
                  disabled={isUpdating}
                  className="px-6 py-2 font-medium bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors duration-200"
                >
                  標記緊急
                </button>
              )}
              
              {order.isUrgent && (
                <button
                  onClick={() => onPriorityUpdate?.(order.id, OrderPriority.NORMAL)}
                  disabled={isUpdating}
                  className="px-6 py-2 font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  取消緊急
                </button>
              )}
            </>
          )}
          
          {/* Print Actions */}
          {showPrintOptions && (
            <div className="flex space-x-2 ml-auto">
              <button
                onClick={() => handlePrint('receipt')}
                className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="列印收據"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;