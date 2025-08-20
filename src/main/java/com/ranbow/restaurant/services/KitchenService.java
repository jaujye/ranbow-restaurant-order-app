package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.KitchenOrderDAO;
import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Kitchen service for managing kitchen operations
 * Handles cooking workflow, timing, and kitchen-specific order management
 */
@Service
public class KitchenService {

    @Autowired
    private KitchenOrderDAO kitchenOrderDAO;
    
    @Autowired
    private OrderDAO orderDAO;
    
    @Autowired
    private StaffService staffService;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Get kitchen preparation queue
     * @return List of orders waiting to be prepared
     */
    public List<KitchenOrder> getKitchenQueue() {
        try {
            return kitchenOrderDAO.getKitchenQueue();
        } catch (Exception e) {
            System.err.println("Error getting kitchen queue: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Get all active kitchen orders (preparing, cooking, plating)
     * @return List of active kitchen orders
     */
    public List<KitchenOrder> getActiveKitchenOrders() {
        try {
            return kitchenOrderDAO.findActiveOrders();
        } catch (Exception e) {
            System.err.println("Error getting active kitchen orders: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Get overdue kitchen orders
     * @return List of overdue orders
     */
    public List<KitchenOrder> getOverdueOrders() {
        try {
            return kitchenOrderDAO.findOverdueOrders();
        } catch (Exception e) {
            System.err.println("Error getting overdue orders: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Start preparing an order
     * @param orderId Order ID
     * @param staffId Staff ID of the chef
     * @return Success status
     */
    public boolean startPreparingOrder(String orderId, String staffId) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            
            if (kitchenOrderOpt.isEmpty()) {
                // Create new kitchen order if it doesn't exist
                Optional<Order> orderOpt = orderDAO.findById(orderId);
                if (orderOpt.isEmpty()) {
                    return false;
                }
                
                Order order = orderOpt.get();
                int estimatedCookingTime = calculateEstimatedCookingTime(order);
                
                KitchenOrder kitchenOrder = new KitchenOrder(orderId, estimatedCookingTime);
                kitchenOrder.startCooking(staffId);
                kitchenOrderDAO.save(kitchenOrder);
                
                // Update main order status
                orderDAO.updateStatus(orderId, OrderStatus.PREPARING);
                
                // Record staff activity
                staffService.updateStaffActivity(staffId);
                
                return true;
            } else {
                KitchenOrder kitchenOrder = kitchenOrderOpt.get();
                kitchenOrder.startCooking(staffId);
                kitchenOrderDAO.update(kitchenOrder);
                
                // Update main order status
                orderDAO.updateStatus(orderId, OrderStatus.PREPARING);
                
                // Record staff activity
                staffService.updateStaffActivity(staffId);
                
                return true;
            }
        } catch (Exception e) {
            System.err.println("Error starting order preparation: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Complete cooking for an order
     * @param orderId Order ID
     * @param staffId Staff ID completing the order
     * @return Success status
     */
    public boolean completeOrder(String orderId, String staffId) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            if (kitchenOrderOpt.isEmpty()) {
                return false;
            }
            
            KitchenOrder kitchenOrder = kitchenOrderOpt.get();
            kitchenOrder.completeCooking();
            kitchenOrderDAO.update(kitchenOrder);
            
            // Update main order status
            orderDAO.updateStatus(orderId, OrderStatus.READY);
            
            // Record staff activity and order completion
            staffService.updateStaffActivity(staffId);
            staffService.recordOrderProcessed(staffId);
            
            // Create notification for completion
            notificationService.createOrderStatusUpdateNotification(orderId, 
                OrderStatus.PREPARING, OrderStatus.READY, staffId);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error completing order: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update cooking timer/progress for an order
     * @param orderId Order ID
     * @param estimatedMinutesRemaining Estimated minutes remaining
     * @param notes Optional cooking notes
     * @return Success status
     */
    public boolean updateCookingTimer(String orderId, int estimatedMinutesRemaining, String notes) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            if (kitchenOrderOpt.isEmpty()) {
                return false;
            }
            
            KitchenOrder kitchenOrder = kitchenOrderOpt.get();
            
            // Update estimated completion time
            LocalDateTime newCompletionTime = LocalDateTime.now().plusMinutes(estimatedMinutesRemaining);
            kitchenOrder.setEstimatedCompletionTime(newCompletionTime);
            
            // Add notes if provided
            if (notes != null && !notes.trim().isEmpty()) {
                kitchenOrder.addCookingNote(notes);
            }
            
            kitchenOrderDAO.update(kitchenOrder);
            return true;
        } catch (Exception e) {
            System.err.println("Error updating cooking timer: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Pause cooking for an order
     * @param orderId Order ID
     * @param reason Reason for pausing
     * @return Success status
     */
    public boolean pauseCooking(String orderId, String reason) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            if (kitchenOrderOpt.isEmpty()) {
                return false;
            }
            
            KitchenOrder kitchenOrder = kitchenOrderOpt.get();
            kitchenOrder.pauseCooking();
            
            if (reason != null && !reason.trim().isEmpty()) {
                kitchenOrder.addCookingNote("暫停原因: " + reason);
            }
            
            kitchenOrderDAO.update(kitchenOrder);
            
            // Create notification for pause
            notificationService.broadcastToDepartment("廚房", NotificationType.ORDER_STATUS_CHANGE,
                "訂單暫停", String.format("訂單 #%s 已暫停製作", orderId.substring(orderId.length() - 6)),
                NotificationPriority.NORMAL);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error pausing cooking: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Resume cooking for an order
     * @param orderId Order ID
     * @return Success status
     */
    public boolean resumeCooking(String orderId) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            if (kitchenOrderOpt.isEmpty()) {
                return false;
            }
            
            KitchenOrder kitchenOrder = kitchenOrderOpt.get();
            kitchenOrder.resumeCooking();
            kitchenOrderDAO.update(kitchenOrder);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error resuming cooking: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Cancel kitchen order
     * @param orderId Order ID
     * @param reason Cancellation reason
     * @return Success status
     */
    public boolean cancelKitchenOrder(String orderId, String reason) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            if (kitchenOrderOpt.isEmpty()) {
                return false;
            }
            
            KitchenOrder kitchenOrder = kitchenOrderOpt.get();
            kitchenOrder.cancelCooking(reason);
            kitchenOrderDAO.update(kitchenOrder);
            
            // Update main order status
            orderDAO.updateStatus(orderId, OrderStatus.CANCELLED);
            
            // Create emergency notification for cancellation
            notificationService.createEmergencyNotification(orderId, "訂單已取消: " + reason);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error cancelling kitchen order: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update order priority
     * @param orderId Order ID
     * @param priority New priority (1-10)
     * @return Success status
     */
    public boolean updateOrderPriority(String orderId, int priority) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            if (kitchenOrderOpt.isEmpty()) {
                return false;
            }
            
            KitchenOrder kitchenOrder = kitchenOrderOpt.get();
            kitchenOrder.updatePriority(priority);
            kitchenOrderDAO.update(kitchenOrder);
            
            if (priority >= 8) { // High priority
                notificationService.broadcastToDepartment("廚房", NotificationType.EMERGENCY,
                    "高優先訂單", String.format("訂單 #%s 已設為高優先級", orderId.substring(orderId.length() - 6)),
                    NotificationPriority.HIGH);
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error updating order priority: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get kitchen orders assigned to a specific staff member
     * @param staffId Staff ID
     * @return List of assigned kitchen orders
     */
    public List<KitchenOrder> getOrdersByStaff(String staffId) {
        try {
            return kitchenOrderDAO.findByStaffId(staffId);
        } catch (Exception e) {
            System.err.println("Error getting orders by staff: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Get detailed kitchen order information including main order details
     * @param orderId Order ID
     * @return Kitchen order details
     */
    public Optional<KitchenOrderDetails> getKitchenOrderDetails(String orderId) {
        try {
            Optional<KitchenOrder> kitchenOrderOpt = kitchenOrderDAO.findByOrderId(orderId);
            Optional<Order> orderOpt = orderDAO.findById(orderId);
            
            if (kitchenOrderOpt.isPresent() && orderOpt.isPresent()) {
                return Optional.of(new KitchenOrderDetails(kitchenOrderOpt.get(), orderOpt.get()));
            }
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error getting kitchen order details: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    /**
     * Check for overdue orders and create notifications
     */
    public void checkForOverdueOrders() {
        try {
            List<KitchenOrder> overdueOrders = getOverdueOrders();
            
            for (KitchenOrder kitchenOrder : overdueOrders) {
                int overdueMinutes = kitchenOrder.getOverdueMinutes();
                
                // Create overtime notification
                notificationService.createOvertimeOrderNotification(
                    kitchenOrder.getOrderId(), overdueMinutes, kitchenOrder.getAssignedStaffId());
                
                // Update priority if significantly overdue
                if (overdueMinutes > 15) {
                    updateOrderPriority(kitchenOrder.getOrderId(), Math.min(10, 7 + overdueMinutes / 10));
                }
            }
        } catch (Exception e) {
            System.err.println("Error checking for overdue orders: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Utility methods
    private int calculateEstimatedCookingTime(Order order) {
        // Simple calculation based on number of items
        // In a real system, this would consider item complexity, current kitchen load, etc.
        int baseTime = 15; // Base cooking time in minutes
        int itemCount = order.getOrderItems().size();
        return baseTime + (itemCount * 5); // Additional 5 minutes per item
    }

    // Inner class for detailed kitchen order response
    public static class KitchenOrderDetails {
        private KitchenOrder kitchenOrder;
        private Order order;

        public KitchenOrderDetails(KitchenOrder kitchenOrder, Order order) {
            this.kitchenOrder = kitchenOrder;
            this.order = order;
        }

        public KitchenOrder getKitchenOrder() { return kitchenOrder; }
        public void setKitchenOrder(KitchenOrder kitchenOrder) { this.kitchenOrder = kitchenOrder; }
        
        public Order getOrder() { return order; }
        public void setOrder(Order order) { this.order = order; }
        
        public String getOrderId() { return order.getOrderId(); }
        public int getTableNumber() { return order.getTableNumber(); }
        public String getSpecialInstructions() { return order.getSpecialInstructions(); }
        public List<OrderItem> getOrderItems() { return order.getOrderItems(); }
        public KitchenStatus getKitchenStatus() { return kitchenOrder.getKitchenStatus(); }
        public String getAssignedStaffId() { return kitchenOrder.getAssignedStaffId(); }
        public int getPriority() { return kitchenOrder.getPriority(); }
        public boolean isOverdue() { return kitchenOrder.isOverdue(); }
        public int getOverdueMinutes() { return kitchenOrder.getOverdueMinutes(); }
        public int getRemainingMinutes() { return kitchenOrder.getRemainingMinutes(); }
        public String getCookingNotes() { return kitchenOrder.getCookingNotes(); }
    }
}