package com.ranbow.restaurant.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.Map;

/**
 * WebSocket handler for real-time order status updates
 * Manages connections specifically for order status monitoring
 */
public class OrderStatusWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("Order status WebSocket connection established: " + session.getId() + 
                          ", total connections: " + sessions.size());
        
        // Send welcome message
        sendMessage(session, Map.of(
            "type", "connection_established",
            "message", "訂單狀態監聽已建立",
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
                    
                case "subscribe_order":
                    String orderId = (String) messageData.get("orderId");
                    // Store subscription in session attributes
                    session.getAttributes().put("subscribedOrderId", orderId);
                    sendMessage(session, Map.of(
                        "type", "subscribed",
                        "orderId", orderId,
                        "message", "已訂閱訂單狀態更新"
                    ));
                    break;
                    
                case "unsubscribe_order":
                    session.getAttributes().remove("subscribedOrderId");
                    sendMessage(session, Map.of(
                        "type", "unsubscribed",
                        "message", "已取消訂閱"
                    ));
                    break;
                    
                default:
                    System.out.println("Unknown order status message type: " + messageType);
            }
            
        } catch (Exception e) {
            System.err.println("Error handling order status WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("Order status WebSocket transport error: " + exception.getMessage());
        exception.printStackTrace();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        sessions.remove(session);
        System.out.println("Order status WebSocket connection closed: " + session.getId() + 
                          ", remaining connections: " + sessions.size());
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    // Public methods for broadcasting order updates

    /**
     * Broadcast order status change to all connected clients
     */
    public void broadcastOrderStatusChange(String orderId, String oldStatus, String newStatus, 
                                          String staffId, String tableNumber) {
        Map<String, Object> message = Map.of(
            "type", "order_status_changed",
            "orderId", orderId,
            "oldStatus", oldStatus,
            "newStatus", newStatus,
            "updatedBy", staffId != null ? staffId : "system",
            "tableNumber", tableNumber != null ? tableNumber : "",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToAll(message);
    }

    /**
     * Broadcast new order notification
     */
    public void broadcastNewOrder(String orderId, String customerId, int tableNumber, 
                                 String orderSummary) {
        Map<String, Object> message = Map.of(
            "type", "new_order",
            "orderId", orderId,
            "customerId", customerId,
            "tableNumber", tableNumber,
            "summary", orderSummary,
            "timestamp", System.currentTimeMillis()
        );

        broadcastToAll(message);
    }

    /**
     * Broadcast order completion notification
     */
    public void broadcastOrderCompleted(String orderId, int tableNumber, String completedBy) {
        Map<String, Object> message = Map.of(
            "type", "order_completed",
            "orderId", orderId,
            "tableNumber", tableNumber,
            "completedBy", completedBy != null ? completedBy : "system",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToAll(message);
    }

    /**
     * Broadcast order cancellation
     */
    public void broadcastOrderCancelled(String orderId, int tableNumber, String reason, 
                                       String cancelledBy) {
        Map<String, Object> message = Map.of(
            "type", "order_cancelled",
            "orderId", orderId,
            "tableNumber", tableNumber,
            "reason", reason != null ? reason : "未指定原因",
            "cancelledBy", cancelledBy != null ? cancelledBy : "system",
            "timestamp", System.currentTimeMillis()
        );

        broadcastToAll(message);
    }

    /**
     * Broadcast kitchen timer update
     */
    public void broadcastKitchenTimerUpdate(String orderId, int remainingMinutes, 
                                          String status, boolean isOverdue) {
        Map<String, Object> message = Map.of(
            "type", "kitchen_timer_update",
            "orderId", orderId,
            "remainingMinutes", remainingMinutes,
            "status", status,
            "isOverdue", isOverdue,
            "timestamp", System.currentTimeMillis()
        );

        broadcastToAll(message);
    }

    // Private helper methods

    private void broadcastToAll(Map<String, Object> message) {
        sessions.forEach(session -> {
            try {
                sendMessage(session, message);
            } catch (Exception e) {
                System.err.println("Error broadcasting order status message: " + e.getMessage());
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
    public int getActiveSessionCount() {
        return sessions.size();
    }
}