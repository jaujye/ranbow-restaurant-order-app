package com.ranbow.restaurant.staff.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.dto.KitchenWorkloadResponse;
import com.ranbow.restaurant.staff.repository.StaffMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Staff WebSocket Service
 * Handles real-time WebSocket communication for staff management system
 * 
 * Features:
 * - Real-time order updates
 * - Staff-specific messaging
 * - Role-based broadcasting
 * - Kitchen updates and alerts
 * - Connection management
 * - Message queuing for offline staff
 */
@Service
public class StaffWebSocketService {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffWebSocketService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private StaffMemberRepository staffMemberRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Thread pool for asynchronous WebSocket operations
    private final ExecutorService webSocketExecutor = Executors.newFixedThreadPool(10);
    
    // Connection tracking
    private final Map<String, StaffConnection> activeConnections = new ConcurrentHashMap<>();
    
    // WebSocket destinations
    private static final String TOPIC_ALL_STAFF = "/topic/staff/all";
    private static final String TOPIC_STAFF_ROLE = "/topic/staff/role/%s";
    private static final String QUEUE_STAFF_PERSONAL = "/queue/staff/%s";
    private static final String TOPIC_ORDER_UPDATES = "/topic/orders/updates";
    private static final String TOPIC_KITCHEN_UPDATES = "/topic/kitchen/updates";
    private static final String TOPIC_QUEUE_UPDATES = "/topic/queue/updates";
    
