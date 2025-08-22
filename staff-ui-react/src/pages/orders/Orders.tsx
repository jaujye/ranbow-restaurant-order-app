/**
 * 📦 Orders Page
 * Order management and queue interface
 */

import React from 'react'
import { OrderQueue } from '@/components/orders'

const OrdersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <OrderQueue />
      </div>
    </div>
  )
}

export default OrdersPage