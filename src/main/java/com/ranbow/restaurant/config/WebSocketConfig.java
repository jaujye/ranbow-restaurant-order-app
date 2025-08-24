package com.ranbow.restaurant.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * WebSocket configuration for real-time staff notifications
 * Enables real-time communication for order updates, kitchen notifications, and staff alerts
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private StaffNotificationHandler staffNotificationHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register WebSocket handlers for staff notifications
        registry.addHandler(staffNotificationHandler, "/ws/staff/notifications")
                .setAllowedOrigins("*"); // Allow all origins for development
        
        // Register handler for order status updates
        registry.addHandler(new OrderStatusWebSocketHandler(), "/ws/staff/orders")
                .setAllowedOrigins("*");
        
        // Register handler for kitchen updates
        registry.addHandler(new KitchenWebSocketHandler(), "/ws/kitchen")
                .setAllowedOrigins("*");
    }
}