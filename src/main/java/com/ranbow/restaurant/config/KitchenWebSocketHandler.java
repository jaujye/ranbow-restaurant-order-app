package com.ranbow.restaurant.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.Map;

/**
 * WebSocket handler for kitchen-specific real-time updates
 * Manages kitchen operations, cooking timers, and priority updates
 */
public class KitchenWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<WebSocketSession> kitchenSessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        kitchenSessions.add(session);
        System.out.println("Kitchen WebSocket connection established: " + session.getId() + 
                          ", total kitchen connections: " + kitchenSessions.size());
        
        // Send welcome message
        sendMessage(session, Map.of(
            "type", "kitchen_connection_established",
            "message", "廚房監聽已建立",
            "sessionId", session.getId()
        ));
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        try {
            String payload = message.getPayload().toString();
            @SuppressWarnings("unchecked")
            Map<String, Object> messageData = objectMapper.readValue(payload, Map.class);
            
            String messageType = (String) messageData.get("type");
            
            switch (messageType) {
                case "ping":
                    sendMessage(session, Map.of("type", "pong", "timestamp", System.currentTimeMillis()));
                    break;
                    
                case "get_kitchen_status":
                    // Send current kitchen status (could be enhanced with actual data)
                    sendMessage(session, Map.of(
                        "type", "kitchen_status",
                        "activeOrders", 0, // This would be populated with real data
                        "queuedOrders", 0,
                        "overdueOrders", 0,
                        "timestamp", System.currentTimeMillis()
                    ));
                    break;
                    
                default:
                    System.out.println("Unknown kitchen message type: " + messageType);
            }
            
        } catch (Exception e) {
            System.err.println("Error handling kitchen WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("Kitchen WebSocket transport error: " + exception.getMessage());
        exception.printStackTrace();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        kitchenSessions.remove(session);
        System.out.println("Kitchen WebSocket connection closed: " + session.getId() + 
                          ", remaining connections: " + kitchenSessions.size());
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    // Public methods for broadcasting kitchen updates

    /**
     * Broadcast new order to kitchen
     */
    public void broadcastNewOrderToKitchen(String orderId, int tableNumber, String orderSummary, 
                                         int estimatedCookingTime) {
        Map<String, Object> message = Map.of(
            "type", "new_kitchen_order",
            "orderId", orderId,
            "tableNumber", tableNumber,
            "summary", orderSummary,
            "estimatedCookingTime", estimatedCookingTime,
            "timestamp", System.currentTimeMillis()
        );

        broadcastToKitchen(message);
    }

    /**
     * Broadcast cooking progress update
     */
    public void broadcastCookingProgress(String orderId, String status, int remainingMinutes, 
                                       boolean isOverdue, String staffId) {
        Map<String, Object> message = Map.of(
            "type", "cooking_progress",
            "orderId", orderId,
            "status", status,
            "remainingMinutes", remainingMinutes,
            "isOverdue", isOverdue,
            "assignedStaffId", staffId != null ? staffId : "",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToKitchen(message);
    }

    /**
     * Broadcast priority change
     */
    public void broadcastPriorityChange(String orderId, int oldPriority, int newPriority, 
                                      String reason) {
        Map<String, Object> message = Map.of(
            "type", "priority_changed",
            "orderId", orderId,
            "oldPriority", oldPriority,
            "newPriority", newPriority,
            "reason", reason != null ? reason : "優先級調整",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToKitchen(message);
    }

    /**
     * Broadcast kitchen alert (overdue orders, equipment issues, etc.)
     */
    public void broadcastKitchenAlert(String alertType, String message, String orderId) {
        Map<String, Object> alertMessage = Map.of(
            "type", "kitchen_alert",
            "alertType", alertType,
            "message", message,
            "orderId", orderId != null ? orderId : "",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToKitchen(alertMessage);
    }

    /**
     * Broadcast cooking timer warning
     */
    public void broadcastTimerWarning(String orderId, int overdueMinutes) {
        Map<String, Object> message = Map.of(
            "type", "timer_warning",
            "orderId", orderId,
            "overdueMinutes", overdueMinutes,
            "severity", overdueMinutes > 15 ? "high" : "medium",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToKitchen(message);
    }

    // Private helper methods

    private void broadcastToKitchen(Map<String, Object> message) {
        kitchenSessions.forEach(session -> {
            try {
                sendMessage(session, message);
            } catch (Exception e) {
                System.err.println("Error broadcasting to kitchen: " + e.getMessage());
            }
        });
    }

    private void sendMessage(WebSocketSession session, Object message) throws IOException {
        if (session.isOpen()) {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        }
    }

    // Public getters for monitoring
    public int getActiveKitchenSessionCount() {
        return kitchenSessions.size();
    }
}