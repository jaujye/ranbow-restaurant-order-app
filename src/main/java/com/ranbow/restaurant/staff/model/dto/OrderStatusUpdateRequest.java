package com.ranbow.restaurant.staff.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Order Status Update Request DTO
 * Data Transfer Object for updating order status through staff interface
 */
public class OrderStatusUpdateRequest {
    
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @NotBlank(message = "New status is required")
    private String newStatus;
    
    private String currentStatus;
    
    @NotNull(message = "Staff ID is required")
    private String staffId;
    
    private String notes;
    private String reason;
    private Integer estimatedMinutes;
    private Double qualityScore;
    private String location;
    
    // Constructors
    public OrderStatusUpdateRequest() {}
    
    public OrderStatusUpdateRequest(String orderId, String newStatus, String staffId) {
        this.orderId = orderId;
        this.newStatus = newStatus;
        this.staffId = staffId;
    }
    
    public OrderStatusUpdateRequest(String orderId, String newStatus, String staffId, String notes) {
        this.orderId = orderId;
        this.newStatus = newStatus;
        this.staffId = staffId;
        this.notes = notes;
    }
    
    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }
    
    public String getCurrentStatus() {
        return currentStatus;
    }
    
    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }
    
    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }
    
    public Double getQualityScore() {
        return qualityScore;
    }
    
    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    @Override
    public String toString() {
        return "OrderStatusUpdateRequest{" +
                "orderId='" + orderId + '\'' +
                ", newStatus='" + newStatus + '\'' +
                ", staffId='" + staffId + '\'' +
                ", notes='" + notes + '\'' +
                ", reason='" + reason + '\'' +
                ", estimatedMinutes=" + estimatedMinutes +
                ", qualityScore=" + qualityScore +
                '}';
    }
}