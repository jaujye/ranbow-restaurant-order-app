package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.staff.model.dto.KitchenWorkloadResponse;
import com.ranbow.restaurant.staff.model.dto.MessagePriority;
import com.ranbow.restaurant.staff.model.entity.OrderPriority;
import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.ranbow.restaurant.staff.websocket.StaffWebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Staff Event Publisher Service
 * 
 * Central event publishing service that listens to application events and
 * publishes relevant notifications to staff through WebSocket connections.
 * Integrates with Redis caching for performance and handles various event
 * types including orders, kitchen operations, and system events.
 * 
 * Features:
 * - Event-driven architecture integration
 * - Async event processing for performance
 * - Smart event filtering and routing
 * - Priority-based message delivery
 * - Kitchen capacity monitoring
 * - Order lifecycle tracking
 * - System alert management
 * - Performance metrics tracking
 */
@Service
public class StaffEventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffEventPublisher.class);
    
    @Autowired
    private StaffWebSocketService webSocketService;
    
    @Autowired
    private OrderQueueCacheService cacheService;
    
    // Event processing statistics
    private volatile long totalEventsProcessed = 0;
    private volatile long totalNotificationsSent = 0;
    private final Map<String, Long> eventTypeCounters = new HashMap<>();
    
    // Order Event Handlers
    
    /**
     * Handle new order events
     * Notifies appropriate staff based on order type and urgency
     */
    @EventListener
    @Async
    public void handleNewOrder(NewOrderEvent event) {
        logger.info("Processing new order event: {}", event.getOrderId());
        incrementEventCounter("NEW_ORDER");
        
        try {
            Order order = event.getOrder();
            OrderPriority priority = determineOrderPriority(order);
            
            // Cache order in queue
            cacheService.addOrderToQueue(order, priority);
            
            // Create order data for notification
            Map<String, Object> orderData = createOrderNotificationData(order, priority);
            
            // Determine target staff based on order characteristics
            StaffRole targetRole = determineTargetRole(order);
            MessagePriority messagePriority = determineMessagePriority(order, priority);
            
            // Send notification
            boolean sent = webSocketService.notifyNewOrder(orderData, targetRole, messagePriority);
            
            if (sent) {
                totalNotificationsSent++;
                logger.info("New order notification sent for order {}", order.getOrderId());
                
                // Cache assignment history
                cacheService.cacheAssignmentHistory(
                    order.getOrderId(), 
                    "SYSTEM", 
                    "NEW_ORDER_NOTIFICATION", 
                    "Order added to queue with priority " + priority
                );
            } else {
                logger.warn("Failed to send new order notification for order {}", order.getOrderId());
            }
            
        } catch (Exception e) {
            logger.error("Error handling new order event for order {}: ", event.getOrderId(), e);
        }
    }
    
    /**
     * Handle order status change events
     * Updates relevant staff about order progress
     */
    @EventListener
    @Async
    public void handleOrderStatusChange(OrderStatusChangeEvent event) {
        logger.info("Processing order status change: {} -> {}", 
                   event.getPreviousStatus(), event.getNewStatus());
        incrementEventCounter("ORDER_STATUS_CHANGE");
        
        try {
            Order order = event.getOrder();
            OrderStatus previousStatus = event.getPreviousStatus();
            OrderStatus newStatus = event.getNewStatus();
            
            // Update cache
            OrderPriority priority = determineOrderPriority(order);
            cacheService.moveOrderBetweenQueues(order.getOrderId(), previousStatus, newStatus, priority);
            
            // Create notification data
            Map<String, Object> updateData = createStatusUpdateData(order, previousStatus, newStatus);
            
            // Determine notification targets
            String assignedStaffId = event.getAssignedStaffId();
            StaffRole[] notifyRoles = determineStatusChangeNotificationRoles(previousStatus, newStatus);
            
            // Send notification
            boolean sent = webSocketService.notifyOrderUpdate(assignedStaffId, updateData, notifyRoles);
            
            if (sent) {
                totalNotificationsSent++;
                logger.info("Order status change notification sent for order {}", order.getOrderId());
                
                // Cache assignment history
                cacheService.cacheAssignmentHistory(
                    order.getOrderId(),
                    assignedStaffId != null ? assignedStaffId : "SYSTEM",
                    "STATUS_CHANGE",
                    String.format("Status changed from %s to %s", previousStatus, newStatus)
                );
            }
            
            // Handle special status changes
            handleSpecialStatusChanges(order, newStatus);
            
        } catch (Exception e) {
            logger.error("Error handling order status change event: ", e);
        }
    }
    
    /**
     * Handle urgent order events
     * Sends high-priority alerts to all available staff
     */
    @EventListener
    @Async
    public void handleUrgentOrder(UrgentOrderEvent event) {
        logger.warn("Processing urgent order event: {}", event.getOrderId());
        incrementEventCounter("URGENT_ORDER");
        
        try {
            Order order = event.getOrder();
            String urgencyReason = event.getUrgencyReason();
            
            // Create urgent order data
            Map<String, Object> urgentData = createUrgentOrderData(order, urgencyReason);
            
            // Send urgent notification to all staff
            int delivered = webSocketService.sendUrgentOrderAlert(urgentData);
            
            if (delivered > 0) {
                totalNotificationsSent += delivered;
                logger.warn("Urgent order alert sent to {} staff members for order {}", 
                           delivered, order.getOrderId());
                
                // Cache as urgent in Redis
                cacheService.cacheAssignmentHistory(
                    order.getOrderId(),
                    "SYSTEM",
                    "URGENT_ALERT",
                    "Order marked as urgent: " + urgencyReason
                );
            } else {
                logger.error("Failed to deliver urgent order alert for order {}", order.getOrderId());
            }
            
        } catch (Exception e) {
            logger.error("Error handling urgent order event for order {}: ", event.getOrderId(), e);
        }
    }
    
    // Kitchen Event Handlers
    
    /**
     * Handle kitchen capacity change events
     * Notifies kitchen staff about capacity issues
     */
    @EventListener
    @Async
    public void handleKitchenCapacityChange(KitchenCapacityEvent event) {
        logger.info("Processing kitchen capacity change event: {}", event.getCapacityStatus());
        incrementEventCounter("KITCHEN_CAPACITY_CHANGE");
        
        try {
            KitchenWorkloadResponse workload = event.getWorkloadResponse();
            
            // Cache workload data
            // cacheService.cacheKitchenWorkload(workload); // Method not available, implement if needed
            
            // Send capacity update to kitchen staff
            boolean sent = webSocketService.sendTimerUpdate(workload);
            
            // Check if capacity alert is needed
            if (isCapacityAlertNeeded(workload)) {
                webSocketService.sendCapacityAlert(workload);
                logger.warn("Capacity alert sent due to high kitchen load");
            }
            
            if (sent) {
                totalNotificationsSent++;
                logger.info("Kitchen capacity update sent");
            }
            
        } catch (Exception e) {
            logger.error("Error handling kitchen capacity change event: ", e);
        }
    }
    
    /**
     * Handle kitchen alert events
     * Sends alerts to kitchen staff and managers
     */
    @EventListener
    @Async
    public void handleKitchenAlert(KitchenAlertEvent event) {
        logger.warn("Processing kitchen alert event: {}", event.getAlertType());
        incrementEventCounter("KITCHEN_ALERT");
        
        try {
            String alertMessage = event.getAlertMessage();
            MessagePriority priority = event.isUrgent() ? MessagePriority.URGENT : MessagePriority.HIGH;
            
            // Send kitchen alert
            boolean sent = webSocketService.sendKitchenAlert(alertMessage, priority);
            
            if (sent) {
                totalNotificationsSent++;
                logger.warn("Kitchen alert sent: {}", alertMessage);
            } else {
                logger.error("Failed to send kitchen alert: {}", alertMessage);
            }
            
        } catch (Exception e) {
            logger.error("Error handling kitchen alert event: ", e);
        }
    }
    
    // System Event Handlers
    
    /**
     * Handle system notification events
     * Broadcasts system messages to appropriate staff
     */
    @EventListener
    @Async
    public void handleSystemNotification(SystemNotificationEvent event) {
        logger.info("Processing system notification event: {}", event.getTitle());
        incrementEventCounter("SYSTEM_NOTIFICATION");
        
        try {
            String title = event.getTitle();
            String message = event.getMessage();
            MessagePriority priority = event.getPriority();
            StaffRole targetRole = event.getTargetRole();
            
            // Send system notification
            int delivered = webSocketService.sendSystemNotification(title, message, priority, targetRole);
            
            if (delivered > 0) {
                totalNotificationsSent += delivered;
                logger.info("System notification '{}' sent to {} recipients", title, delivered);
            } else {
                logger.warn("System notification '{}' had no recipients", title);
            }
            
        } catch (Exception e) {
            logger.error("Error handling system notification event: ", e);
        }
    }
    
    /**
     * Handle staff session events
     * Manages staff connection and session notifications
     */
    @EventListener
    @Async
    public void handleStaffSessionEvent(StaffSessionEvent event) {
        logger.debug("Processing staff session event: {} for staff {}", 
                    event.getEventType(), event.getStaffId());
        incrementEventCounter("STAFF_SESSION");
        
        try {
            String staffId = event.getStaffId();
            String eventType = event.getEventType();
            
            switch (eventType) {
                case "LOGIN" -> handleStaffLogin(staffId, event.getSessionData());
                case "LOGOUT" -> handleStaffLogout(staffId, event.getSessionData());
                case "SESSION_EXPIRED" -> handleSessionExpired(staffId);
                case "DEVICE_SWITCH" -> handleDeviceSwitch(staffId, event.getSessionData());
            }
            
        } catch (Exception e) {
            logger.error("Error handling staff session event: ", e);
        }
    }
    
    // Private Helper Methods
    
    private OrderPriority determineOrderPriority(Order order) {
        // Business logic to determine order priority
        if (order.getTotalAmount().compareTo(new BigDecimal("500")) > 0) {
            return OrderPriority.HIGH;
        }
        
        // Check order age
        if (order.getOrderTime() != null) {
            Duration age = Duration.between(order.getOrderTime(), LocalDateTime.now());
            if (age.toMinutes() > 15) {
                return OrderPriority.HIGH;
            }
        }
        
        // Check special instructions
        if (order.getSpecialInstructions() != null && !order.getSpecialInstructions().isEmpty()) {
            return OrderPriority.MEDIUM;
        }
        
        return OrderPriority.NORMAL;
    }
    
    private StaffRole determineTargetRole(Order order) {
        // Business logic to determine which staff role should handle the order
        // This could be based on order type, menu items, etc.
        return StaffRole.WAITER; // Default for now
    }
    
    private MessagePriority determineMessagePriority(Order order, OrderPriority orderPriority) {
        return switch (orderPriority) {
            case EMERGENCY -> MessagePriority.HIGH;
            case URGENT -> MessagePriority.HIGH;
            case HIGH -> MessagePriority.HIGH;
            case MEDIUM -> MessagePriority.NORMAL;
            case NORMAL -> MessagePriority.NORMAL;
            case LOW -> MessagePriority.LOW;
        };
    }
    
    private Map<String, Object> createOrderNotificationData(Order order, OrderPriority priority) {
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getOrderId());
        data.put("customerId", order.getCustomerId());
        data.put("tableNumber", order.getTableNumber());
        data.put("totalAmount", order.getTotalAmount().toString());
        data.put("orderTime", order.getOrderTime().toString());
        data.put("status", order.getStatus().toString());
        data.put("priority", priority.toString());
        data.put("specialInstructions", order.getSpecialInstructions());
        data.put("itemCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
        data.put("notificationTime", LocalDateTime.now().toString());
        return data;
    }
    
    private Map<String, Object> createStatusUpdateData(Order order, OrderStatus previousStatus, OrderStatus newStatus) {
        Map<String, Object> data = new HashMap<>();
        data.put("orderId", order.getOrderId());
        data.put("previousStatus", previousStatus.toString());
        data.put("newStatus", newStatus.toString());
        data.put("updateTime", LocalDateTime.now().toString());
        data.put("customerId", order.getCustomerId());
        data.put("tableNumber", order.getTableNumber());
        data.put("totalAmount", order.getTotalAmount().toString());
        return data;
    }
    
    private Map<String, Object> createUrgentOrderData(Order order, String urgencyReason) {
        Map<String, Object> data = createOrderNotificationData(order, OrderPriority.HIGH);
        data.put("urgencyReason", urgencyReason);
        data.put("isUrgent", true);
        data.put("urgentSince", LocalDateTime.now().toString());
        return data;
    }
    
    private StaffRole[] determineStatusChangeNotificationRoles(OrderStatus previousStatus, OrderStatus newStatus) {
        // Determine which roles need to be notified based on status change
        return switch (newStatus) {
            case CONFIRMED -> new StaffRole[]{StaffRole.KITCHEN};
            case PREPARING -> new StaffRole[]{StaffRole.KITCHEN, StaffRole.WAITER};
            case READY -> new StaffRole[]{StaffRole.WAITER};
            case DELIVERED -> new StaffRole[]{StaffRole.MANAGER};
            default -> new StaffRole[]{};
        };
    }
    
    private void handleSpecialStatusChanges(Order order, OrderStatus newStatus) {
        // Handle special business logic for certain status changes
        switch (newStatus) {
            case READY -> {
                // Order is ready for pickup - send timer update
                Map<String, Object> timerData = Map.of(
                    "orderId", order.getOrderId(),
                    "status", "READY",
                    "readyTime", LocalDateTime.now()
                );
                webSocketService.sendTimerUpdate(timerData);
            }
            case CANCELLED -> {
                // Order cancelled - remove from cache
                cacheService.removeOrderFromQueue(order.getOrderId(), order.getStatus());
            }
        }
    }
    
    private boolean isCapacityAlertNeeded(KitchenWorkloadResponse workload) {
        // Business logic to determine if capacity alert is needed
        return workload.getCurrentCapacity() > 0.85; // Alert if over 85% capacity
    }
    
    private void handleStaffLogin(String staffId, Object sessionData) {
        logger.info("Staff {} logged in", staffId);
        // Could send welcome message or system status update
    }
    
    private void handleStaffLogout(String staffId, Object sessionData) {
        logger.info("Staff {} logged out", staffId);
        // Could send logout confirmation or cleanup notifications
    }
    
    private void handleSessionExpired(String staffId) {
        logger.warn("Session expired for staff {}", staffId);
        // Could send session expiry notification if staff is still connected
    }
    
    private void handleDeviceSwitch(String staffId, Object sessionData) {
        logger.info("Staff {} switched devices", staffId);
        // Could send device switch notification
    }
    
    private void incrementEventCounter(String eventType) {
        totalEventsProcessed++;
        eventTypeCounters.merge(eventType, 1L, Long::sum);
    }
    
    // Statistics and Monitoring
    
    /**
     * Get event processing statistics
     */
    public Map<String, Object> getEventStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEventsProcessed", totalEventsProcessed);
        stats.put("totalNotificationsSent", totalNotificationsSent);
        stats.put("eventTypeBreakdown", new HashMap<>(eventTypeCounters));
        stats.put("averageNotificationsPerEvent", 
                 totalEventsProcessed > 0 ? (double) totalNotificationsSent / totalEventsProcessed : 0.0);
        stats.put("timestamp", LocalDateTime.now());
        return stats;
    }
    
    // Event Classes (These would typically be in separate files)
    
    public static class NewOrderEvent {
        private final String orderId;
        private final Order order;
        
        public NewOrderEvent(String orderId, Order order) {
            this.orderId = orderId;
            this.order = order;
        }
        
        public String getOrderId() { return orderId; }
        public Order getOrder() { return order; }
    }
    
    public static class OrderStatusChangeEvent {
        private final Order order;
        private final OrderStatus previousStatus;
        private final OrderStatus newStatus;
        private final String assignedStaffId;
        
        public OrderStatusChangeEvent(Order order, OrderStatus previousStatus, OrderStatus newStatus, String assignedStaffId) {
            this.order = order;
            this.previousStatus = previousStatus;
            this.newStatus = newStatus;
            this.assignedStaffId = assignedStaffId;
        }
        
        public Order getOrder() { return order; }
        public OrderStatus getPreviousStatus() { return previousStatus; }
        public OrderStatus getNewStatus() { return newStatus; }
        public String getAssignedStaffId() { return assignedStaffId; }
    }
    
    public static class UrgentOrderEvent {
        private final String orderId;
        private final Order order;
        private final String urgencyReason;
        
        public UrgentOrderEvent(String orderId, Order order, String urgencyReason) {
            this.orderId = orderId;
            this.order = order;
            this.urgencyReason = urgencyReason;
        }
        
        public String getOrderId() { return orderId; }
        public Order getOrder() { return order; }
        public String getUrgencyReason() { return urgencyReason; }
    }
    
    public static class KitchenCapacityEvent {
        private final String capacityStatus;
        private final KitchenWorkloadResponse workloadResponse;
        
        public KitchenCapacityEvent(String capacityStatus, KitchenWorkloadResponse workloadResponse) {
            this.capacityStatus = capacityStatus;
            this.workloadResponse = workloadResponse;
        }
        
        public String getCapacityStatus() { return capacityStatus; }
        public KitchenWorkloadResponse getWorkloadResponse() { return workloadResponse; }
    }
    
    public static class KitchenAlertEvent {
        private final String alertType;
        private final String alertMessage;
        private final boolean urgent;
        
        public KitchenAlertEvent(String alertType, String alertMessage, boolean urgent) {
            this.alertType = alertType;
            this.alertMessage = alertMessage;
            this.urgent = urgent;
        }
        
        public String getAlertType() { return alertType; }
        public String getAlertMessage() { return alertMessage; }
        public boolean isUrgent() { return urgent; }
    }
    
    public static class SystemNotificationEvent {
        private final String title;
        private final String message;
        private final MessagePriority priority;
        private final StaffRole targetRole;
        
        public SystemNotificationEvent(String title, String message, MessagePriority priority, StaffRole targetRole) {
            this.title = title;
            this.message = message;
            this.priority = priority;
            this.targetRole = targetRole;
        }
        
        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public MessagePriority getPriority() { return priority; }
        public StaffRole getTargetRole() { return targetRole; }
    }
    
    public static class StaffSessionEvent {
        private final String staffId;
        private final String eventType;
        private final Object sessionData;
        
        public StaffSessionEvent(String staffId, String eventType, Object sessionData) {
            this.staffId = staffId;
            this.eventType = eventType;
            this.sessionData = sessionData;
        }
        
        public String getStaffId() { return staffId; }
        public String getEventType() { return eventType; }
        public Object getSessionData() { return sessionData; }
    }
}