    /**
     * Broadcast message to all connected staff
     */
    public void broadcastToAllStaff(Object message) {
        if (message == null) {
            logger.warn("Cannot broadcast null message to all staff");
            return;
        }
        
        CompletableFuture.runAsync(() -> {
            try {
                logger.debug("Broadcasting message to all staff: {}", message.getClass().getSimpleName());
                
                WSMessage wsMessage = createWSMessage("BROADCAST", message);
                messagingTemplate.convertAndSend(TOPIC_ALL_STAFF, wsMessage);
                
                logger.info("Message broadcasted to all staff successfully");
                
            } catch (Exception e) {
                logger.error("Error broadcasting message to all staff: ", e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Send message to specific staff member
     */
    public void sendToStaff(String staffId, Object message) {
        if (staffId == null || message == null) {
            logger.warn("Cannot send message to staff - missing staffId or message");
            return;
        }
        
        CompletableFuture.runAsync(() -> {
            try {
                logger.debug("Sending message to staff {}: {}", staffId, message.getClass().getSimpleName());
                
                String destination = String.format(QUEUE_STAFF_PERSONAL, staffId);
                WSMessage wsMessage = createWSMessage("PERSONAL", message);
                
                messagingTemplate.convertAndSend(destination, wsMessage);
                
                // Update connection activity
                updateConnectionActivity(staffId);
                
                logger.debug("Message sent to staff {} successfully", staffId);
                
            } catch (Exception e) {
                logger.error("Error sending message to staff {}: ", staffId, e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Broadcast message to staff with specific role
     */
    public void broadcastToRole(String role, Object message) {
        if (role == null || message == null) {
            logger.warn("Cannot broadcast to role - missing role or message");
            return;
        }
        
        CompletableFuture.runAsync(() -> {
            try {
                logger.debug("Broadcasting message to role {}: {}", role, message.getClass().getSimpleName());
                
                String destination = String.format(TOPIC_STAFF_ROLE, role.toUpperCase());
                WSMessage wsMessage = createWSMessage("ROLE_BROADCAST", message);
                
                messagingTemplate.convertAndSend(destination, wsMessage);
                
                logger.info("Message broadcasted to role {} successfully", role);
                
            } catch (Exception e) {
                logger.error("Error broadcasting message to role {}: ", role, e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Send order update to all relevant staff
     */
    public void sendOrderUpdate(Order order) {
        if (order == null) {
            logger.warn("Cannot send null order update");
            return;
        }
        
        CompletableFuture.runAsync(() -> {
            try {
                logger.info("Sending order update for order: {}", order.getOrderId());
                
                OrderUpdateMessage updateMessage = OrderUpdateMessage.builder()
                    .orderId(order.getOrderId())
                    .status(order.getStatus().toString())
                    .tableNumber(order.getTableNumber())
                    .totalAmount(order.getTotalAmount())
                    .orderTime(order.getOrderTime())
                    .updateType("STATUS_CHANGE")
                    .timestamp(LocalDateTime.now())
                    .build();
                
                WSMessage wsMessage = createWSMessage("ORDER_UPDATE", updateMessage);
                
                // Send to order updates topic
                messagingTemplate.convertAndSend(TOPIC_ORDER_UPDATES, wsMessage);
                
                // Also send to assigned staff if any
                sendOrderUpdateToAssignedStaff(order.getOrderId(), updateMessage);
                
                logger.debug("Order update sent successfully for order: {}", order.getOrderId());
                
            } catch (Exception e) {
                logger.error("Error sending order update for order {}: ", order.getOrderId(), e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Send kitchen workload update
     */
    public void sendKitchenUpdate(KitchenWorkloadResponse workload) {
        if (workload == null) {
            logger.warn("Cannot send null kitchen workload update");
            return;
        }
        
        CompletableFuture.runAsync(() -> {
            try {
                logger.debug("Sending kitchen workload update");
                
                WSMessage wsMessage = createWSMessage("KITCHEN_WORKLOAD", workload);
                
                // Send to kitchen updates topic
                messagingTemplate.convertAndSend(TOPIC_KITCHEN_UPDATES, wsMessage);
                
                // Also send to kitchen staff and managers
                broadcastToRole("KITCHEN", wsMessage);
                broadcastToRole("MANAGER", wsMessage);
                
                logger.debug("Kitchen workload update sent successfully");
                
            } catch (Exception e) {
                logger.error("Error sending kitchen workload update: ", e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Send queue update notification
     */
    public void sendQueueUpdate() {
        CompletableFuture.runAsync(() -> {
            try {
                logger.debug("Sending queue update notification");
                
                QueueUpdateMessage updateMessage = QueueUpdateMessage.builder()
                    .updateType("QUEUE_REFRESH")
                    .timestamp(LocalDateTime.now())
                    .message("Order queue has been updated")
                    .build();
                
                WSMessage wsMessage = createWSMessage("QUEUE_UPDATE", updateMessage);
                
                // Send to queue updates topic
                messagingTemplate.convertAndSend(TOPIC_QUEUE_UPDATES, wsMessage);
                
                // Also broadcast to all staff
                broadcastToAllStaff(wsMessage);
                
                logger.debug("Queue update notification sent successfully");
                
            } catch (Exception e) {
                logger.error("Error sending queue update notification: ", e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Send staff assignment notification
     */
    public void sendStaffAssignmentNotification(String staffId, String orderId, String assignmentType) {
        if (staffId == null || orderId == null) {
            logger.warn("Cannot send assignment notification - missing staffId or orderId");
            return;
        }
        
        CompletableFuture.runAsync(() -> {
            try {
                logger.info("Sending assignment notification to staff {} for order {}", staffId, orderId);
                
                StaffAssignmentMessage assignmentMessage = StaffAssignmentMessage.builder()
                    .staffId(staffId)
                    .orderId(orderId)
                    .assignmentType(assignmentType)
                    .timestamp(LocalDateTime.now())
                    .message(String.format("You have been assigned to order #%s", orderId))
                    .build();
                
                sendToStaff(staffId, assignmentMessage);
                
                logger.debug("Assignment notification sent to staff {} successfully", staffId);
                
            } catch (Exception e) {
                logger.error("Error sending assignment notification to staff {}: ", staffId, e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Send system alert to all staff
     */
    public void sendSystemAlert(String alertType, String message, String priority) {
        CompletableFuture.runAsync(() -> {
            try {
                logger.warn("Sending system alert: {} - {}", alertType, message);
                
                SystemAlertMessage alertMessage = SystemAlertMessage.builder()
                    .alertType(alertType)
                    .message(message)
                    .priority(priority)
                    .timestamp(LocalDateTime.now())
                    .requiresAcknowledgment(priority.equals("CRITICAL") || priority.equals("URGENT"))
                    .build();
                
                WSMessage wsMessage = createWSMessage("SYSTEM_ALERT", alertMessage);
                
                // Send to all staff
                broadcastToAllStaff(wsMessage);
                
                // Also send to managers with higher priority
                broadcastToRole("MANAGER", wsMessage);
                
                logger.info("System alert sent successfully: {}", alertType);
                
            } catch (Exception e) {
                logger.error("Error sending system alert: ", e);
            }
        }, webSocketExecutor);
    }
    
    /**
     * Register staff connection
     */
    public void registerStaffConnection(String staffId, String sessionId) {
        if (staffId == null || sessionId == null) {
            logger.warn("Cannot register connection - missing staffId or sessionId");
            return;
        }
        
        try {
            StaffConnection connection = new StaffConnection(staffId, sessionId);
            activeConnections.put(staffId, connection);
            
            logger.info("Staff connection registered: {} (session: {})", staffId, sessionId);
            
            // Send welcome message to staff
            sendWelcomeMessage(staffId);
            
            // Notify other staff about online status (if enabled)
            // notifyStaffOnlineStatus(staffId, true);
            
        } catch (Exception e) {
            logger.error("Error registering staff connection for {}: ", staffId, e);
        }
    }
    
    /**
     * Unregister staff connection
     */
    public void unregisterStaffConnection(String staffId) {
        if (staffId == null) {
            logger.warn("Cannot unregister connection - missing staffId");
            return;
        }
        
        try {
            StaffConnection connection = activeConnections.remove(staffId);
            
            if (connection != null) {
                logger.info("Staff connection unregistered: {} (was connected for {} seconds)", 
                           staffId, connection.getConnectionDurationSeconds());
                
                // Notify other staff about offline status (if enabled)
                // notifyStaffOnlineStatus(staffId, false);
            }
            
        } catch (Exception e) {
            logger.error("Error unregistering staff connection for {}: ", staffId, e);
        }
    }
    
    /**
     * Get connection statistics
     */
    public ConnectionStatistics getConnectionStatistics() {
        try {
            int totalConnections = activeConnections.size();
            
            Map<String, Integer> roleConnections = activeConnections.values().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    conn -> getStaffRole(conn.getStaffId()),
                    java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.counting(),
                        Math::toIntExact
                    )
                ));
            
            return ConnectionStatistics.builder()
                .totalActiveConnections(totalConnections)
                .roleConnections(roleConnections)
                .timestamp(LocalDateTime.now())
                .build();
            
        } catch (Exception e) {
            logger.error("Error getting connection statistics: ", e);
            return ConnectionStatistics.builder()
                .totalActiveConnections(0)
                .timestamp(LocalDateTime.now())
                .build();
        }
    }
    
    // Private helper methods
    
    private WSMessage createWSMessage(String type, Object data) {
        return WSMessage.builder()
            .type(type)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    private void updateConnectionActivity(String staffId) {
        StaffConnection connection = activeConnections.get(staffId);
        if (connection != null) {
            connection.updateLastActivity();
        }
    }
    
    private void sendOrderUpdateToAssignedStaff(String orderId, OrderUpdateMessage updateMessage) {
        // This would typically query the order assignment to find the assigned staff
        // For now, we'll skip this implementation as it requires order assignment lookup
        logger.debug("Sending order update to assigned staff for order: {}", orderId);
    }
    
    private void sendWelcomeMessage(String staffId) {
        try {
            WelcomeMessage welcome = WelcomeMessage.builder()
                .message("Welcome to the Staff Order Management System")
                .timestamp(LocalDateTime.now())
                .serverTime(LocalDateTime.now())
                .build();
            
            sendToStaff(staffId, welcome);
            
        } catch (Exception e) {
            logger.error("Error sending welcome message to staff {}: ", staffId, e);
        }
    }
    
    private String getStaffRole(String staffId) {
        try {
            return staffMemberRepository.findById(staffId)
                .map(staff -> staff.getRole().name()) // Convert StaffRole enum to String
                .orElse("UNKNOWN");
        } catch (Exception e) {
            logger.error("Error getting staff role for {}: ", staffId, e);
            return "UNKNOWN";
        }
    }
    
    // Inner classes and DTOs
    
    /**
     * Staff Connection DTO
     * Tracks active WebSocket connections
     */
    public static class StaffConnection {
        private final String staffId;
        private final String sessionId;
        private final LocalDateTime connectedAt;
        private LocalDateTime lastActivity;
        
        public StaffConnection(String staffId, String sessionId) {
            this.staffId = staffId;
            this.sessionId = sessionId;
            this.connectedAt = LocalDateTime.now();
            this.lastActivity = LocalDateTime.now();
        }
        
        public void updateLastActivity() {
            this.lastActivity = LocalDateTime.now();
        }
        
        public long getConnectionDurationSeconds() {
            return java.time.Duration.between(connectedAt, LocalDateTime.now()).getSeconds();
        }
        
        // Getters
        public String getStaffId() { return staffId; }
        public String getSessionId() { return sessionId; }
        public LocalDateTime getConnectedAt() { return connectedAt; }
        public LocalDateTime getLastActivity() { return lastActivity; }
        
        @Override
        public String toString() {
            return String.format("StaffConnection{staffId='%s', sessionId='%s', connectedAt=%s}", 
                               staffId, sessionId, connectedAt);
        }
    }
    
    /**
     * WebSocket Message DTO
     */
    public static class WSMessage {
        private String type;
        private Object data;
        private LocalDateTime timestamp;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private WSMessage message = new WSMessage();
            
            public Builder type(String type) {
                message.type = type;
                return this;
            }
            
            public Builder data(Object data) {
                message.data = data;
                return this;
            }
            
            public Builder timestamp(LocalDateTime timestamp) {
                message.timestamp = timestamp;
                return this;
            }
            
            public WSMessage build() {
                return message;
            }
        }
        
        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
    
    /**
     * Order Update Message DTO
     */
    public static class OrderUpdateMessage {
        private String orderId;
        private String status;
        private String tableNumber;
        private java.math.BigDecimal totalAmount;
        private LocalDateTime orderTime;
        private String updateType;
        private LocalDateTime timestamp;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private OrderUpdateMessage message = new OrderUpdateMessage();
            
            public Builder orderId(String orderId) { message.orderId = orderId; return this; }
            public Builder status(String status) { message.status = status; return this; }
            public Builder tableNumber(String tableNumber) { message.tableNumber = tableNumber; return this; }
            public Builder totalAmount(java.math.BigDecimal totalAmount) { message.totalAmount = totalAmount; return this; }
            public Builder orderTime(LocalDateTime orderTime) { message.orderTime = orderTime; return this; }
            public Builder updateType(String updateType) { message.updateType = updateType; return this; }
            public Builder timestamp(LocalDateTime timestamp) { message.timestamp = timestamp; return this; }
            
            public OrderUpdateMessage build() { return message; }
        }
        
        // Getters and Setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
        public java.math.BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(java.math.BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public LocalDateTime getOrderTime() { return orderTime; }
        public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
        public String getUpdateType() { return updateType; }
        public void setUpdateType(String updateType) { this.updateType = updateType; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
    
    /**
     * Queue Update Message DTO
     */
    public static class QueueUpdateMessage {
        private String updateType;
        private LocalDateTime timestamp;
        private String message;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private QueueUpdateMessage message = new QueueUpdateMessage();
            
            public Builder updateType(String updateType) { message.updateType = updateType; return this; }
            public Builder timestamp(LocalDateTime timestamp) { message.timestamp = timestamp; return this; }
            public Builder message(String msg) { message.message = msg; return this; }
            
            public QueueUpdateMessage build() { return message; }
        }
        
        // Getters and Setters
        public String getUpdateType() { return updateType; }
        public void setUpdateType(String updateType) { this.updateType = updateType; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    /**
     * Staff Assignment Message DTO
     */
    public static class StaffAssignmentMessage {
        private String staffId;
        private String orderId;
        private String assignmentType;
        private LocalDateTime timestamp;
        private String message;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private StaffAssignmentMessage message = new StaffAssignmentMessage();
            
            public Builder staffId(String staffId) { message.staffId = staffId; return this; }
            public Builder orderId(String orderId) { message.orderId = orderId; return this; }
            public Builder assignmentType(String assignmentType) { message.assignmentType = assignmentType; return this; }
            public Builder timestamp(LocalDateTime timestamp) { message.timestamp = timestamp; return this; }
            public Builder message(String msg) { message.message = msg; return this; }
            
            public StaffAssignmentMessage build() { return message; }
        }
        
        // Getters and Setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getAssignmentType() { return assignmentType; }
        public void setAssignmentType(String assignmentType) { this.assignmentType = assignmentType; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    /**
     * System Alert Message DTO
     */
    public static class SystemAlertMessage {
        private String alertType;
        private String message;
        private String priority;
        private LocalDateTime timestamp;
        private boolean requiresAcknowledgment;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private SystemAlertMessage message = new SystemAlertMessage();
            
            public Builder alertType(String alertType) { message.alertType = alertType; return this; }
            public Builder message(String msg) { message.message = msg; return this; }
            public Builder priority(String priority) { message.priority = priority; return this; }
            public Builder timestamp(LocalDateTime timestamp) { message.timestamp = timestamp; return this; }
            public Builder requiresAcknowledgment(boolean requires) { message.requiresAcknowledgment = requires; return this; }
            
            public SystemAlertMessage build() { return message; }
        }
        
        // Getters and Setters
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public boolean isRequiresAcknowledgment() { return requiresAcknowledgment; }
        public void setRequiresAcknowledgment(boolean requiresAcknowledgment) { this.requiresAcknowledgment = requiresAcknowledgment; }
    }
    
    /**
     * Welcome Message DTO
     */
    public static class WelcomeMessage {
        private String message;
        private LocalDateTime timestamp;
        private LocalDateTime serverTime;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private WelcomeMessage message = new WelcomeMessage();
            
            public Builder message(String msg) { message.message = msg; return this; }
            public Builder timestamp(LocalDateTime timestamp) { message.timestamp = timestamp; return this; }
            public Builder serverTime(LocalDateTime serverTime) { message.serverTime = serverTime; return this; }
            
            public WelcomeMessage build() { return message; }
        }
        
        // Getters and Setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public LocalDateTime getServerTime() { return serverTime; }
        public void setServerTime(LocalDateTime serverTime) { this.serverTime = serverTime; }
    }
    
    /**
     * Connection Statistics DTO
     */
    public static class ConnectionStatistics {
        private int totalActiveConnections;
        private Map<String, Integer> roleConnections;
        private LocalDateTime timestamp;
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private ConnectionStatistics stats = new ConnectionStatistics();
            
            public Builder totalActiveConnections(int total) { stats.totalActiveConnections = total; return this; }
            public Builder roleConnections(Map<String, Integer> roleConnections) { stats.roleConnections = roleConnections; return this; }
            public Builder timestamp(LocalDateTime timestamp) { stats.timestamp = timestamp; return this; }
            
            public ConnectionStatistics build() { return stats; }
        }
        
        // Getters and Setters
        public int getTotalActiveConnections() { return totalActiveConnections; }
        public void setTotalActiveConnections(int totalActiveConnections) { this.totalActiveConnections = totalActiveConnections; }
        public Map<String, Integer> getRoleConnections() { return roleConnections; }
        public void setRoleConnections(Map<String, Integer> roleConnections) { this.roleConnections = roleConnections; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}