package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Kitchen-specific order tracking entity
 * Extends Order information with cooking and preparation details
 */
public class KitchenOrder {
    private String kitchenOrderId;
    private String orderId; // Reference to main Order
    private String assignedStaffId; // Chef/staff member handling this order
    private LocalDateTime startTime; // When cooking started
    private LocalDateTime estimatedCompletionTime;
    private LocalDateTime actualCompletionTime;
    private int estimatedCookingMinutes; // Expected cooking time
    private int actualCookingMinutes; // Actual time taken
    private boolean isOvertime; // Whether order exceeded expected time
    private String cookingNotes; // Chef's notes during preparation
    private KitchenStatus kitchenStatus;
    private int priority; // 1-10, 10 being highest priority
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public KitchenOrder() {
        this.kitchenOrderId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.kitchenStatus = KitchenStatus.QUEUED;
        this.priority = 5; // Default priority
        this.isOvertime = false;
    }
    
    public KitchenOrder(String orderId, int estimatedCookingMinutes) {
        this();
        this.orderId = orderId;
        this.estimatedCookingMinutes = estimatedCookingMinutes;
        this.estimatedCompletionTime = LocalDateTime.now().plusMinutes(estimatedCookingMinutes);
    }
    
    // Business methods
    public void startCooking(String staffId) {
        this.assignedStaffId = staffId;
        this.startTime = LocalDateTime.now();
        this.kitchenStatus = KitchenStatus.COOKING;
        this.estimatedCompletionTime = this.startTime.plusMinutes(estimatedCookingMinutes);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void completeCooking() {
        this.actualCompletionTime = LocalDateTime.now();
        this.kitchenStatus = KitchenStatus.READY;
        
        if (this.startTime != null) {
            this.actualCookingMinutes = (int) java.time.Duration.between(startTime, actualCompletionTime).toMinutes();
            this.isOvertime = this.actualCookingMinutes > this.estimatedCookingMinutes + 5; // 5 minute buffer
        }
        
        this.updatedAt = LocalDateTime.now();
    }
    
    public void pauseCooking() {
        this.kitchenStatus = KitchenStatus.PAUSED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void resumeCooking() {
        this.kitchenStatus = KitchenStatus.COOKING;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void cancelCooking(String reason) {
        this.kitchenStatus = KitchenStatus.CANCELLED;
        if (this.cookingNotes != null) {
            this.cookingNotes += " | 取消原因: " + reason;
        } else {
            this.cookingNotes = "取消原因: " + reason;
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean isOverdue() {
        if (estimatedCompletionTime == null || kitchenStatus == KitchenStatus.READY || 
            kitchenStatus == KitchenStatus.CANCELLED) {
            return false;
        }
        return LocalDateTime.now().isAfter(estimatedCompletionTime);
    }
    
    public int getOverdueMinutes() {
        if (!isOverdue()) return 0;
        return (int) java.time.Duration.between(estimatedCompletionTime, LocalDateTime.now()).toMinutes();
    }
    
    public int getRemainingMinutes() {
        if (estimatedCompletionTime == null || isOverdue()) return 0;
        return (int) java.time.Duration.between(LocalDateTime.now(), estimatedCompletionTime).toMinutes();
    }
    
    public void addCookingNote(String note) {
        if (this.cookingNotes != null) {
            this.cookingNotes += " | " + note;
        } else {
            this.cookingNotes = note;
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updatePriority(int newPriority) {
        this.priority = Math.max(1, Math.min(10, newPriority)); // Clamp between 1 and 10
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getKitchenOrderId() {
        return kitchenOrderId;
    }
    
    public void setKitchenOrderId(String kitchenOrderId) {
        this.kitchenOrderId = kitchenOrderId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getAssignedStaffId() {
        return assignedStaffId;
    }
    
    public void setAssignedStaffId(String assignedStaffId) {
        this.assignedStaffId = assignedStaffId;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }
    
    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }
    
    public LocalDateTime getActualCompletionTime() {
        return actualCompletionTime;
    }
    
    public void setActualCompletionTime(LocalDateTime actualCompletionTime) {
        this.actualCompletionTime = actualCompletionTime;
    }
    
    public int getEstimatedCookingMinutes() {
        return estimatedCookingMinutes;
    }
    
    public void setEstimatedCookingMinutes(int estimatedCookingMinutes) {
        this.estimatedCookingMinutes = estimatedCookingMinutes;
    }
    
    public int getActualCookingMinutes() {
        return actualCookingMinutes;
    }
    
    public void setActualCookingMinutes(int actualCookingMinutes) {
        this.actualCookingMinutes = actualCookingMinutes;
    }
    
    public boolean isOvertime() {
        return isOvertime;
    }
    
    public void setOvertime(boolean overtime) {
        isOvertime = overtime;
    }
    
    public String getCookingNotes() {
        return cookingNotes;
    }
    
    public void setCookingNotes(String cookingNotes) {
        this.cookingNotes = cookingNotes;
    }
    
    public KitchenStatus getKitchenStatus() {
        return kitchenStatus;
    }
    
    public void setKitchenStatus(KitchenStatus kitchenStatus) {
        this.kitchenStatus = kitchenStatus;
    }
    
    public int getPriority() {
        return priority;
    }
    
    public void setPriority(int priority) {
        this.priority = priority;
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
    
    @Override
    public String toString() {
        return "KitchenOrder{" +
                "kitchenOrderId='" + kitchenOrderId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", assignedStaffId='" + assignedStaffId + '\'' +
                ", kitchenStatus=" + kitchenStatus +
                ", priority=" + priority +
                ", estimatedCookingMinutes=" + estimatedCookingMinutes +
                ", isOvertime=" + isOvertime +
                '}';
    }
}