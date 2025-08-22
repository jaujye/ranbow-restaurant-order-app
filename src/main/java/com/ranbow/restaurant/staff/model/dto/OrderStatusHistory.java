package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.OrderStatus;
import java.time.LocalDateTime;

/**
 * Order Status History for Audit Trail
 * Tracks all status changes for order monitoring and analysis
 */
public class OrderStatusHistory {
    
    private Long historyId;
    private Long orderId;
    private OrderStatus fromStatus;
    private OrderStatus toStatus;
    private String changedByStaffId;
    private String staffName;
    private String reason;
    private String notes;
    private LocalDateTime timestamp;
    private long durationInPreviousStatus; // Minutes spent in previous status
    
    // Constructors
    public OrderStatusHistory() {
        this.timestamp = LocalDateTime.now();
    }
    
    public OrderStatusHistory(Long orderId, OrderStatus fromStatus, OrderStatus toStatus, 
                            String changedByStaffId, String reason) {
        this();
        this.orderId = orderId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedByStaffId = changedByStaffId;
        this.reason = reason;
    }
    
    // Business logic methods
    public boolean isStatusProgression() {
        if (fromStatus == null || toStatus == null) return false;
        
        // Define status progression order
        OrderStatus[] progression = {
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED
        };
        
        int fromIndex = getStatusIndex(fromStatus, progression);
        int toIndex = getStatusIndex(toStatus, progression);
        
        return fromIndex >= 0 && toIndex >= 0 && toIndex > fromIndex;
    }
    
    private int getStatusIndex(OrderStatus status, OrderStatus[] progression) {
        for (int i = 0; i < progression.length; i++) {
            if (progression[i] == status) {
                return i;
            }
        }
        return -1;
    }
    
    public boolean isStatusRegression() {
        return !isStatusProgression() && fromStatus != toStatus;
    }
    
    public String getStatusChangeDescription() {
        if (fromStatus == null) {
            return "Order created with status: " + (toStatus != null ? toStatus.getDisplayName() : "Unknown");
        }
        return "Changed from " + fromStatus.getDisplayName() + " to " + 
               (toStatus != null ? toStatus.getDisplayName() : "Unknown");
    }
    
    // Getters and Setters
    public Long getHistoryId() {
        return historyId;
    }
    
    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    public OrderStatus getFromStatus() {
        return fromStatus;
    }
    
    public void setFromStatus(OrderStatus fromStatus) {
        this.fromStatus = fromStatus;
    }
    
    public OrderStatus getToStatus() {
        return toStatus;
    }
    
    public void setToStatus(OrderStatus toStatus) {
        this.toStatus = toStatus;
    }
    
    public String getChangedByStaffId() {
        return changedByStaffId;
    }
    
    public void setChangedByStaffId(String changedByStaffId) {
        this.changedByStaffId = changedByStaffId;
    }
    
    public String getStaffName() {
        return staffName;
    }
    
    public void setStaffName(String staffName) {
        this.staffName = staffName;
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
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public long getDurationInPreviousStatus() {
        return durationInPreviousStatus;
    }
    
    public void setDurationInPreviousStatus(long durationInPreviousStatus) {
        this.durationInPreviousStatus = durationInPreviousStatus;
    }
    
    @Override
    public String toString() {
        return "OrderStatusHistory{" +
                "historyId=" + historyId +
                ", orderId=" + orderId +
                ", fromStatus=" + fromStatus +
                ", toStatus=" + toStatus +
                ", changedByStaffId='" + changedByStaffId + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}