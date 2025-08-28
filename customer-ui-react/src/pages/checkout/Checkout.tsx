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
    badges: string[]
    enabled: boolean
    gradient: string
  }> = [
    {
      value: 'CREDIT_CARD',
      label: '信用卡支付',
      icon: <CreditCard className="w-6 h-6" />,
      description: '支援 Visa、MasterCard、JCB',
      badges: ['安全', '快速'],
      enabled: true,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      value: 'LINE_PAY',
      label: 'LINE Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'LINE 官方行動支付',
      badges: ['便利', '免手續費'],
      enabled: true,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      value: 'APPLE_PAY',
      label: 'Apple Pay',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Touch ID 或 Face ID 驗證',
      badges: ['生物識別', '極速'],
      enabled: true,
      gradient: 'from-gray-700 to-gray-900'
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
      // 創建訂單 - 符合CreateOrderRequest接口
      const orderData = {
        customerId: user?.id?.toString() || 'guest-user',
        tableNumber: checkoutData.tableNumber.replace(/[^\d]/g, '') || '1',
        items: cartItems.map(item => ({
          menuItemId: item.menuItem.itemId || item.menuItem.id?.toString() || '',
          quantity: item.quantity,
          specialRequests: item.specialRequests
        })),
        paymentMethod: checkoutData.paymentMethod,
        specialInstructions: checkoutData.specialRequests // 與後端API匹配的欄位名稱
      }

      // 調試信息
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2))

      const order = await createOrder(orderData)
      
      if (order) {
        setCreatedOrderId(order.id)
        
        // 跳轉到支付頁面，傳遞訂單ID和支付方式
        navigate(`/payment?orderId=${order.id}&paymentMethod=${checkoutData.paymentMethod}&amount=${cartTotal}`, {
          state: {
            orderId: order.id,
            paymentMethod: checkoutData.paymentMethod,
            amount: cartTotal,
            orderDetails: {
              items: cartItems,
              tableNumber: checkoutData.tableNumber,
              specialRequests: checkoutData.specialRequests
            }
          }
        })
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
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6 max-w-2xl">
        <Card className="p-4 sm:p-8 text-center bg-gradient-to-br from-white to-success-50/20 border-l-4 border-l-success-500 shadow-rainbow-lg">
          <div className="text-green-500 mb-6">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">訂單提交成功！</h1>
          
          <div className="text-text-secondary mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
            <p>您的訂單已成功提交並完成付款</p>
            <p>餐廳正在準備您的美味餐點</p>
            <div className="flex items-center justify-center gap-2 text-primary-500 font-medium">
              <Clock className="w-4 h-4" />
              預估等待時間：15-20 分鐘
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-primary-50/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-primary-200">
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
    <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/cart')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">結帳</h1>
          <p className="text-text-secondary text-sm">
            步驟 {currentStep} / 2
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary-500' : 'text-text-secondary'}`}>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-xs sm:text-sm font-medium">訂單確認</span>
          </div>
          
          <div className={`flex-1 h-0.5 sm:h-1 mx-2 sm:mx-4 ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary-500' : 'text-text-secondary'}`}>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-xs sm:text-sm font-medium">付款方式</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: 訂單確認 */}
          {currentStep === 1 && (
            <div className="space-y-3 sm:space-y-6">
              <Card className="p-3 sm:p-6 bg-gradient-to-r from-white to-primary-50/20 border-l-4 border-l-primary-500 shadow-large hover:shadow-rainbow-lg transition-all duration-300">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  訂單商品
                </h2>
                
                <div className="space-y-2.5 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5 sm:gap-4 pb-2.5 sm:pb-4 border-b border-border-light last:border-b-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 via-accent-400 to-secondary-400 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-medium">
                        <span className="text-lg sm:text-xl">
                          {item.menuItem.category === 'dessert' ? '🧁' : 
                           item.menuItem.category === 'beverage' ? '🥤' : 
                           item.menuItem.category === 'appetizer' ? '🥗' : '🍔'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-sm sm:text-base">{item.menuItem.name}</h3>
                        <p className="text-text-secondary text-xs sm:text-sm">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </p>
                        {item.specialRequests && (
                          <p className="text-xs sm:text-sm text-text-secondary mt-1">
                            備註: {item.specialRequests}
                          </p>
                        )}
                      </div>
                      
                      <div className="font-medium text-sm sm:text-base">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-3 sm:p-6 bg-gradient-to-r from-white to-accent-50/20 border-l-4 border-l-accent-500 shadow-large hover:shadow-rainbow-lg transition-all duration-300">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  用餐資訊
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">
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
                    <label className="block text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      特殊需求 (選填)
                    </label>
                    <textarea
                      value={checkoutData.specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="有任何特殊需求或備註嗎？"
                      className="w-full p-2.5 sm:p-3 border border-border-default rounded-lg resize-none h-16 sm:h-20 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleStepNext}
                  disabled={!checkoutData.tableNumber}
                  className="px-6 sm:px-8 py-2 sm:py-2.5"
                >
                  下一步
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: 付款方式 */}
          {currentStep === 2 && (
            <div className="space-y-3 sm:space-y-6">
              <Card className="p-3 sm:p-6 bg-gradient-to-r from-white to-secondary-50/20 border-l-4 border-l-secondary-500 shadow-large hover:shadow-rainbow-lg transition-all duration-300">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">選擇付款方式</h2>
                
                <div className="space-y-2.5 sm:space-y-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => method.enabled && handlePaymentMethodSelect(method.value)}
                      disabled={!method.enabled}
                      className={`w-full p-3 sm:p-6 rounded-xl border-2 text-left transition-all group ${
                        checkoutData.paymentMethod === method.value
                          ? 'border-primary-500 bg-primary-50 shadow-rainbow'
                          : method.enabled
                          ? 'border-border-light hover:border-primary-300 hover:shadow-medium'
                          : 'border-border-light bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${method.gradient} text-white shadow-medium`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                            {method.label}
                            {method.badges.map((badge, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gradient-to-r from-primary-100 to-accent-100 text-primary-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full"
                              >
                                {badge}
                              </span>
                            ))}
                          </h3>
                          <p className="text-text-secondary text-xs sm:text-sm">
                            {method.description}
                          </p>
                        </div>
                        {checkoutData.paymentMethod === method.value && (
                          <div className="text-primary-500">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                        <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleStepPrev} className="py-2 sm:py-2.5">
                  上一步
                </Button>
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={!checkoutData.paymentMethod || isCreatingOrder || isProcessingPayment}
                  className="px-6 sm:px-8 py-2 sm:py-2.5"
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
            <Card className="p-3 sm:p-6 bg-gradient-to-br from-white to-info-50/20 border-l-4 border-l-info-500 shadow-large">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">訂單摘要</h2>
              
              <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm">
                  <span>小計</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>稅金 (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>服務費 (10%)</span>
                  <span>{formatPrice(serviceCharge)}</span>
                </div>
                <div className="border-t border-border-light pt-2.5 sm:pt-3">
                  <div className="flex justify-between font-semibold text-base sm:text-lg">
                    <span>總計</span>
                    <span className="text-primary-500">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-text-secondary">
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