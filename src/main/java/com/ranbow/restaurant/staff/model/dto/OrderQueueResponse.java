package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.entity.OrderPriority;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Order Queue Response DTO
 * Data Transfer Object for order queue information
 */
public class OrderQueueResponse {
    
    private List<QueueItem> orders;
    private QueueStatistics statistics;
    private LocalDateTime lastUpdated;
    
    // Constructors
    public OrderQueueResponse() {}
    
    public OrderQueueResponse(List<QueueItem> orders, QueueStatistics statistics) {
        this.orders = orders;
        this.statistics = statistics;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Nested QueueItem Class
    public static class QueueItem {
        private String orderId;
        private String customerName;
        private String status;
        private OrderPriority priority;
        private LocalDateTime orderTime;
        private LocalDateTime estimatedCompletionTime;
        private Integer totalItems;
        private Double totalAmount;
        private String assignedStaffId;
        private String assignedStaffName;
        private String notes;
        private List<OrderItemInfo> items;
        private boolean isUrgent;
        private int waitingMinutes;
        private String tableNumber;
        
        // Constructors
        public QueueItem() {}
        
        public QueueItem(String orderId, String customerName, String status) {
            this.orderId = orderId;
            this.customerName = customerName;
            this.status = status;
        }
        
        // Getters and Setters
        public String getOrderId() {
            return orderId;
        }
        
        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }
        
        public String getCustomerName() {
            return customerName;
        }
        
        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public OrderPriority getPriority() {
            return priority;
        }
        
        public void setPriority(OrderPriority priority) {
            this.priority = priority;
        }
        
        public LocalDateTime getOrderTime() {
            return orderTime;
        }
        
        public void setOrderTime(LocalDateTime orderTime) {
            this.orderTime = orderTime;
        }
        
        public LocalDateTime getEstimatedCompletionTime() {
            return estimatedCompletionTime;
        }
        
        public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
            this.estimatedCompletionTime = estimatedCompletionTime;
        }
        
        public Integer getTotalItems() {
            return totalItems;
        }
        
        public void setTotalItems(Integer totalItems) {
            this.totalItems = totalItems;
        }
        
        public Double getTotalAmount() {
            return totalAmount;
        }
        
        public void setTotalAmount(Double totalAmount) {
            this.totalAmount = totalAmount;
        }
        
        public String getAssignedStaffId() {
            return assignedStaffId;
        }
        
        public void setAssignedStaffId(String assignedStaffId) {
            this.assignedStaffId = assignedStaffId;
        }
        
        public String getAssignedStaffName() {
            return assignedStaffName;
        }
        
        public void setAssignedStaffName(String assignedStaffName) {
            this.assignedStaffName = assignedStaffName;
        }
        
        public String getNotes() {
            return notes;
        }
        
        public void setNotes(String notes) {
            this.notes = notes;
        }
        
        public List<OrderItemInfo> getItems() {
            return items;
        }
        
        public void setItems(List<OrderItemInfo> items) {
            this.items = items;
        }
        
        public boolean isUrgent() {
            return isUrgent;
        }
        
        public void setUrgent(boolean urgent) {
            isUrgent = urgent;
        }
        
        public int getWaitingMinutes() {
            return waitingMinutes;
        }
        
        public void setWaitingMinutes(int waitingMinutes) {
            this.waitingMinutes = waitingMinutes;
        }
        
        public String getTableNumber() {
            return tableNumber;
        }
        
        public void setTableNumber(String tableNumber) {
            this.tableNumber = tableNumber;
        }
    }
    
    // Nested OrderItemInfo Class
    public static class OrderItemInfo {
        private String menuItemId;
        private String itemName;
        private Integer quantity;
        private String specialInstructions;
        private String status;
        private Integer estimatedMinutes;
        
        // Constructors
        public OrderItemInfo() {}
        
        public OrderItemInfo(String menuItemId, String itemName, Integer quantity) {
            this.menuItemId = menuItemId;
            this.itemName = itemName;
            this.quantity = quantity;
        }
        
        // Getters and Setters
        public String getMenuItemId() {
            return menuItemId;
        }
        
        public void setMenuItemId(String menuItemId) {
            this.menuItemId = menuItemId;
        }
        
        public String getItemName() {
            return itemName;
        }
        
        public void setItemName(String itemName) {
            this.itemName = itemName;
        }
        
        public Integer getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
        
        public String getSpecialInstructions() {
            return specialInstructions;
        }
        
        public void setSpecialInstructions(String specialInstructions) {
            this.specialInstructions = specialInstructions;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public Integer getEstimatedMinutes() {
            return estimatedMinutes;
        }
        
        public void setEstimatedMinutes(Integer estimatedMinutes) {
            this.estimatedMinutes = estimatedMinutes;
        }
    }
    
    // Nested QueueStatistics Class
    public static class QueueStatistics {
        private int totalOrders;
        private int pendingOrders;
        private int inProgressOrders;
        private int completedToday;
        private int urgentOrders;
        private double averageWaitTime;
        private double averageCompletionTime;
        private int staffOnDuty;
        
        // Constructors
        public QueueStatistics() {}
        
        public QueueStatistics(int totalOrders, int pendingOrders, int inProgressOrders, int completedToday) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.inProgressOrders = inProgressOrders;
            this.completedToday = completedToday;
        }
        
        // Getters and Setters
        public int getTotalOrders() {
            return totalOrders;
        }
        
        public void setTotalOrders(int totalOrders) {
            this.totalOrders = totalOrders;
        }
        
        public int getPendingOrders() {
            return pendingOrders;
        }
        
        public void setPendingOrders(int pendingOrders) {
            this.pendingOrders = pendingOrders;
        }
        
        public int getInProgressOrders() {
            return inProgressOrders;
        }
        
        public void setInProgressOrders(int inProgressOrders) {
            this.inProgressOrders = inProgressOrders;
        }
        
        public int getCompletedToday() {
            return completedToday;
        }
        
        public void setCompletedToday(int completedToday) {
            this.completedToday = completedToday;
        }
        
        public int getUrgentOrders() {
            return urgentOrders;
        }
        
        public void setUrgentOrders(int urgentOrders) {
            this.urgentOrders = urgentOrders;
        }
        
        public double getAverageWaitTime() {
            return averageWaitTime;
        }
        
        public void setAverageWaitTime(double averageWaitTime) {
            this.averageWaitTime = averageWaitTime;
        }
        
        public double getAverageCompletionTime() {
            return averageCompletionTime;
        }
        
        public void setAverageCompletionTime(double averageCompletionTime) {
            this.averageCompletionTime = averageCompletionTime;
        }
        
        public int getStaffOnDuty() {
            return staffOnDuty;
        }
        
        public void setStaffOnDuty(int staffOnDuty) {
            this.staffOnDuty = staffOnDuty;
        }
    }
    
    // Main class getters and setters
    public List<QueueItem> getOrders() {
        return orders;
    }
    
    public void setOrders(List<QueueItem> orders) {
        this.orders = orders;
    }
    
    public QueueStatistics getStatistics() {
        return statistics;
    }
    
    public void setStatistics(QueueStatistics statistics) {
        this.statistics = statistics;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    @Override
    public String toString() {
        return "OrderQueueResponse{" +
                "totalOrders=" + (orders != null ? orders.size() : 0) +
                ", lastUpdated=" + lastUpdated +
                ", statistics=" + statistics +
                '}';
    }
}