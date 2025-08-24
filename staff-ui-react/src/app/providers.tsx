import React from 'react';
import { AuthProvider } from '@/features/auth/store/AuthProvider';
import { WebSocketProvider } from '@/shared/services/websocket/WebSocketProvider';
import { ThemeProvider } from '@/shared/stores/ThemeProvider';
import { NotificationProvider } from '@/shared/stores/NotificationProvider';

interface GlobalProvidersProps {
  children: React.ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}