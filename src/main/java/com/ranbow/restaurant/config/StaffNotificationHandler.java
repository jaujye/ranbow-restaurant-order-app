package com.ranbow.restaurant.config;

import com.ranbow.restaurant.models.Notification;
import com.ranbow.restaurant.services.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.Map;

/**
 * WebSocket handler for real-time staff notifications
 * Manages WebSocket connections for staff members and broadcasts notifications
 */
@Component
public class StaffNotificationHandler implements WebSocketHandler {

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Map of staff ID to list of WebSocket sessions
    private final Map<String, List<WebSocketSession>> staffSessions = new ConcurrentHashMap<>();
    
    // Map of session ID to staff ID
    private final Map<String, String> sessionToStaffMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Staff notification WebSocket connection established: " + session.getId());
        
        // Extract staff ID from session attributes or query parameters
        String staffId = extractStaffId(session);
        if (staffId != null) {
            registerStaffSession(staffId, session);
            sessionToStaffMap.put(session.getId(), staffId);
            
            // Send welcome message with unread notification count
            int unreadCount = notificationService.countUnreadNotifications(staffId);
            sendMessage(session, Map.of(
                "type", "connection_established",
                "message", "連接已建立",
                "staffId", staffId,
                "unreadCount", unreadCount
            ));
        } else {
            session.close(CloseStatus.BAD_DATA.withReason("Missing staff ID"));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        try {
            String payload = message.getPayload().toString();
            @SuppressWarnings("unchecked")
            Map<String, Object> messageData = objectMapper.readValue(payload, Map.class);
            
            String staffId = sessionToStaffMap.get(session.getId());
            if (staffId == null) {
                return;
            }
            
            String messageType = (String) messageData.get("type");
            
            switch (messageType) {
                case "ping":
                    // Respond to ping with pong
                    sendMessage(session, Map.of("type", "pong", "timestamp", System.currentTimeMillis()));
                    break;
                    
                case "mark_read":
                    String notificationId = (String) messageData.get("notificationId");
                    if (notificationId != null) {
                        boolean success = notificationService.markAsRead(notificationId);
                        sendMessage(session, Map.of(
                            "type", "mark_read_response",
                            "success", success,
                            "notificationId", notificationId
                        ));
                    }
                    break;
                    
                case "get_unread_count":
                    int unreadCount = notificationService.countUnreadNotifications(staffId);
                    sendMessage(session, Map.of(
                        "type", "unread_count",
                        "count", unreadCount
                    ));
                    break;
                    
                case "get_recent_notifications":
                    List<Notification> recent = notificationService.getRecentNotifications(staffId, 1);
                    sendMessage(session, Map.of(
                        "type", "recent_notifications",
                        "notifications", recent
                    ));
                    break;
                    
                default:
                    System.out.println("Unknown message type: " + messageType);
            }
            
        } catch (Exception e) {
            System.err.println("Error handling WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("Staff notification WebSocket transport error: " + exception.getMessage());
        exception.printStackTrace();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        System.out.println("Staff notification WebSocket connection closed: " + session.getId() + ", status: " + closeStatus);
        
        String staffId = sessionToStaffMap.remove(session.getId());
        if (staffId != null) {
            unregisterStaffSession(staffId, session);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    // Public methods for broadcasting notifications
    
    /**
     * Broadcast notification to a specific staff member
     */
    public void broadcastToStaff(String staffId, Notification notification) {
        List<WebSocketSession> sessions = staffSessions.get(staffId);
        if (sessions != null && !sessions.isEmpty()) {
            Map<String, Object> message = Map.of(
                "type", "new_notification",
                "notification", notification
            );
            
            sessions.forEach(session -> {
                try {
                    sendMessage(session, message);
                } catch (Exception e) {
                    System.err.println("Error broadcasting to staff " + staffId + ": " + e.getMessage());
                }
            });
        }
    }

    /**
     * Broadcast notification to all connected staff
     */
    public void broadcastToAllStaff(Notification notification) {
        Map<String, Object> message = Map.of(
            "type", "broadcast_notification",
            "notification", notification
        );

        staffSessions.forEach((staffId, sessions) -> {
            sessions.forEach(session -> {
                try {
                    sendMessage(session, message);
                } catch (Exception e) {
                    System.err.println("Error broadcasting to all staff: " + e.getMessage());
                }
            });
        });
    }

    /**
     * Send order status update to relevant staff
     */
    public void broadcastOrderStatusUpdate(String orderId, String oldStatus, String newStatus) {
        Map<String, Object> message = Map.of(
            "type", "order_status_update",
            "orderId", orderId,
            "oldStatus", oldStatus,
            "newStatus", newStatus,
            "timestamp", System.currentTimeMillis()
        );

        staffSessions.forEach((staffId, sessions) -> {
            sessions.forEach(session -> {
                try {
                    sendMessage(session, message);
                } catch (Exception e) {
                    System.err.println("Error broadcasting order status update: " + e.getMessage());
                }
            });
        });
    }

    /**
     * Send emergency alert to all staff
     */
    public void broadcastEmergencyAlert(String orderId, String message) {
        Map<String, Object> alertMessage = Map.of(
            "type", "emergency_alert",
            "orderId", orderId,
            "message", message,
            "timestamp", System.currentTimeMillis(),
            "priority", "emergency"
        );

        staffSessions.forEach((staffId, sessions) -> {
            sessions.forEach(session -> {
                try {
                    sendMessage(session, alertMessage);
                } catch (Exception e) {
                    System.err.println("Error broadcasting emergency alert: " + e.getMessage());
                }
            });
        });
    }

    // Private helper methods

    private String extractStaffId(WebSocketSession session) {
        // Try to get staff ID from query parameters
        String query = session.getUri().getQuery();
        if (query != null) {
            String[] params = query.split("&");
            for (String param : params) {
                String[] keyValue = param.split("=");
                if (keyValue.length == 2 && "staffId".equals(keyValue[0])) {
                    return keyValue[1];
                }
            }
        }
        
        // Try to get from session attributes
        Object staffIdAttr = session.getAttributes().get("staffId");
        if (staffIdAttr != null) {
            return staffIdAttr.toString();
        }
        
        return null;
    }

    private void registerStaffSession(String staffId, WebSocketSession session) {
        staffSessions.computeIfAbsent(staffId, k -> new CopyOnWriteArrayList<>()).add(session);
        System.out.println("Registered session for staff: " + staffId + ", total sessions: " + 
                          staffSessions.get(staffId).size());
    }

    private void unregisterStaffSession(String staffId, WebSocketSession session) {
        List<WebSocketSession> sessions = staffSessions.get(staffId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                staffSessions.remove(staffId);
            }
            System.out.println("Unregistered session for staff: " + staffId + ", remaining sessions: " + 
                              (sessions != null ? sessions.size() : 0));
        }
    }

    private void sendMessage(WebSocketSession session, Object message) throws IOException {
        if (session.isOpen()) {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        }
    }

    // Public getters for monitoring
    public int getConnectedStaffCount() {
        return staffSessions.size();
    }

    public int getTotalSessionCount() {
        return staffSessions.values().stream().mapToInt(List::size).sum();
    }
}