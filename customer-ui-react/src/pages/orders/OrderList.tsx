import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { useOrderManagementStore } from '@/store'
import { getOrderStatusText } from '@/store/orderStore'
import { formatPrice } from '@/store/cartStore'
import { Order, OrderStatus } from '@/services/api'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Eye,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'

const OrderList: React.FC = () => {
  const navigate = useNavigate()
  const {
    orders,
    isLoading,
    error,
    hasActiveOrders,
    fetchUserOrders,
    getOrdersByStatus
  } = useOrderManagementStore()

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchUserOrders()
  }, [fetchUserOrders])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUserOrders()
    setRefreshing(false)
  }

  const handleViewOrder = (orderId: number) => {
    navigate(`/orders/${orderId}`)
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'PREPARING':
        return <Package className="w-5 h-5 text-orange-500" />
      case 'READY':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'READY':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const statusFilters: Array<{ value: OrderStatus | 'ALL'; label: string; count?: number }> = [
    { value: 'ALL', label: '全部訂單', count: orders.length },
    { value: 'PENDING_PAYMENT', label: '待付款', count: getOrdersByStatus('PENDING_PAYMENT').length },
    { value: 'CONFIRMED', label: '已確認', count: getOrdersByStatus('CONFIRMED').length },
    { value: 'PREPARING', label: '準備中', count: getOrdersByStatus('PREPARING').length },
    { value: 'READY', label: '可取餐', count: getOrdersByStatus('READY').length },
    { value: 'COMPLETED', label: '已完成', count: getOrdersByStatus('COMPLETED').length },
    { value: 'CANCELLED', label: '已取消', count: getOrdersByStatus('CANCELLED').length }
  ]

  const filteredOrders = selectedStatus === 'ALL' 
    ? orders 
    : getOrdersByStatus(selectedStatus)

  const formatOrderDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd HH:mm')
    } catch {
      return dateString
    }
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">我的訂單</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">載入訂單中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">我的訂單</h1>
            <p className="text-text-secondary text-sm">
              {hasActiveOrders && '您有進行中的訂單'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}

      {/* Active Orders Banner */}
      {hasActiveOrders && (
        <Card className="p-4 mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-center gap-3">
            <div className="text-primary-500">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-primary-700">有進行中的訂單</h3>
              <p className="text-primary-600 text-sm">
                您的餐點正在準備中，請留意訂單狀態更新
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Status Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-text-secondary" />
          <span className="font-medium">訂單狀態</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedStatus === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {filter.label}
              {filter.count !== undefined && filter.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedStatus === filter.value
                    ? 'bg-white bg-opacity-20'
                    : 'bg-white text-text-secondary'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4 opacity-50">
            📋
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {selectedStatus === 'ALL' ? '暫無訂單記錄' : `暫無${statusFilters.find(f => f.value === selectedStatus)?.label}`}
          </h2>
          <p className="text-text-secondary mb-6">
            {selectedStatus === 'ALL' 
              ? '還沒有任何訂單，快去點些美味的餐點吧！'
              : '在此狀態下暫無訂單'
            }
          </p>
          {selectedStatus === 'ALL' && (
            <Button onClick={() => navigate('/menu')}>
              開始點餐
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      訂單 #{order.id}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getOrderStatusText(order.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatOrderDate(order.createdAt)}
                    </div>
                    <div>桌號: {order.tableNumber}</div>
                    <div>{order.items.length} 項商品</div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewOrder(order.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  查看詳情
                </Button>
              </div>

              {/* Order Items Preview */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <span
                      key={`${order.id}-item-${item.id || item.menuItem.id}-${index}`}
                      className="px-2 py-1 bg-background-light rounded text-xs text-text-secondary"
                    >
                      {item.menuItem.name} × {item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="px-2 py-1 bg-background-light rounded text-xs text-text-secondary">
                      +{order.items.length - 3} 項
                    </span>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {order.specialRequests && (
                <div className="mb-3 p-3 bg-background-light rounded-lg">
                  <p className="text-sm text-text-secondary">
                    <strong>備註:</strong> {order.specialRequests}
                  </p>
                </div>
              )}

              {/* Order Total */}
              <div className="flex items-center justify-between pt-3 border-t border-border-light">
                <div className="text-sm text-text-secondary">
                  {order.paymentMethod && `付款方式: ${order.paymentMethod}`}
                </div>
                <div className="font-semibold text-lg text-primary-500">
                  總計: {formatPrice(order.totalAmount)}
                </div>
              </div>

              {/* Estimated Time for Active Orders */}
              {(order.status === 'CONFIRMED' || order.status === 'PREPARING') && order.estimatedTime && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      預估等待時間: {order.estimatedTime} 分鐘
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-4 mt-6">
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/menu')}
            className="w-full"
          >
            繼續點餐
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default OrderList