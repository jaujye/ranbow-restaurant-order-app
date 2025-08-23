package com.ranbow.restaurant.staff.config;

import com.ranbow.restaurant.staff.security.StaffWebSocketSecurity;
import com.ranbow.restaurant.staff.websocket.StaffWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket Configuration for Staff Management System
 * 
 * Configures WebSocket endpoints for real-time communication with staff clients.
 * Supports multiple connection types including staff notifications, order updates,
 * and kitchen alerts with proper security and CORS handling.
 * 
 * Features:
 * - Real-time staff notifications
 * - Order status updates
 * - Kitchen alerts and timers
 * - System notifications
 * - Role-based message broadcasting
 * 
 * Endpoints:
 * - /ws/staff/{staffId} - Main staff communication channel
 * - /ws/staff/notifications - General notifications
 * - /ws/kitchen - Kitchen-specific updates
 * - /ws/orders - Order management updates
 */
@Configuration
@EnableWebSocket
public class StaffWebSocketConfig implements WebSocketConfigurer {
    
    @Autowired
    private StaffWebSocketHandler staffWebSocketHandler;
    
    @Autowired
    private StaffWebSocketSecurity webSocketSecurity;
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        
        // Main staff WebSocket endpoint with staff ID parameter
        // Supports individual staff targeting and role-based broadcasting
        registry.addHandler(staffWebSocketHandler, "/ws/staff/{staffId}")
                .addInterceptors(webSocketSecurity) // Add security interceptor
                .setAllowedOrigins(
                    "http://localhost:3000",     // React development server
                    "http://localhost:3001",     // Alternative React port
                    "http://localhost:5173",     // Vite development server
                    "http://192.168.0.113:3000", // Network development access
                    "http://192.168.0.113:8087", // Production server
                    "http://127.0.0.1:3000",     // Local development
                    "*"                          // Allow all origins for development
                )
                .withSockJS(); // Enable SockJS fallback for browsers without WebSocket support
        
        // General staff notifications endpoint
        // Used for system-wide announcements and non-targeted messages
        registry.addHandler(staffWebSocketHandler, "/ws/staff/notifications")
                .addInterceptors(webSocketSecurity) // Add security interceptor
                .setAllowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001", 
                    "http://localhost:5173",
                    "http://192.168.0.113:3000",
                    "http://192.168.0.113:8087",
                    "http://127.0.0.1:3000",
                    "*"
                )
                .withSockJS();
        
        // Kitchen-specific WebSocket endpoint
        // Dedicated channel for kitchen staff with cooking timers and capacity alerts
        registry.addHandler(staffWebSocketHandler, "/ws/kitchen")
                .addInterceptors(webSocketSecurity) // Add security interceptor
                .setAllowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:5173", 
                    "http://192.168.0.113:3000",
                    "http://192.168.0.113:8087",
                    "http://127.0.0.1:3000",
                    "*"
                )
                .withSockJS();
        
        // Order management WebSocket endpoint
        // Real-time order updates, status changes, and assignment notifications
        registry.addHandler(staffWebSocketHandler, "/ws/orders")
                .addInterceptors(webSocketSecurity) // Add security interceptor
                .setAllowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:5173",
                    "http://192.168.0.113:3000", 
                    "http://192.168.0.113:8087",
                    "http://127.0.0.1:3000",
                    "*"
                )
                .withSockJS();
    }
}