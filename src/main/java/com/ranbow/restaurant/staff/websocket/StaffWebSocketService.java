package com.ranbow.restaurant.staff.websocket;

import com.ranbow.restaurant.staff.model.dto.MessagePriority;
import com.ranbow.restaurant.staff.model.dto.MessageType;
import com.ranbow.restaurant.staff.model.dto.WSMessage;
import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.ranbow.restaurant.staff.service.StaffSessionRedisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

/**
 * Staff WebSocket Service
 * 
 * High-level service wrapper for WebSocket communications in the staff management
 * system. Provides business-logic focused methods for common messaging scenarios
 * with proper error handling, logging, and integration with Redis session management.
 * 
 * Features:
 * - Business-focused messaging methods
 * - Automatic message routing and delivery
 * - Integration with session management
 * - Async message processing
 * - Message delivery confirmation
 * - Statistics and monitoring
 * - Batch operations support
 */
@Service
public class StaffWebSocketService {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffWebSocketService.class);
    
    @Autowired
    private StaffWebSocketHandler webSocketHandler;
    
    @Autowired
    private StaffSessionRedisService sessionRedisService;
    
    // Message sending statistics
    private volatile long totalMessagesSent = 0;
    private volatile long totalBroadcastsSent = 0;
    private volatile long totalFailedDeliveries = 0;
    private final Map<MessageType, Long> messageTypeCounters = new HashMap<>();
    
    // Business Logic Messaging Methods
    
    /**
     * Send new order notification to available staff
     * Targets staff based on role and availability
     */
    public boolean notifyNewOrder(Object orderData, StaffRole targetRole, MessagePriority priority) {
        logger.info("Sending new order notification to role: {}", targetRole);
        
        WSMessage message = WSMessage.newOrder(orderData);
        message.setPriority(priority != null ? priority : MessagePriority.HIGH);
        message.setTargetRole(targetRole);
        
        int delivered = broadcastToRole(targetRole, message);
        incrementMessageCounter(MessageType.NEW_ORDER);
        
        if (delivered > 0) {
            logger.info("New order notification delivered to {} {} staff members", delivered, targetRole);
            return true;
        } else {
            logger.warn("Failed to deliver new order notification to any {} staff", targetRole);
            incrementFailedDeliveryCounter();
            return false;
        }
    }
    
    /**
     * Send order status update to assigned staff and relevant roles
     */
    public boolean notifyOrderUpdate(String assignedStaffId, Object orderData, StaffRole... notifyRoles) {
        logger.info("Sending order update notification to staff: {} and roles: {}", 
                   assignedStaffId, java.util.Arrays.toString(notifyRoles));
        
        WSMessage message = WSMessage.orderUpdate(orderData);
        boolean delivered = false;
        
        // Send to assigned staff
        if (assignedStaffId != null) {
            if (sendToStaff(assignedStaffId, message)) {
                delivered = true;
            }
        }
        
        // Send to relevant roles
        if (notifyRoles != null) {
            for (StaffRole role : notifyRoles) {
                int roleDelivered = broadcastToRole(role, message);
                if (roleDelivered > 0) {
                    delivered = true;
                }
            }
        }
        
        incrementMessageCounter(MessageType.ORDER_UPDATE);
        
        if (!delivered) {
            incrementFailedDeliveryCounter();
        }
        
        return delivered;
    }
    
    /**
     * Send urgent order alert to all available staff
     */
    public int sendUrgentOrderAlert(Object orderData) {
        logger.warn("Sending urgent order alert to all staff");
        
        WSMessage message = WSMessage.urgentOrder(orderData);
        int delivered = broadcastToAllStaff(message);
        
        incrementMessageCounter(MessageType.URGENT_ORDER);
        
        if (delivered == 0) {
            incrementFailedDeliveryCounter();
            logger.error("Failed to deliver urgent order alert to any staff member");
        } else {
            logger.info("Urgent order alert delivered to {} staff members", delivered);
        }
        
        return delivered;
    }
    
    /**
     * Send kitchen alert to kitchen staff
     */
    public boolean sendKitchenAlert(String alertMessage, MessagePriority priority) {
        logger.warn("Sending kitchen alert: {}", alertMessage);
        
        WSMessage message = WSMessage.kitchenAlert(alertMessage);
        message.setPriority(priority != null ? priority : MessagePriority.HIGH);
        
        int delivered = broadcastToRole(StaffRole.KITCHEN, message);
        incrementMessageCounter(MessageType.KITCHEN_ALERT);
        
        if (delivered > 0) {
            logger.info("Kitchen alert delivered to {} kitchen staff", delivered);
            return true;
        } else {
            logger.warn("Failed to deliver kitchen alert to any kitchen staff");
            incrementFailedDeliveryCounter();
            return false;
        }
    }
    
    /**
     * Send cooking timer update to kitchen staff
     */
    public boolean sendTimerUpdate(Object timerData) {
        logger.debug("Sending timer update to kitchen staff");
        
        WSMessage message = WSMessage.timerUpdate(timerData);
        int delivered = broadcastToRole(StaffRole.KITCHEN, message);
        
        incrementMessageCounter(MessageType.TIMER_UPDATE);
        
        return delivered > 0;
    }
    
    /**
     * Send capacity alert to managers and kitchen staff
     */
    public boolean sendCapacityAlert(Object capacityData) {
        logger.warn("Sending capacity alert");
        
        WSMessage message = WSMessage.capacityAlert(capacityData);
        
        int delivered = 0;
        delivered += broadcastToRole(StaffRole.KITCHEN, message);
        delivered += broadcastToRole(StaffRole.MANAGER, message);
        
        incrementMessageCounter(MessageType.CAPACITY_ALERT);
        
        if (delivered > 0) {
            logger.info("Capacity alert delivered to {} staff members", delivered);
            return true;
        } else {
            logger.warn("Failed to deliver capacity alert to any staff");
            incrementFailedDeliveryCounter();
            return false;
        }
    }
    
    /**
     * Send system notification to all staff or specific role
     */
    public int sendSystemNotification(String title, String message, MessagePriority priority, StaffRole targetRole) {
        logger.info("Sending system notification '{}' to {}", title, 
                   targetRole != null ? "role " + targetRole : "all staff");
        
        WSMessage wsMessage = WSMessage.systemNotification(title, message, priority);
        
        int delivered;
        if (targetRole != null) {
            delivered = broadcastToRole(targetRole, wsMessage);
        } else {
            delivered = broadcastToAllStaff(wsMessage);
        }
        
        incrementMessageCounter(MessageType.SYSTEM_NOTIFICATION);
        
        if (delivered == 0) {
            incrementFailedDeliveryCounter();
        }
        
        return delivered;
    }
    
    /**
     * Send personal message to specific staff member
     */
    public boolean sendPersonalMessage(String targetStaffId, String senderStaffId, String title, String message) {
        logger.info("Sending personal message from {} to {}: {}", senderStaffId, targetStaffId, title);
        
        WSMessage wsMessage = WSMessage.staffMessage(targetStaffId, title, message);
        wsMessage.setSourceStaffId(senderStaffId);
        
        boolean delivered = sendToStaff(targetStaffId, wsMessage);
        incrementMessageCounter(MessageType.STAFF_MESSAGE);
        
        if (!delivered) {
            incrementFailedDeliveryCounter();
            logger.warn("Failed to deliver personal message to staff {}", targetStaffId);
        }
        
        return delivered;
    }
    
    // Async messaging methods
    
    /**
     * Send message asynchronously to staff
     */
    @Async
    public CompletableFuture<Boolean> sendToStaffAsync(String staffId, WSMessage message) {
        logger.debug("Sending async message to staff {}: {}", staffId, message.getType());
        
        boolean result = sendToStaff(staffId, message);
        return CompletableFuture.completedFuture(result);
    }
    
    /**
     * Broadcast message asynchronously to role
     */
    @Async
    public CompletableFuture<Integer> broadcastToRoleAsync(StaffRole role, WSMessage message) {
        logger.debug("Broadcasting async message to role {}: {}", role, message.getType());
        
        int result = broadcastToRole(role, message);
        return CompletableFuture.completedFuture(result);
    }
    
    /**
     * Broadcast message asynchronously to all staff
     */
    @Async
    public CompletableFuture<Integer> broadcastToAllStaffAsync(WSMessage message) {
        logger.debug("Broadcasting async message to all staff: {}", message.getType());
        
        int result = broadcastToAllStaff(message);
        return CompletableFuture.completedFuture(result);
    }
    
    // Core messaging delegate methods
    
    /**
     * Send message to specific staff member
     */
    public boolean sendToStaff(String staffId, WSMessage message) {
        try {
            // Check if staff is active
            if (!sessionRedisService.getActiveStaffIds().contains(staffId)) {
                logger.debug("Staff {} is not active, message not sent", staffId);
                return false;
            }
            
            boolean sent = webSocketHandler.sendToStaff(staffId, message);
            
            if (sent) {
                totalMessagesSent++;
                logger.debug("Message sent to staff {}: {}", staffId, message.getType());
            }
            
            return sent;
            
        } catch (Exception e) {
            logger.error("Error sending message to staff {}: ", staffId, e);
            incrementFailedDeliveryCounter();
            return false;
        }
    }
    
    /**
     * Broadcast message to staff with specific role
     */
    public int broadcastToRole(StaffRole role, WSMessage message) {
        try {
            int sent = webSocketHandler.broadcastToRole(role, message);
            
            if (sent > 0) {
                totalBroadcastsSent++;
                totalMessagesSent += sent;
                logger.debug("Message broadcast to {} {} staff: {}", sent, role, message.getType());
            }
            
            return sent;
            
        } catch (Exception e) {
            logger.error("Error broadcasting message to role {}: ", role, e);
            incrementFailedDeliveryCounter();
            return 0;
        }
    }
    
    /**
     * Broadcast message to all connected staff
     */
    public int broadcastToAllStaff(WSMessage message) {
        try {
            webSocketHandler.broadcastToAllStaff(message);
            
            // Estimate delivery count based on active connections
            Set<String> activeStaff = sessionRedisService.getActiveStaffIds();
            int estimatedDelivery = activeStaff.size();
            
            totalBroadcastsSent++;
            totalMessagesSent += estimatedDelivery;
            
            logger.debug("Message broadcast to approximately {} staff: {}", 
                        estimatedDelivery, message.getType());
            
            return estimatedDelivery;
            
        } catch (Exception e) {
            logger.error("Error broadcasting message to all staff: ", e);
            incrementFailedDeliveryCounter();
            return 0;
        }
    }
    
    // Connection and status methods
    
    /**
     * Check if staff member is connected
     */
    public boolean isStaffConnected(String staffId) {
        return webSocketHandler.isStaffConnected(staffId);
    }
    
    /**
     * Get active staff connections
     */
    public Set<String> getActiveStaffIds() {
        return webSocketHandler.getActiveStaffIds();
    }
    
    /**
     * Get connection statistics
     */
    public Map<String, Object> getConnectionStatistics() {
        Map<String, Object> stats = webSocketHandler.getConnectionStats();
        
        // Add service-level statistics
        stats.put("totalMessagesSent", totalMessagesSent);
        stats.put("totalBroadcastsSent", totalBroadcastsSent);
        stats.put("totalFailedDeliveries", totalFailedDeliveries);
        stats.put("messageTypeCounters", new HashMap<>(messageTypeCounters));
        stats.put("serviceUptime", LocalDateTime.now());
        
        return stats;
    }
    
    /**
     * Get messaging statistics
     */
    public Map<String, Object> getMessagingStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalMessagesSent", totalMessagesSent);
        stats.put("totalBroadcastsSent", totalBroadcastsSent);
        stats.put("totalFailedDeliveries", totalFailedDeliveries);
        stats.put("successRate", calculateSuccessRate());
        stats.put("messageTypeBreakdown", new HashMap<>(messageTypeCounters));
        stats.put("timestamp", LocalDateTime.now());
        
        return stats;
    }
    
    // Health check methods
    
    /**
     * Perform WebSocket health check
     */
    public Map<String, Object> performHealthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Check connection statistics
            Map<String, Object> connectionStats = webSocketHandler.getConnectionStats();
            health.put("webSocketConnections", connectionStats);
            
            // Check active sessions
            Set<String> activeStaff = sessionRedisService.getActiveStaffIds();
            health.put("activeStaffCount", activeStaff.size());
            
            // Check message delivery health
            health.put("messagingHealth", getMessagingStatistics());
            
            // Overall health status
            int totalConnections = (Integer) connectionStats.getOrDefault("totalConnections", 0);
            boolean healthy = totalConnections >= 0 && calculateSuccessRate() >= 0.8;
            
            health.put("status", healthy ? "HEALTHY" : "DEGRADED");
            health.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            logger.error("Error performing health check: ", e);
            health.put("status", "UNHEALTHY");
            health.put("error", e.getMessage());
        }
        
        return health;
    }
    
    // Private helper methods
    
    private void incrementMessageCounter(MessageType messageType) {
        messageTypeCounters.merge(messageType, 1L, Long::sum);
    }
    
    private void incrementFailedDeliveryCounter() {
        totalFailedDeliveries++;
    }
    
    private double calculateSuccessRate() {
        long totalAttempts = totalMessagesSent + totalFailedDeliveries;
        if (totalAttempts == 0) return 1.0;
        
        return (double) totalMessagesSent / totalAttempts;
    }
    
    // Batch operations
    
    /**
     * Send multiple messages in batch
     */
    @Async
    public CompletableFuture<Map<String, Boolean>> sendBatchMessages(Map<String, WSMessage> staffMessages) {
        logger.info("Sending batch messages to {} staff members", staffMessages.size());
        
        Map<String, Boolean> results = new HashMap<>();
        
        for (Map.Entry<String, WSMessage> entry : staffMessages.entrySet()) {
            String staffId = entry.getKey();
            WSMessage message = entry.getValue();
            
            boolean sent = sendToStaff(staffId, message);
            results.put(staffId, sent);
        }
        
        long successful = results.values().stream().mapToLong(success -> success ? 1 : 0).sum();
        logger.info("Batch message operation completed: {}/{} successful", 
                   successful, staffMessages.size());
        
        return CompletableFuture.completedFuture(results);
    }
    
    /**
     * Emergency broadcast to all connected staff
     * High-priority message that bypasses normal filtering
     */
    public int emergencyBroadcast(String title, String message) {
        logger.error("EMERGENCY BROADCAST: {}", title);
        
        WSMessage emergencyMessage = WSMessage.systemNotification(title, message, MessagePriority.URGENT);
        emergencyMessage.setRequiresAcknowledgment(true);
        emergencyMessage.setTtlSeconds(1800L); // 30 minutes TTL
        
        int delivered = broadcastToAllStaff(emergencyMessage);
        
        // Also log to system for audit trail
        logger.error("Emergency broadcast '{}' delivered to {} staff members", title, delivered);
        
        return delivered;
    }
}