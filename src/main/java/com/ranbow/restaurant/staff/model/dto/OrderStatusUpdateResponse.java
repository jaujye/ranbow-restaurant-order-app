package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.OrderStatus;
import java.time.LocalDateTime;

/**
 * Order Status Update Response
 * Response DTO for order status change operations
 */
public class OrderStatusUpdateResponse {
    
    private Long orderId;
    private String orderNumber;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    private String updatedByStaffId;
    private String updatedByStaffName;
    private LocalDateTime updateTime;
    private String reason;
    private String notes;
    private boolean wasSuccessful;
    private String errorMessage;
    private LocalDateTime estimatedCompleteTime;
    private boolean priorityEscalated;
    private String nextRequiredAction;
    
    // Additional alias fields for compatibility
    private String oldStatus; // Alias for previousStatus
    private String updatedBy; // Alias for updatedByStaffId
    private LocalDateTime updatedAt; // Alias for updateTime
    private boolean success; // Alias for wasSuccessful
    
    // Constructors
    public OrderStatusUpdateResponse() {
        this.updateTime = LocalDateTime.now();
        this.wasSuccessful = false;
    }
    
    public OrderStatusUpdateResponse(Long orderId, OrderStatus previousStatus, 
                                   OrderStatus newStatus, String updatedByStaffId) {
        this();
        this.orderId = orderId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.updatedByStaffId = updatedByStaffId;
        this.wasSuccessful = true;
    }
    
    // Factory methods for common responses
    public static OrderStatusUpdateResponse success(Long orderId, String orderNumber, 
                                                  OrderStatus previousStatus, OrderStatus newStatus, 
                                                  String updatedByStaffId, String staffName) {
        OrderStatusUpdateResponse response = new OrderStatusUpdateResponse(orderId, previousStatus, newStatus, updatedByStaffId);
        response.setOrderNumber(orderNumber);
        response.setUpdatedByStaffName(staffName);
        return response;
    }
    
    public static OrderStatusUpdateResponse failure(Long orderId, String orderNumber, 
                                                  String errorMessage) {
        OrderStatusUpdateResponse response = new OrderStatusUpdateResponse();
        response.setOrderId(orderId);
        response.setOrderNumber(orderNumber);
        response.setErrorMessage(errorMessage);
        response.setWasSuccessful(false);
        return response;
    }
    
    // Business logic methods
    public boolean isStatusProgression() {
        if (previousStatus == null || newStatus == null) return false;
        
        // Define status progression order
        OrderStatus[] progression = {
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED
        };
        
        int previousIndex = getStatusIndex(previousStatus, progression);
        int newIndex = getStatusIndex(newStatus, progression);
        
        return previousIndex >= 0 && newIndex >= 0 && newIndex > previousIndex;
    }
    
    private int getStatusIndex(OrderStatus status, OrderStatus[] progression) {
        for (int i = 0; i < progression.length; i++) {
            if (progression[i] == status) {
                return i;
            }
        }
        return -1;
    }
    
    public String getStatusChangeDescription() {
        if (previousStatus == null) {
            return "Order created with status: " + (newStatus != null ? newStatus.getDisplayName() : "Unknown");
        }
        return "Changed from " + previousStatus.getDisplayName() + " to " + 
               (newStatus != null ? newStatus.getDisplayName() : "Unknown");
    }
    
    public boolean requiresNotification() {
        return newStatus == OrderStatus.READY || 
               newStatus == OrderStatus.DELIVERED || 
               newStatus == OrderStatus.CANCELLED ||
               priorityEscalated;
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
    
    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }
    
    public void setPreviousStatus(OrderStatus previousStatus) {
        this.previousStatus = previousStatus;
    }
    
    public OrderStatus getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }
    
    public String getUpdatedByStaffId() {
        return updatedByStaffId;
    }
    
    public void setUpdatedByStaffId(String updatedByStaffId) {
        this.updatedByStaffId = updatedByStaffId;
    }
    
    public String getUpdatedByStaffName() {
        return updatedByStaffName;
    }
    
    public void setUpdatedByStaffName(String updatedByStaffName) {
        this.updatedByStaffName = updatedByStaffName;
    }
    
    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
    
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public boolean isWasSuccessful() {
        return wasSuccessful;
    }
    
    public void setWasSuccessful(boolean wasSuccessful) {
        this.wasSuccessful = wasSuccessful;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public LocalDateTime getEstimatedCompleteTime() {
        return estimatedCompleteTime;
    }
    
    public void setEstimatedCompleteTime(LocalDateTime estimatedCompleteTime) {
        this.estimatedCompleteTime = estimatedCompleteTime;
    }
    
    public boolean isPriorityEscalated() {
        return priorityEscalated;
    }
    
    public void setPriorityEscalated(boolean priorityEscalated) {
        this.priorityEscalated = priorityEscalated;
    }
    
    public String getNextRequiredAction() {
        return nextRequiredAction;
    }
    
    public void setNextRequiredAction(String nextRequiredAction) {
        this.nextRequiredAction = nextRequiredAction;
    }
    
    // Alias methods for compatibility
    public String getOldStatus() {
        return oldStatus != null ? oldStatus : (previousStatus != null ? previousStatus.toString() : null);
    }
    
    public void setOldStatus(String oldStatus) {
        this.oldStatus = oldStatus;
    }
    
    public String getUpdatedBy() {
        return updatedBy != null ? updatedBy : updatedByStaffId;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
        // Keep consistency with updatedByStaffId
        if (this.updatedByStaffId == null) {
            this.updatedByStaffId = updatedBy;
        }
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt != null ? updatedAt : updateTime;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        // Keep consistency with updateTime
        if (this.updateTime == null) {
            this.updateTime = updatedAt;
        }
    }
    
    public boolean isSuccess() {
        return success ? success : wasSuccessful;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
        this.wasSuccessful = success;
    }
    
    @Override
    public String toString() {
        return "OrderStatusUpdateResponse{" +
                "orderId=" + orderId +
                ", orderNumber='" + orderNumber + '\'' +
                ", previousStatus=" + previousStatus +
                ", newStatus=" + newStatus +
                ", wasSuccessful=" + wasSuccessful +
                ", updateTime=" + updateTime +
                '}';
    }
}