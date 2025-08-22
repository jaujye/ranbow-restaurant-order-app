import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, useDialogContext } from '@/components/ui'
import { useCheckoutStore } from '@/store'
import { getOrderStatusText, getPaymentMethodText } from '@/store/orderStore'
import { formatPrice } from '@/store/cartStore'
import { PaymentMethod } from '@/services/api'
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Wallet,
  MapPin,
  MessageSquare,
  ShoppingCart,
  Clock,
  CheckCircle
} from 'lucide-react'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { error: showError } = useDialogContext()
  const {
    user,
    isAuthenticated,
    cartItems,
    cartTotal,
    subtotal,
    tax,
    serviceCharge,
    clearCart,
    checkoutData,
    isCreatingOrder,
    isProcessingPayment,
    setTableNumber,
    setPaymentMethod,
    setSpecialRequests,
    createOrder,
    createPayment,
    processPayment,
    resetCheckoutData
  } = useCheckoutStore()

  const [currentStep, setCurrentStep] = useState(1) // 1: 訂單確認, 2: 付款方式, 3: 完成
  const [orderComplete, setOrderComplete] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)

  // 檢查用戶是否已登入和購物車是否有商品
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout')
      return
    }
    
    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }
  }, [isAuthenticated, cartItems.length, navigate])

  const paymentMethods: Array<{
    value: PaymentMethod
    label: string
    icon: React.ReactNode
    description: string
    enabled: boolean
  }> = [
    {
      value: 'CASH',
      label: '現金付款',
      icon: <DollarSign className="w-6 h-6" />,
      description: '到店付款',
      enabled: true
    },
    {
      value: 'CREDIT_CARD',
      label: '信用卡',
      icon: <CreditCard className="w-6 h-6" />,
      description: '支援 Visa、MasterCard',
      enabled: true
    },
    {
      value: 'LINE_PAY',
      label: 'LINE Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: '快速便利的行動支付',
      enabled: true
    },
    {
      value: 'APPLE_PAY',
      label: 'Apple Pay',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Touch ID 或 Face ID',
      enabled: false // 暫時停用
    }
  ]

  const handleStepNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitOrder = async () => {
    if (!checkoutData.tableNumber || !checkoutData.paymentMethod) {
      showError('請填寫完整的訂單資訊')
      return
    }

    try {
      // 創建訂單
      const orderData = {
        customerId: user?.id,
        tableNumber: checkoutData.tableNumber,
        items: cartItems.map(item => ({
          menuItemId: item.menuItem.itemId || item.menuItem.id?.toString() || '',
          quantity: item.quantity,
          specialRequests: item.specialRequests
        })),
        paymentMethod: checkoutData.paymentMethod,
        specialRequests: checkoutData.specialRequests
      }

      const order = await createOrder(orderData)
      
      if (order) {
        setCreatedOrderId(order.id)
        
        // 創建支付記錄
        const payment = await createPayment(order.id, checkoutData.paymentMethod)
        
        if (payment) {
          // 模擬支付處理（在實際應用中這裡會調用真實的支付 API）
          const paymentSuccess = await processPayment(payment.id, {
            transactionId: `tx_${Date.now()}`,
            providerData: { mock: true }
          })
          
          if (paymentSuccess) {
            setOrderComplete(true)
            clearCart()
            resetCheckoutData()
            setCurrentStep(3)
          }
        }
      }
    } catch (error) {
      console.error('Order submission failed:', error)
      showError('訂單提交失敗，請重試')
    }
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method)
  }

  const handleCompleteCheckout = () => {
    if (createdOrderId) {
      navigate(`/orders/${createdOrderId}`)
    } else {
      navigate('/orders')
    }
  }

  // 如果訂單完成，顯示成功頁面
  if (orderComplete && currentStep === 3) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="text-green-500 mb-6">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">訂單提交成功！</h1>
          
          <div className="text-text-secondary mb-6 space-y-2">
            <p>您的訂單已成功提交並完成付款</p>
            <p>餐廳正在準備您的美味餐點</p>
            <div className="flex items-center justify-center gap-2 text-primary-500 font-medium">
              <Clock className="w-4 h-4" />
              預估等待時間：15-20 分鐘
            </div>
          </div>
          
          <div className="bg-background-light rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">訂單編號</span>
                <p className="font-medium">#{createdOrderId}</p>
              </div>
              <div>
                <span className="text-text-secondary">桌號</span>
                <p className="font-medium">{checkoutData.tableNumber}</p>
              </div>
              <div>
                <span className="text-text-secondary">付款方式</span>
                <p className="font-medium">
                  {checkoutData.paymentMethod ? getPaymentMethodText(checkoutData.paymentMethod) : ''}
                </p>
              </div>
              <div>
                <span className="text-text-secondary">總金額</span>
                <p className="font-medium text-primary-500">
                  {formatPrice(cartTotal)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button onClick={handleCompleteCheckout} className="w-full">
              查看訂單詳情
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/menu')}
              className="w-full"
            >
              繼續購物
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/cart')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">結帳</h1>
          <p className="text-text-secondary text-sm">
            步驟 {currentStep} / 2
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary-500' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">訂單確認</span>
          </div>
          
          <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary-500' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">付款方式</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: 訂單確認 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  訂單商品
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border-light last:border-b-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {item.menuItem.category === 'dessert' ? '🧁' : 
                           item.menuItem.category === 'beverage' ? '🥤' : 
                           item.menuItem.category === 'appetizer' ? '🥗' : '🍔'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.menuItem.name}</h3>
                        <p className="text-text-secondary text-sm">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </p>
                        {item.specialRequests && (
                          <p className="text-sm text-text-secondary mt-1">
                            備註: {item.specialRequests}
                          </p>
                        )}
                      </div>
                      
                      <div className="font-medium">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  用餐資訊
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      桌號 *
                    </label>
                    <Input
                      value={checkoutData.tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="請輸入桌號 (例如: A1, B5, C12)"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      特殊需求 (選填)
                    </label>
                    <textarea
                      value={checkoutData.specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="有任何特殊需求或備註嗎？"
                      className="w-full p-3 border border-border-default rounded-lg resize-none h-20 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleStepNext}
                  disabled={!checkoutData.tableNumber}
                  className="px-8"
                >
                  下一步
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: 付款方式 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">選擇付款方式</h2>
                
                <div className="grid gap-4">
                  {paymentMethods.map((method) => (
                    <div key={method.value}>
                      <button
                        onClick={() => method.enabled && handlePaymentMethodSelect(method.value)}
                        disabled={!method.enabled}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          checkoutData.paymentMethod === method.value
                            ? 'border-primary-500 bg-primary-50'
                            : method.enabled
                            ? 'border-border-default hover:border-primary-300'
                            : 'border-border-light bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`${method.enabled ? 'text-primary-500' : 'text-gray-400'}`}>
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium flex items-center gap-2">
                              {method.label}
                              {!method.enabled && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  暫停服務
                                </span>
                              )}
                            </h3>
                            <p className="text-text-secondary text-sm">
                              {method.description}
                            </p>
                          </div>
                          {checkoutData.paymentMethod === method.value && (
                            <div className="text-primary-500">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleStepPrev}>
                  上一步
                </Button>
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={!checkoutData.paymentMethod || isCreatingOrder || isProcessingPayment}
                  className="px-8"
                >
                  {isCreatingOrder || isProcessingPayment ? (
                    <>處理中...</>
                  ) : (
                    '確認訂單並付款'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">訂單摘要</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>小計</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>稅金 (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>服務費 (10%)</span>
                  <span>{formatPrice(serviceCharge)}</span>
                </div>
                <div className="border-t border-border-light pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>總計</span>
                    <span className="text-primary-500">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <span>顧客:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                {checkoutData.tableNumber && (
                  <div className="flex items-center gap-2">
                    <span>桌號:</span>
                    <span className="font-medium">{checkoutData.tableNumber}</span>
                  </div>
                )}
                {checkoutData.paymentMethod && (
                  <div className="flex items-center gap-2">
                    <span>付款方式:</span>
                    <span className="font-medium">
                      {getPaymentMethodText(checkoutData.paymentMethod)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout