package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.api.OrderController;
import com.ranbow.restaurant.events.OrderStatusChangeEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
public class OrderService {
    
    @Autowired
    private OrderDAO orderDAO;
    
    @Autowired
    private MenuService menuService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public Order createOrder(String customerId, String tableNumber) {
        Order newOrder = new Order(customerId, tableNumber);
        return orderDAO.save(newOrder);
    }
    
    public Order createCompleteOrder(OrderController.CreateCompleteOrderRequest request) {
        // Create the order
        Order order = new Order(request.getCustomerId(), request.getTableNumber());
        
        // Set special instructions
        if (request.getSpecialInstructions() != null && !request.getSpecialInstructions().trim().isEmpty()) {
            order.setSpecialInstructions(request.getSpecialInstructions());
        }
        
        // Set initial status based on request
        if (request.getStatus() != null) {
            try {
                OrderStatus status = OrderStatus.valueOf(request.getStatus());
                order.setStatus(status);
            } catch (IllegalArgumentException e) {
                // Default to PENDING if invalid status provided
                order.setStatus(OrderStatus.PENDING);
            }
        }
        
        // Save the order first to get an ID
        order = orderDAO.save(order);
        
        // Add items to the order
        if (request.getItems() != null) {
            for (OrderController.OrderItemRequest itemRequest : request.getItems()) {
                Optional<MenuItem> menuItemOpt = menuService.findMenuItemById(itemRequest.getMenuItemId());
                if (menuItemOpt.isPresent()) {
                    MenuItem menuItem = menuItemOpt.get();
                    OrderItem orderItem = new OrderItem(menuItem, itemRequest.getQuantity(), itemRequest.getSpecialRequests());
                    order.addOrderItem(orderItem);
                } else {
                    throw new IllegalArgumentException("菜單項目不存在: " + itemRequest.getMenuItemId());
                }
            }
        }
        
        // Set custom totals if provided (for cases where frontend calculates with service fees)
        if (request.getTotalAmount() > 0) {
            order.setSubtotal(BigDecimal.valueOf(request.getSubtotal()));
            order.setTax(BigDecimal.valueOf(request.getTax()));
            order.setTotalAmount(BigDecimal.valueOf(request.getTotalAmount()));
        }
        
        // Update the order with items and totals
        orderDAO.update(order);
        return order;
    }
    
    public Optional<Order> findOrderById(String orderId) {
        return orderDAO.findById(orderId);
    }
    
    public List<Order> getAllOrders() {
        return orderDAO.findAll();
    }
    
    public List<Order> getOrdersByCustomerId(String customerId) {
        try {
            if (customerId == null || customerId.trim().isEmpty()) {
                System.err.println("Invalid customer ID provided: " + customerId);
                return new java.util.ArrayList<>();
            }
            return orderDAO.findByCustomerId(customerId);
        } catch (Exception e) {
            System.err.println("Error in OrderService.getOrdersByCustomerId for customer " + customerId + ": " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderDAO.findByStatus(status);
    }
    
    public List<Order> getPendingOrders() {
        return getOrdersByStatus(OrderStatus.PENDING);
    }
    
    public List<Order> getActiveOrders() {
        return orderDAO.findActiveOrders();
    }
    
    public boolean addItemToOrder(String orderId, String menuItemId, int quantity, String specialRequests) {
        Optional<Order> orderOpt = findOrderById(orderId);
        Optional<MenuItem> menuItemOpt = menuService.findMenuItemById(menuItemId);
        
        if (orderOpt.isPresent() && menuItemOpt.isPresent()) {
            Order order = orderOpt.get();
            MenuItem menuItem = menuItemOpt.get();
            
            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException("菜單項目目前不可用: " + menuItem.getName());
            }
            
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new IllegalStateException("只能在訂單待確認狀態下添加項目");
            }
            
            OrderItem orderItem = new OrderItem(menuItem, quantity, specialRequests);
            order.addOrderItem(orderItem);
            orderDAO.update(order);
            return true;
        }
        return false;
    }
    
    public boolean removeItemFromOrder(String orderId, String orderItemId) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new IllegalStateException("只能在訂單待確認狀態下移除項目");
            }
            
            boolean removed = order.getOrderItems().removeIf(item -> item.getOrderItemId().equals(orderItemId));
            if (removed) {
                orderDAO.update(order);
            }
            return removed;
        }
        return false;
    }
    
    public boolean updateOrderItemQuantity(String orderId, String orderItemId, int newQuantity) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new IllegalStateException("只能在訂單待確認狀態下修改數量");
            }
            
            Optional<OrderItem> orderItem = order.getOrderItems().stream()
                    .filter(item -> item.getOrderItemId().equals(orderItemId))
                    .findFirst();
            
            if (orderItem.isPresent()) {
                orderItem.get().setQuantity(newQuantity);
                orderDAO.update(order);
                return true;
            }
        }
        return false;
    }
    
    public boolean confirmOrder(String orderId) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getOrderItems().isEmpty()) {
                throw new IllegalStateException("無法確認空訂單");
            }
            
            if (order.getStatus() == OrderStatus.PENDING) {
                // Use updateOrderStatus to ensure kitchen order is created
                return updateOrderStatus(orderId, OrderStatus.CONFIRMED);
            }
        }
        return false;
    }
    
    public boolean updateOrderStatus(String orderId, OrderStatus newStatus) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            OrderStatus oldStatus = order.getStatus();
            
            // Validate status transition
            if (isValidStatusTransition(oldStatus, newStatus)) {
                // Use updateStatus method to properly update the status in database
                boolean updated = orderDAO.updateStatus(orderId, newStatus);
                if (updated) {
                    order.setStatus(newStatus); // Update local object status
                    
                    // Publish order status change event for other services to handle
                    try {
                        OrderStatusChangeEvent event = new OrderStatusChangeEvent(
                            this, orderId, oldStatus, newStatus, order);
                        eventPublisher.publishEvent(event);
                    } catch (Exception e) {
                        System.err.println("Failed to publish order status change event for " + orderId + ": " + e.getMessage());
                        e.printStackTrace();
                        // Don't fail the status update if event publishing fails
                    }
                    
                    return true;
                } else {
                    throw new RuntimeException("Failed to update order status in database");
                }
            } else {
                throw new IllegalStateException("無效的狀態轉換: " + 
                        oldStatus + " -> " + newStatus);
            }
        }
        return false;
    }
    
    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.PENDING_PAYMENT || newStatus == OrderStatus.CANCELLED;
            case PENDING_PAYMENT -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED;
            case PREPARING -> newStatus == OrderStatus.READY || newStatus == OrderStatus.CANCELLED;
            case READY -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED -> newStatus == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false; // Final states
        };
    }
    
    public boolean cancelOrder(String orderId, String reason) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() == OrderStatus.COMPLETED) {
                throw new IllegalStateException("無法取消已完成的訂單");
            }
            
            // Update order status first
            boolean statusUpdated = orderDAO.updateStatus(orderId, OrderStatus.CANCELLED);
            if (!statusUpdated) {
                throw new RuntimeException("Failed to update order status to CANCELLED");
            }
            
            // Update special instructions
            order.setStatus(OrderStatus.CANCELLED);
            order.setSpecialInstructions((order.getSpecialInstructions() != null ? 
                    order.getSpecialInstructions() + " | " : "") + "取消原因: " + reason);
            orderDAO.update(order); // This will update other fields like special_instructions
            return true;
        }
        return false;
    }
    
    public List<Order> getTodaysOrders() {
        return orderDAO.findTodaysOrders();
    }
    
    public int getTotalOrdersCount() {
        return getAllOrders().size();
    }
    
    public int getTodaysOrdersCount() {
        return getTodaysOrders().size();
    }
    
    public int getCompletedOrdersCount() {
        return getOrdersByStatus(OrderStatus.COMPLETED).size();
    }
    
    // ================================
    // STAFF-SPECIFIC ORDER METHODS
    // ================================
    
    /**
     * Get orders by multiple statuses (for staff dashboard)
     * @param statuses List of order statuses to include
     * @return List of orders matching any of the statuses
     */
    public List<Order> getOrdersByStatuses(List<OrderStatus> statuses) {
        try {
            return orderDAO.findByStatuses(statuses);
        } catch (Exception e) {
            System.err.println("Error getting orders by statuses: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Get orders assigned to a specific staff member
     * @param staffId Staff ID
     * @return List of orders assigned to staff
     */
    public List<Order> getOrdersByAssignedStaff(String staffId) {
        try {
            return orderDAO.findByAssignedStaff(staffId);
        } catch (Exception e) {
            System.err.println("Error getting orders by assigned staff: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Assign order to a staff member
     * @param orderId Order ID
     * @param staffId Staff ID
     * @return Success status
     */
    public boolean assignOrderToStaff(String orderId, String staffId) {
        try {
            Optional<Order> orderOpt = findOrderById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CONFIRMED) {
                    // This would require adding assigned_staff_id field to orders table
                    // For now, we'll use the special instructions field to track assignment
                    String currentInstructions = order.getSpecialInstructions() != null ? 
                        order.getSpecialInstructions() : "";
                    order.setSpecialInstructions(currentInstructions + " | 負責員工: " + staffId);
                    orderDAO.update(order);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error assigning order to staff: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Get overdue orders (orders that should have been completed by now)
     * @param minutesThreshold Orders older than this many minutes are considered overdue
     * @return List of overdue orders
     */
    public List<Order> getOverdueOrders(int minutesThreshold) {
        try {
            return orderDAO.findOverdueOrders(minutesThreshold);
        } catch (Exception e) {
            System.err.println("Error getting overdue orders: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Get emergency orders (high priority or significantly overdue)
     * @return List of emergency orders
     */
    public List<Order> getEmergencyOrders() {
        try {
            // Consider orders overdue by more than 20 minutes as emergency
            List<Order> overdueOrders = getOverdueOrders(20);
            
            // Add any orders with special priority flags
            List<Order> allActiveOrders = getActiveOrders();
            List<Order> emergencyOrders = new java.util.ArrayList<>(overdueOrders);
            
            // Check for special instructions indicating priority
            for (Order order : allActiveOrders) {
                if (order.getSpecialInstructions() != null && 
                    (order.getSpecialInstructions().contains("緊急") || 
                     order.getSpecialInstructions().contains("急件") ||
                     order.getSpecialInstructions().contains("優先"))) {
                    if (!emergencyOrders.contains(order)) {
                        emergencyOrders.add(order);
                    }
                }
            }
            
            return emergencyOrders;
        } catch (Exception e) {
            System.err.println("Error getting emergency orders: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    /**
     * Get today's order statistics for staff dashboard
     * @return Order statistics summary
     */
    public OrderStatisticsSummary getTodaysOrderStatistics() {
        try {
            List<Order> todaysOrders = getTodaysOrders();
            
            OrderStatisticsSummary summary = new OrderStatisticsSummary();
            summary.setTotalOrders(todaysOrders.size());
            
            int pending = 0, preparing = 0, ready = 0, completed = 0, cancelled = 0;
            double totalRevenue = 0.0;
            
            for (Order order : todaysOrders) {
                switch (order.getStatus()) {
                    case PENDING, PENDING_PAYMENT, CONFIRMED -> pending++;
                    case PREPARING -> preparing++;
                    case READY, DELIVERED -> ready++;
                    case COMPLETED -> {
                        completed++;
                        if (order.getTotalAmount() != null) {
                            totalRevenue += order.getTotalAmount().doubleValue();
                        }
                    }
                    case CANCELLED -> cancelled++;
                }
            }
            
            summary.setPendingOrders(pending);
            summary.setPreparingOrders(preparing);
            summary.setReadyOrders(ready);
            summary.setCompletedOrders(completed);
            summary.setCancelledOrders(cancelled);
            summary.setTotalRevenue(totalRevenue);
            summary.setCompletionRate(todaysOrders.size() > 0 ? 
                (double) completed / todaysOrders.size() : 0.0);
            
            return summary;
        } catch (Exception e) {
            System.err.println("Error getting today's order statistics: " + e.getMessage());
            e.printStackTrace();
            return new OrderStatisticsSummary(); // Return empty summary on error
        }
    }
    
    // Inner class for order statistics summary
    public static class OrderStatisticsSummary {
        private int totalOrders;
        private int pendingOrders;
        private int preparingOrders;
        private int readyOrders;
        private int completedOrders;
        private int cancelledOrders;
        private double totalRevenue;
        private double completionRate;
        
        // Getters and Setters
        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
        
        public int getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(int pendingOrders) { this.pendingOrders = pendingOrders; }
        
        public int getPreparingOrders() { return preparingOrders; }
        public void setPreparingOrders(int preparingOrders) { this.preparingOrders = preparingOrders; }
        
        public int getReadyOrders() { return readyOrders; }
        public void setReadyOrders(int readyOrders) { this.readyOrders = readyOrders; }
        
        public int getCompletedOrders() { return completedOrders; }
        public void setCompletedOrders(int completedOrders) { this.completedOrders = completedOrders; }
        
        public int getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(int cancelledOrders) { this.cancelledOrders = cancelledOrders; }
        
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        
        public double getCompletionRate() { return completionRate; }
        public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
    }

    /**
     * Get orders by status with complete customer and menu item information
     * This method returns orders with fully populated customer details and menu items
     */
    public List<Map<String, Object>> getOrdersWithCompleteDataByStatus(OrderStatus status) {
        List<Order> orders = orderDAO.findByStatus(status);
        List<Map<String, Object>> completeOrders = new ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> orderData = new HashMap<>();
            
            // Basic order information
            orderData.put("orderId", order.getOrderId());
            orderData.put("order_id", order.getOrderId());
            orderData.put("customerId", order.getCustomerId());
            orderData.put("customer_id", order.getCustomerId());
            orderData.put("status", order.getStatus().toString());
            orderData.put("totalAmount", order.getTotalAmount());
            orderData.put("total_amount", order.getTotalAmount());
            orderData.put("subtotal", order.getSubtotal());
            orderData.put("tax", order.getTax());
            orderData.put("specialInstructions", order.getSpecialInstructions());
            orderData.put("special_instructions", order.getSpecialInstructions());
            orderData.put("tableNumber", order.getTableNumber());
            orderData.put("table_number", order.getTableNumber());
            orderData.put("orderTime", order.getOrderTime());
            orderData.put("order_time", order.getOrderTime());
            orderData.put("completedTime", order.getCompletedTime());
            orderData.put("completed_time", order.getCompletedTime());
            
            // Generate friendly order number (first 8 characters + sequential number)
            String friendlyOrderNumber = "RB" + String.format("%06d", Math.abs(order.getOrderId().hashCode() % 999999));
            orderData.put("orderNumber", friendlyOrderNumber);
            orderData.put("order_number", friendlyOrderNumber);
            
            // Get customer information
            try {
                Optional<User> customerOpt = userService.findUserById(order.getCustomerId());
                if (customerOpt.isPresent()) {
                    User customer = customerOpt.get();
                    orderData.put("customerName", customer.getUsername());
                    orderData.put("customer_name", customer.getUsername());
                    orderData.put("customerEmail", customer.getEmail());
                    orderData.put("customer_email", customer.getEmail());
                    orderData.put("customerPhone", customer.getPhoneNumber());
                    orderData.put("customer_phone", customer.getPhoneNumber());
                } else {
                    orderData.put("customerName", "Unknown Customer");
                    orderData.put("customer_name", "Unknown Customer");
                    orderData.put("customerEmail", "");
                    orderData.put("customer_email", "");
                    orderData.put("customerPhone", "");
                    orderData.put("customer_phone", "");
                }
            } catch (Exception e) {
                System.err.println("Error getting customer info for order " + order.getOrderId() + ": " + e.getMessage());
                orderData.put("customerName", "Unknown Customer");
                orderData.put("customer_name", "Unknown Customer");
                orderData.put("customerEmail", "");
                orderData.put("customer_email", "");
                orderData.put("customerPhone", "");
                orderData.put("customer_phone", "");
            }
            
            // Get order items with complete menu information
            List<Map<String, Object>> orderItems = new ArrayList<>();
            for (OrderItem item : order.getOrderItems()) {
                Map<String, Object> itemData = new HashMap<>();
                
                itemData.put("orderItemId", item.getOrderItemId());
                itemData.put("quantity", item.getQuantity());
                itemData.put("specialRequests", item.getSpecialRequests());
                itemData.put("itemTotal", item.getItemTotal());
                itemData.put("item_total", item.getItemTotal());
                
                // Get menu item details
                try {
                    if (item.getMenuItem() != null) {
                        MenuItem menuItem = item.getMenuItem();
                        itemData.put("name", menuItem.getName());
                        itemData.put("description", menuItem.getDescription());
                        itemData.put("price", menuItem.getPrice());
                        itemData.put("category", menuItem.getCategory());
                    } else {
                        itemData.put("name", "Unknown Item");
                        itemData.put("description", "");
                        itemData.put("price", BigDecimal.ZERO);
                        itemData.put("category", "");
                    }
                } catch (Exception e) {
                    System.err.println("Error getting menu item info: " + e.getMessage());
                    itemData.put("name", "Unknown Item");
                    itemData.put("description", "");
                    itemData.put("price", BigDecimal.ZERO);
                    itemData.put("category", "");
                }
                
                orderItems.add(itemData);
            }
            
            orderData.put("items", orderItems);
            orderData.put("orderItems", orderItems);
            
            completeOrders.add(orderData);
        }
        
        return completeOrders;
    }
}