package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.repository.StaffMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Staff Notification Service
 * Handles real-time notifications for staff order management system
 * 
 * Features:
 * - Order status change notifications
 * - Urgent order alerts
 * - Assignment notifications
 * - Kitchen alerts and updates
 * - Asynchronous notification delivery
 * - Multiple notification channels support
 */
@Service
public class StaffNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffNotificationService.class);
    
    @Autowired
    private StaffMemberRepository staffMemberRepository;
    
    @Autowired
    private StaffWebSocketService webSocketService;
    
    // Thread pool for asynchronous notifications
    private final ExecutorService notificationExecutor = Executors.newFixedThreadPool(5);
    
    // Notification types
    public enum NotificationType {
        NEW_ORDER("New Order"),
        ORDER_STATUS_UPDATE("Order Status Update"),
        ORDER_ASSIGNMENT("Order Assignment"),
        URGENT_ORDER("Urgent Order"),
        KITCHEN_ALERT("Kitchen Alert"),
        STAFF_MESSAGE("Staff Message"),
        SYSTEM_ALERT("System Alert");
        
        private final String displayName;
        
        NotificationType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Notification priorities
    public enum NotificationPriority {
        LOW(1, "Low"),
        NORMAL(2, "Normal"), 
        HIGH(3, "High"),
        URGENT(4, "Urgent"),
        CRITICAL(5, "Critical");
        
        private final int level;
        private final String displayName;
        
        NotificationPriority(int level, String displayName) {
            this.level = level;
            this.displayName = displayName;
        }
        
        public int getLevel() { return level; }
        public String getDisplayName() { return displayName; }
    }
    
    /**
     * Notify about new order
     * Sends notification to all available staff about a new order
     */
    public void notifyNewOrder(Order order) {
        if (order == null) {
            logger.warn("Cannot notify about null order");
            return;
        }
        
        try {
            logger.info("Sending new order notification for order: {}", order.getOrderId());
            
            StaffNotification notification = StaffNotification.builder()
                .type(NotificationType.NEW_ORDER)
                .title("新訂單")
                .message(String.format("新訂單 #%s - 桌號: %s", order.getOrderId(), order.getTableNumber()))
                .priority(NotificationPriority.NORMAL)
                .orderId(order.getOrderId())
                .tableNumber(order.getTableNumber())
                .build();
            
            // Send to all on-duty staff asynchronously
            CompletableFuture.runAsync(() -> {
                try {
                    List<StaffMember> onDutyStaff = staffMemberRepository.findOnDutyStaff();
                    for (StaffMember staff : onDutyStaff) {
                        sendNotificationToStaff(staff.getStaffId(), notification);
                    }
                    
                    // Also broadcast to all connected clients
                    webSocketService.broadcastToAllStaff(createWSMessage("NEW_ORDER", notification));
                    
                } catch (Exception e) {
                    logger.error("Error sending new order notification: ", e);
                }
            }, notificationExecutor);
            
        } catch (Exception e) {
            logger.error("Error creating new order notification for order {}: ", order.getOrderId(), e);
        }
    }
    
    /**
     * Notify about order status update
     * Sends notification about order status changes
     */
    public void notifyOrderStatusUpdate(Order order, OrderStatus previousStatus) {
        if (order == null) {
            logger.warn("Cannot notify about null order");
            return;
        }
        
        try {
            logger.info("Sending order status update notification for order: {} ({} -> {})", 
                       order.getOrderId(), previousStatus, order.getStatus());
            
            String statusMessage = formatStatusChangeMessage(previousStatus, order.getStatus());
            
            StaffNotification notification = StaffNotification.builder()
                .type(NotificationType.ORDER_STATUS_UPDATE)
                .title("訂單狀態更新")
                .message(String.format("訂單 #%s %s", order.getOrderId(), statusMessage))
                .priority(determineStatusUpdatePriority(order.getStatus()))
                .orderId(order.getOrderId())
                .tableNumber(order.getTableNumber())
                .previousStatus(previousStatus != null ? previousStatus.toString() : null)
                .currentStatus(order.getStatus().toString())
                .build();
            
            // Send notification asynchronously
            CompletableFuture.runAsync(() -> {
                try {
                    // Send to assigned staff if any
                    sendToAssignedStaff(order.getOrderId(), notification);
                    
                    // Send to managers
                    sendToManagers(notification);
                    
                    // Broadcast status update
                    webSocketService.sendOrderUpdate(order);
                    
                } catch (Exception e) {
                    logger.error("Error sending order status update notification: ", e);
                }
            }, notificationExecutor);
            
        } catch (Exception e) {
            logger.error("Error creating order status update notification for order {}: ", order.getOrderId(), e);
        }
    }
    
    /**
     * Notify about urgent order
     * Sends high-priority notification for orders that need immediate attention
     */
    public void notifyUrgentOrder(Order order) {
        if (order == null) {
            logger.warn("Cannot notify about null urgent order");
            return;
        }
        
        try {
            logger.warn("Sending URGENT order notification for order: {}", order.getOrderId());
            
            // Determine urgency reason
            String urgencyReason = determineUrgencyReason(order);
            
            StaffNotification notification = StaffNotification.builder()
                .type(NotificationType.URGENT_ORDER)
                .title("緊急訂單")
                .message(String.format("⚠️ 緊急：訂單 #%s - %s", order.getOrderId(), urgencyReason))
                .priority(NotificationPriority.URGENT)
                .orderId(order.getOrderId())
                .tableNumber(order.getTableNumber())
                .urgencyReason(urgencyReason)
                .build();
            
            // Send to all staff immediately
            CompletableFuture.runAsync(() -> {
                try {
                    // Send to all on-duty staff
                    List<StaffMember> onDutyStaff = staffMemberRepository.findOnDutyStaff();
                    for (StaffMember staff : onDutyStaff) {
                        sendNotificationToStaff(staff.getStaffId(), notification);
                    }
                    
                    // Broadcast urgent notification
                    webSocketService.broadcastToAllStaff(createWSMessage("URGENT_ORDER", notification));
                    
                    logger.info("Urgent order notification sent to {} staff members", onDutyStaff.size());
                    
                } catch (Exception e) {
                    logger.error("Error sending urgent order notification: ", e);
                }
            }, notificationExecutor);
            
        } catch (Exception e) {
            logger.error("Error creating urgent order notification for order {}: ", order.getOrderId(), e);
        }
    }
    
    /**
     * Notify about order assignment
     * Sends notification when an order is assigned to a staff member
     */
    public void notifyOrderAssignment(Order order, StaffMember staff) {
        if (order == null || staff == null) {
            logger.warn("Cannot notify about assignment - missing order or staff");
            return;
        }
        
        try {
            logger.info("Sending order assignment notification for order: {} to staff: {}", 
                       order.getOrderId(), staff.getStaffId());
            
            StaffNotification notification = StaffNotification.builder()
                .type(NotificationType.ORDER_ASSIGNMENT)
                .title("新指派訂單")
                .message(String.format("您被指派處理訂單 #%s (桌號: %s)", order.getOrderId(), order.getTableNumber()))
                .priority(NotificationPriority.HIGH)
                .orderId(order.getOrderId())
                .tableNumber(order.getTableNumber())
                .assignedStaffId(staff.getStaffId())
                .assignedStaffName(staff.getName())
                .build();
            
            // Send to assigned staff
            CompletableFuture.runAsync(() -> {
                try {
                    sendNotificationToStaff(staff.getStaffId(), notification);
                    
                    // Also send to managers for visibility
                    sendToManagers(notification.withTitle("訂單已指派")
                                              .withMessage(String.format("訂單 #%s 已指派給 %s", 
                                                                        order.getOrderId(), staff.getName())));
                    
                } catch (Exception e) {
                    logger.error("Error sending order assignment notification: ", e);
                }
            }, notificationExecutor);
            
        } catch (Exception e) {
            logger.error("Error creating order assignment notification: ", e);
        }
    }
    
    /**
     * Broadcast queue update
     * Notifies all staff about queue status changes
     */
    public void broadcastQueueUpdate() {
        try {
            logger.debug("Broadcasting queue update to all staff");
            
            StaffNotification notification = StaffNotification.builder()
                .type(NotificationType.SYSTEM_ALERT)
                .title("訂單佇列更新")
                .message("訂單佇列已更新")
                .priority(NotificationPriority.LOW)
                .build();
            
            CompletableFuture.runAsync(() -> {
                try {
                    webSocketService.broadcastToAllStaff(createWSMessage("QUEUE_UPDATE", notification));
                } catch (Exception e) {
                    logger.error("Error broadcasting queue update: ", e);
                }
            }, notificationExecutor);
            
        } catch (Exception e) {
            logger.error("Error creating queue update broadcast: ", e);
        }
    }
    
    /**
     * Notify about kitchen alert
     * Sends notification about kitchen-related alerts
     */
    public void notifyKitchenAlert(String alertType, String message) {
        if (alertType == null || message == null) {
            logger.warn("Cannot send kitchen alert - missing type or message");
            return;
        }
        
        try {
            logger.info("Sending kitchen alert: {} - {}", alertType, message);
            
            NotificationPriority priority = determineKitchenAlertPriority(alertType);
            
            StaffNotification notification = StaffNotification.builder()
                .type(NotificationType.KITCHEN_ALERT)
                .title("廚房警示")
                .message(String.format("%s: %s", alertType, message))
                .priority(priority)
                .alertType(alertType)
                .build();
            
            CompletableFuture.runAsync(() -> {
                try {
                    // Send to kitchen staff and managers
                    List<StaffMember> kitchenStaff = staffMemberRepository.findByDepartment("KITCHEN");
                    List<StaffMember> managers = staffMemberRepository.findByRole("MANAGER");
                    
                    for (StaffMember staff : kitchenStaff) {
                        if (staff.isOnDuty()) {
                            sendNotificationToStaff(staff.getStaffId(), notification);
                        }
                    }
                    
                    for (StaffMember manager : managers) {
                        if (manager.isOnDuty()) {
                            sendNotificationToStaff(manager.getStaffId(), notification);
                        }
                    }
                    
                    // Broadcast to relevant staff
                    webSocketService.broadcastToRole("KITCHEN", createWSMessage("KITCHEN_ALERT", notification));
                    webSocketService.broadcastToRole("MANAGER", createWSMessage("KITCHEN_ALERT", notification));
                    
                } catch (Exception e) {
                    logger.error("Error sending kitchen alert notification: ", e);
                }
            }, notificationExecutor);
            
        } catch (Exception e) {
            logger.error("Error creating kitchen alert notification: ", e);
        }
    }
    
    // Private helper methods
    
    private void sendNotificationToStaff(String staffId, StaffNotification notification) {
        try {
            // Send via WebSocket
            webSocketService.sendToStaff(staffId, createWSMessage("NOTIFICATION", notification));
            
            // Could also send via other channels (email, SMS, push notification, etc.)
            // sendEmailNotification(staffId, notification);
            // sendSMSNotification(staffId, notification);
            
        } catch (Exception e) {
            logger.error("Error sending notification to staff {}: ", staffId, e);
        }
    }
    
    private void sendToAssignedStaff(String orderId, StaffNotification notification) {
        // This would typically query the order assignment to find the assigned staff
        // For now, we'll skip this implementation as it requires order assignment lookup
        logger.debug("Sending notification to assigned staff for order: {}", orderId);
    }
    
    private void sendToManagers(StaffNotification notification) {
        try {
            List<StaffMember> managers = staffMemberRepository.findByRole("MANAGER");
            for (StaffMember manager : managers) {
                if (manager.isOnDuty()) {
                    sendNotificationToStaff(manager.getStaffId(), notification);
                }
            }
        } catch (Exception e) {
            logger.error("Error sending notification to managers: ", e);
        }
    }
    
    private WSMessage createWSMessage(String type, StaffNotification notification) {
        return WSMessage.builder()
            .type(type)
            .data(notification)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    private String formatStatusChangeMessage(OrderStatus previousStatus, OrderStatus currentStatus) {
        return String.format("狀態變更：%s → %s", 
                           formatStatusName(previousStatus), 
                           formatStatusName(currentStatus));
    }
    
    private String formatStatusName(OrderStatus status) {
        if (status == null) return "未知";
        return switch (status) {
            case PENDING -> "待處理";
            case CONFIRMED -> "已確認";
            case PREPARING -> "製作中";
            case READY -> "準備完成";
            case DELIVERED -> "已送達";
            case COMPLETED -> "已完成";
            case CANCELLED -> "已取消";
            default -> status.toString();
        };
    }
    
    private NotificationPriority determineStatusUpdatePriority(OrderStatus status) {
        return switch (status) {
            case READY -> NotificationPriority.HIGH; // Ready for pickup/delivery
            case COMPLETED -> NotificationPriority.NORMAL;
            case CANCELLED -> NotificationPriority.HIGH;
            default -> NotificationPriority.LOW;
        };
    }
    
    private String determineUrgencyReason(Order order) {
        if (order.getOrderTime() != null) {
            long waitTimeMinutes = java.time.Duration.between(order.getOrderTime(), LocalDateTime.now()).toMinutes();
            if (waitTimeMinutes > 45) {
                return String.format("等候時間過長 (%d 分鐘)", waitTimeMinutes);
            }
            if (waitTimeMinutes > 30) {
                return "等候時間較長，需要關注";
            }
        }
        
        if (order.getSpecialInstructions() != null && order.getSpecialInstructions().toLowerCase().contains("urgent")) {
            return "客戶要求緊急處理";
        }
        
        return "需要立即處理";
    }
    
    private NotificationPriority determineKitchenAlertPriority(String alertType) {
        return switch (alertType.toUpperCase()) {
            case "CAPACITY_CRITICAL", "EQUIPMENT_FAILURE", "SAFETY_ALERT" -> NotificationPriority.CRITICAL;
            case "CAPACITY_HIGH", "OVERDUE_ORDER", "QUALITY_ISSUE" -> NotificationPriority.URGENT;
            case "CAPACITY_WARNING", "EFFICIENCY_LOW" -> NotificationPriority.HIGH;
            default -> NotificationPriority.NORMAL;
        };
    }
    
    /**
     * Staff Notification DTO
     * Data structure for staff notifications
     */
    public static class StaffNotification {
        private NotificationType type;
        private String title;
        private String message;
        private NotificationPriority priority;
        private LocalDateTime timestamp;
        private String orderId;
        private String tableNumber;
        private String previousStatus;
        private String currentStatus;
        private String assignedStaffId;
        private String assignedStaffName;
        private String urgencyReason;
        private String alertType;
        private boolean read;
        
        public StaffNotification() {
            this.timestamp = LocalDateTime.now();
            this.read = false;
        }
        
        // Builder pattern
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private StaffNotification notification = new StaffNotification();
            
            public Builder type(NotificationType type) {
                notification.type = type;
                return this;
            }
            
            public Builder title(String title) {
                notification.title = title;
                return this;
            }
            
            public Builder message(String message) {
                notification.message = message;
                return this;
            }
            
            public Builder priority(NotificationPriority priority) {
                notification.priority = priority;
                return this;
            }
            
            public Builder orderId(String orderId) {
                notification.orderId = orderId;
                return this;
            }
            
            public Builder tableNumber(String tableNumber) {
                notification.tableNumber = tableNumber;
                return this;
            }
            
            public Builder previousStatus(String previousStatus) {
                notification.previousStatus = previousStatus;
                return this;
            }
            
            public Builder currentStatus(String currentStatus) {
                notification.currentStatus = currentStatus;
                return this;
            }
            
            public Builder assignedStaffId(String staffId) {
                notification.assignedStaffId = staffId;
                return this;
            }
            
            public Builder assignedStaffName(String staffName) {
                notification.assignedStaffName = staffName;
                return this;
            }
            
            public Builder urgencyReason(String reason) {
                notification.urgencyReason = reason;
                return this;
            }
            
            public Builder alertType(String alertType) {
                notification.alertType = alertType;
                return this;
            }
            
            public StaffNotification build() {
                return notification;
            }
        }
        
        // Fluent modification methods
        public StaffNotification withTitle(String title) {
            this.title = title;
            return this;
        }
        
        public StaffNotification withMessage(String message) {
            this.message = message;
            return this;
        }
        
        // Getters and Setters (all properties)
        public NotificationType getType() { return type; }
        public void setType(NotificationType type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public NotificationPriority getPriority() { return priority; }
        public void setPriority(NotificationPriority priority) { this.priority = priority; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
        public String getPreviousStatus() { return previousStatus; }
        public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }
        public String getCurrentStatus() { return currentStatus; }
        public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
        public String getAssignedStaffId() { return assignedStaffId; }
        public void setAssignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; }
        public String getAssignedStaffName() { return assignedStaffName; }
        public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
        public String getUrgencyReason() { return urgencyReason; }
        public void setUrgencyReason(String urgencyReason) { this.urgencyReason = urgencyReason; }
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }
        
        @Override
        public String toString() {
            return String.format("StaffNotification{type=%s, priority=%s, title='%s', orderId='%s'}", 
                               type, priority, title, orderId);
        }
    }
    
    /**
     * WebSocket Message DTO
     * Data structure for WebSocket communication
     */
    public static class WSMessage {
        private String type;
        private Object data;
        private LocalDateTime timestamp;
        
        public WSMessage() {
            this.timestamp = LocalDateTime.now();
        }
        
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
        
        @Override
        public String toString() {
            return String.format("WSMessage{type='%s', timestamp=%s}", type, timestamp);
        }
    }
}