package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderItem;
import com.ranbow.restaurant.staff.model.entity.OrderPriority;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed order information for kitchen operations
 */
public class KitchenOrderDetails {
    private String orderId;
    private String customerName;
    private List<OrderItem> items;
    private OrderPriority priority;
    private LocalDateTime orderTime;
    private LocalDateTime expectedCompletionTime;
    private String specialInstructions;
    private String tableNumber;
    private String assignedChef;
    private String currentStatus;
    private double totalAmount;
    private int estimatedCookingMinutes;
    private boolean isUrgent;

    // Default constructor
    public KitchenOrderDetails() {}

    // Constructor from Order
    public KitchenOrderDetails(Order order) {
        this.orderId = order.getOrderId();
        this.customerName = order.getCustomerId() != null ? order.getCustomerId() : "Unknown";
        this.items = order.getItems();
        this.priority = OrderPriority.determinePriority(order.getOrderTime(), null, order.getItems().size());
        this.orderTime = order.getOrderTime();
        this.specialInstructions = order.getSpecialInstructions();
        this.tableNumber = order.getTableNumber();
        this.currentStatus = order.getStatus().toString();
        this.totalAmount = order.getTotalAmount().doubleValue();
        this.estimatedCookingMinutes = calculateEstimatedCookingTime(order.getItems());
        this.isUrgent = this.priority == OrderPriority.URGENT || this.priority == OrderPriority.EMERGENCY;
        
        // Calculate expected completion time
        if (this.orderTime != null) {
            this.expectedCompletionTime = this.orderTime.plusMinutes(this.estimatedCookingMinutes);
        }
    }

    // Helper method to calculate estimated cooking time
    private int calculateEstimatedCookingTime(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return 15; // Default 15 minutes
        }
        
        // Basic estimation based on item count and complexity
        int totalMinutes = 0;
        for (OrderItem item : items) {
            // Estimate based on item category
            String itemName = item.getMenuItem().getName().toLowerCase();
            if (itemName.contains("飲") || itemName.contains("drink")) {
                totalMinutes += 3; // 3 minutes for drinks
            } else if (itemName.contains("湯") || itemName.contains("soup")) {
                totalMinutes += 10; // 10 minutes for soups
            } else if (itemName.contains("炸") || itemName.contains("fried")) {
                totalMinutes += 15; // 15 minutes for fried items
            } else {
                totalMinutes += 8; // 8 minutes for regular items
            }
        }
        
        // Cap at reasonable limits
        return Math.min(Math.max(totalMinutes, 5), 60);
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

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
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

    public LocalDateTime getExpectedCompletionTime() {
        return expectedCompletionTime;
    }

    public void setExpectedCompletionTime(LocalDateTime expectedCompletionTime) {
        this.expectedCompletionTime = expectedCompletionTime;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getAssignedChef() {
        return assignedChef;
    }

    public void setAssignedChef(String assignedChef) {
        this.assignedChef = assignedChef;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getEstimatedCookingMinutes() {
        return estimatedCookingMinutes;
    }

    public void setEstimatedCookingMinutes(int estimatedCookingMinutes) {
        this.estimatedCookingMinutes = estimatedCookingMinutes;
    }

    public boolean isUrgent() {
        return isUrgent;
    }

    public void setUrgent(boolean urgent) {
        isUrgent = urgent;
    }
}