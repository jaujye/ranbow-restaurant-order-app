import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { useOrderManagementStore } from '@/store'
import { getOrderStatusText, getPaymentMethodText, formatPrice } from '@/store/orderStore'
import { OrderStatus } from '@/services/api'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  MapPin,
  CreditCard,
  MessageSquare,
  Phone,
  RefreshCw,
  Download,
  Star
} from 'lucide-react'
import { format } from 'date-fns'

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const {
    currentOrder,
    isLoading,
    error,
    fetchOrderById,
    cancelOrder
  } = useOrderManagementStore()

  const [refreshing, setRefreshing] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderById(parseInt(orderId))
    }
  }, [orderId, fetchOrderById])

  const handleRefresh = async () => {
    if (orderId) {
      setRefreshing(true)
      await fetchOrderById(parseInt(orderId))
      setRefreshing(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!currentOrder) return
    
    const reason = window.prompt('請說明取消訂單的原因：')
    if (reason === null) return // 用戶取消了對話框
    
    setCancelling(true)
    try {
      await cancelOrder(currentOrder.id, reason || '用戶取消')
      alert('訂單已成功取消')
    } catch (error) {
      alert('取消訂單失敗，請聯絡客服')
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = () => {
    if (!currentOrder) return
    
    // 這裡可以實現重新下單的邏輯
    // 將訂單商品添加到購物車並導航到結帳頁面
    alert('重新下單功能開發中...')
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'CONFIRMED':
        return <CheckCircle className="w-6 h-6 text-blue-500" />
      case 'PREPARING':
        return <Package className="w-6 h-6 text-orange-500" />
      case 'READY':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-gray-500" />
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Clock className="w-6 h-6 text-gray-500" />
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

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm:ss')
    } catch {
      return dateString
    }
  }

  const canCancelOrder = (status: OrderStatus) => {
    return ['PENDING_PAYMENT', 'CONFIRMED'].includes(status)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">載入訂單詳情中...</p>
        </div>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">訂單詳情</h1>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4 opacity-50">❌</div>
          <h2 className="text-xl font-semibold mb-2">訂單不存在</h2>
          <p className="text-text-secondary mb-6">
            找不到指定的訂單，可能已被刪除或您沒有查看權限
          </p>
          <Button onClick={() => navigate('/orders')}>
            返回訂單列表
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">訂單詳情</h1>
            <p className="text-text-secondary text-sm">
              #{currentOrder.id}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">訂單狀態</h2>
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentOrder.status)}
                  {getOrderStatusText(currentOrder.status)}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">訂單已創建</p>
                  <p className="text-sm text-text-secondary">
                    {formatDateTime(currentOrder.createdAt)}
                  </p>
                </div>
              </div>

              {currentOrder.status !== 'PENDING_PAYMENT' && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">訂單已確認</p>
                    <p className="text-sm text-text-secondary">餐廳已接受您的訂單</p>
                  </div>
                </div>
              )}

              {['PREPARING', 'READY', 'COMPLETED'].includes(currentOrder.status) && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">正在準備</p>
                    <p className="text-sm text-text-secondary">廚房正在製作您的餐點</p>
                  </div>
                </div>
              )}

              {['READY', 'COMPLETED'].includes(currentOrder.status) && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">餐點已完成</p>
                    <p className="text-sm text-text-secondary">
                      {currentOrder.status === 'COMPLETED' ? '您已取餐完成' : '請前往取餐'}
                    </p>
                  </div>
                </div>
              )}

              {currentOrder.status === 'CANCELLED' && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">訂單已取消</p>
                    <p className="text-sm text-text-secondary">
                      {currentOrder.updatedAt && formatDateTime(currentOrder.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Estimated Time for Active Orders */}
            {(currentOrder.status === 'CONFIRMED' || currentOrder.status === 'PREPARING') && currentOrder.estimatedTime && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    預估等待時間: {currentOrder.estimatedTime} 分鐘
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">訂單商品</h2>
            
            <div className="space-y-4">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-border-light last:border-b-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      {item.menuItem.category === 'dessert' ? '🧁' : 
                       item.menuItem.category === 'beverage' ? '🥤' : 
                       item.menuItem.category === 'appetizer' ? '🥗' : '🍔'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.menuItem.name}</h3>
                    <p className="text-text-secondary text-sm">
                      {item.menuItem.description || '美味的料理'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-primary-500 font-medium">
                        {formatPrice(item.unitPrice)}
                      </span>
                      <span className="text-text-secondary">數量: {item.quantity}</span>
                    </div>
                    {item.specialRequests && (
                      <p className="text-sm text-text-secondary mt-1">
                        備註: {item.specialRequests}
                      </p>
                    )}
                  </div>
                  
                  <div className="font-semibold">
                    {formatPrice(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Special Requests */}
          {currentOrder.specialRequests && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                特殊需求
              </h2>
              <p className="text-text-secondary bg-background-light p-4 rounded-lg">
                {currentOrder.specialRequests}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">訂單摘要</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>小計</span>
                  <span>{formatPrice(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>稅金 (5%)</span>
                  <span>{formatPrice(currentOrder.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>服務費 (10%)</span>
                  <span>{formatPrice(currentOrder.serviceCharge)}</span>
                </div>
                <div className="border-t border-border-light pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>總計</span>
                    <span className="text-primary-500">
                      {formatPrice(currentOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">訂單資訊</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">桌號</p>
                    <p className="font-medium">{currentOrder.tableNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">付款方式</p>
                    <p className="font-medium">
                      {currentOrder.paymentMethod ? getPaymentMethodText(currentOrder.paymentMethod) : '未設定'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">下單時間</p>
                    <p className="font-medium">
                      {formatDateTime(currentOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <div className="space-y-3">
                {canCancelOrder(currentOrder.status) && (
                  <Button
                    variant="ghost"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {cancelling ? '取消中...' : '取消訂單'}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={handleReorder}
                  className="w-full"
                >
                  重新下單
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => alert('收據下載功能開發中...')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下載收據
                </Button>
                
                {currentOrder.status === 'COMPLETED' && (
                  <Button
                    variant="ghost"
                    onClick={() => alert('評價功能開發中...')}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    評價餐點
                  </Button>
                )}
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 bg-primary-50 border-primary-200">
              <div className="text-center">
                <Phone className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-primary-700 mb-1">
                  需要幫助？
                </p>
                <p className="text-xs text-primary-600">
                  撥打客服專線
                </p>
                <p className="font-semibold text-primary-700">
                  (02) 1234-5678
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail