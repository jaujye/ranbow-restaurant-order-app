import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const KitchenPage = lazy(() => import('@/features/kitchen/pages/KitchenPage'));
const KitchenDisplayPage = lazy(() => import('@/features/kitchen/pages/KitchenDisplayPage'));
const StatsPage = lazy(() => import('@/features/stats/pages/StatsPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/shared/components/errors/NotFoundPage'));

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard Routes */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Order Management Routes */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        
        {/* Kitchen Management Routes */}
        <Route path="kitchen" element={<KitchenPage />} />
        
        {/* Kitchen Display Routes - 廚房大屏顯示 */}
        <Route path="kitchen/display/:displayId?" element={<KitchenDisplayPage />} />
        
        {/* Statistics Routes */}
        <Route path="stats" element={<StatsPage />} />
        
        {/* Notifications Routes */}
        <Route path="notifications" element={<NotificationsPage />} />
        
        {/* Profile Routes */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Catch all route - 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}