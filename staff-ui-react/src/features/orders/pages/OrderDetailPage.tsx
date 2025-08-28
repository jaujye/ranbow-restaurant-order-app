import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { OrderDetails, useOrdersStore, OrdersApiService } from '../index';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { selectedOrder, selectOrder, updating } = useOrdersStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load order details
  useEffect(() => {
    if (!orderId) {
      navigate('/staff/orders');
      return;
    }

    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const order = await OrdersApiService.getOrderDetails(orderId);
        selectOrder(order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, navigate, selectOrder]);

  // Handle order updates
  const handleStatusUpdate = async (orderId: string, status: any) => {
    try {
      await OrdersApiService.updateOrderStatus(orderId, { status });
      // Reload order details to get latest data
      const updatedOrder = await OrdersApiService.getOrderDetails(orderId);
      selectOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handlePriorityUpdate = async (orderId: string, priority: any) => {
    try {
      await OrdersApiService.updateOrderPriority(orderId, { priority });
      // Reload order details to get latest data
      const updatedOrder = await OrdersApiService.getOrderDetails(orderId);
      selectOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to update order priority:', error);
    }
  };

  const handleRefresh = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const order = await OrdersApiService.getOrderDetails(orderId);
      selectOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>載入訂單詳情中...</span>
        </div>
      </div>
    );
  }

  if (error || !selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/staff/orders')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回訂單列表</span>
            </button>
          </div>

          {/* Error message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-lg font-medium text-red-800 mb-2">載入失敗</div>
            <div className="text-red-600 mb-4">{error}</div>
            <div className="space-x-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                重試
              </button>
              <button
                onClick={() => navigate('/staff/orders')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回列表
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/staff/orders')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回訂單列表</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
        </div>

        {/* Order details */}
        <OrderDetails
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          onRefresh={handleRefresh}
          isUpdating={updating[selectedOrder.id]}
          showPrintOptions={true}
        />
      </div>
    </div>
  );
}

export default OrderDetailPage;