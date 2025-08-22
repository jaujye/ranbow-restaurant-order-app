package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.staff.model.entity.OrderPriority;
import com.ranbow.restaurant.staff.model.entity.StaffMember;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Complete Order Information for Staff Operations
 * Contains all necessary details for order management, assignment, and processing
 */
public class StaffOrderDetails {
    
    private Long orderId;
    private String orderNumber;
    private String tableNumber;
    private String customerName;
    private String customerPhone;
    private OrderStatus status;
    private OrderPriority priority;
    private List<OrderItemDetails> items;
    private BigDecimal totalAmount;
    private LocalDateTime orderTime;
    private LocalDateTime estimatedCompleteTime;
    private StaffMember assignedStaff;
    private boolean isOverdue;
    private long overdueMinutes;
    private List<OrderStatusHistory> statusHistory;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int preparationTimeMinutes;
    private String kitchenNotes;
    private boolean requiresAttention;
    private String attentionReason;
    
    // Constructors
    public StaffOrderDetails() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isOverdue = false;
        this.overdueMinutes = 0;
        this.requiresAttention = false;
    }
    
    public StaffOrderDetails(Long orderId, String orderNumber, String tableNumber, 
                           OrderStatus status, OrderPriority priority) {
        this();
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.tableNumber = tableNumber;
        this.status = status;
        this.priority = priority;
    }
    
    // Business logic methods
    public boolean canBeAssigned() {
        return status == OrderStatus.PENDING && assignedStaff == null;
    }
    
    public boolean isInProgress() {
        return status == OrderStatus.PREPARING || status == OrderStatus.CONFIRMED;
    }
    
    public boolean isUrgent() {
        return priority == OrderPriority.URGENT || priority == OrderPriority.EMERGENCY;
    }
    
    public void markAsOverdue() {
        this.isOverdue = true;
        if (estimatedCompleteTime != null) {
            this.overdueMinutes = java.time.Duration.between(estimatedCompleteTime, LocalDateTime.now()).toMinutes();
        }
    }
    
    public void escalatePriority() {
        if (this.priority != null && this.priority != OrderPriority.EMERGENCY) {
            this.priority = OrderPriority.values()[this.priority.ordinal() + 1];
            this.requiresAttention = true;
            this.attentionReason = "Priority escalated due to delay";
        }
    }
    
    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public String getTableNumber() {
        return tableNumber;
    }
    
    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public OrderPriority getPriority() {
        return priority;
    }
    
    public void setPriority(OrderPriority priority) {
        this.priority = priority;
        this.updatedAt = LocalDateTime.now();
    }
    
    public List<OrderItemDetails> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemDetails> items) {
        this.items = items;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public LocalDateTime getOrderTime() {
        return orderTime;
    }
    
    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }
    
    public LocalDateTime getEstimatedCompleteTime() {
        return estimatedCompleteTime;
    }
    
    public void setEstimatedCompleteTime(LocalDateTime estimatedCompleteTime) {
        this.estimatedCompleteTime = estimatedCompleteTime;
    }
    
    public StaffMember getAssignedStaff() {
        return assignedStaff;
    }
    
    public void setAssignedStaff(StaffMember assignedStaff) {
        this.assignedStaff = assignedStaff;
    }
    
    public boolean isOverdue() {
        return isOverdue;
    }
    
    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }
    
    public long getOverdueMinutes() {
        return overdueMinutes;
    }
    
    public void setOverdueMinutes(long overdueMinutes) {
        this.overdueMinutes = overdueMinutes;
    }
    
    public List<OrderStatusHistory> getStatusHistory() {
        return statusHistory;
    }
    
    public void setStatusHistory(List<OrderStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public int getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }
    
    public void setPreparationTimeMinutes(int preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }
    
    public String getKitchenNotes() {
        return kitchenNotes;
    }
    
    public void setKitchenNotes(String kitchenNotes) {
        this.kitchenNotes = kitchenNotes;
    }
    
    public boolean isRequiresAttention() {
        return requiresAttention;
    }
    
    public void setRequiresAttention(boolean requiresAttention) {
        this.requiresAttention = requiresAttention;
    }
    
    public String getAttentionReason() {
        return attentionReason;
    }
    
    public void setAttentionReason(String attentionReason) {
        this.attentionReason = attentionReason;
    }
    
    @Override
    public String toString() {
        return "StaffOrderDetails{" +
                "orderId=" + orderId +
                ", orderNumber='" + orderNumber + '\'' +
                ", tableNumber='" + tableNumber + '\'' +
                ", status=" + status +
                ", priority=" + priority +
                ", totalAmount=" + totalAmount +
                ", isOverdue=" + isOverdue +
                ", overdueMinutes=" + overdueMinutes +
                '}';
    }
}