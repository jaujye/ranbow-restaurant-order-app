package com.ranbow.restaurant.staff.model.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Batch Assignment Request
 * Request DTO for batch order assignment operations
 */
public class BatchAssignmentRequest {
    
    @NotEmpty(message = "Order IDs list cannot be empty")
    private List<Long> orderIds;
    
    @NotNull(message = "Assigned to staff ID cannot be null")
    private String assignedToStaffId;
    
    private String reason;
    private String notes;
    private boolean forceAssignment; // Override capacity checks
    private boolean redistributeWorkload; // Auto redistribute if staff is overloaded
    private String priority; // HIGH, NORMAL, LOW for processing priority
    
    // Constructors
    public BatchAssignmentRequest() {}
    
    public BatchAssignmentRequest(List<Long> orderIds, String assignedToStaffId) {
        this.orderIds = orderIds;
        this.assignedToStaffId = assignedToStaffId;
        this.forceAssignment = false;
        this.redistributeWorkload = false;
        this.priority = "NORMAL";
    }
    
    // Validation methods
    public boolean isValid() {
        return orderIds != null && !orderIds.isEmpty() && 
               assignedToStaffId != null && !assignedToStaffId.trim().isEmpty();
    }
    
    public int getOrderCount() {
        return orderIds != null ? orderIds.size() : 0;
    }
    
    public boolean isBulkOperation() {
        return getOrderCount() > 5; // Consider bulk if more than 5 orders
    }
    
    public boolean shouldCheckCapacity() {
        return !forceAssignment;
    }
    
    // Getters and Setters
    public List<Long> getOrderIds() {
        return orderIds;
    }
    
    public void setOrderIds(List<Long> orderIds) {
        this.orderIds = orderIds;
    }
    
    public String getAssignedToStaffId() {
        return assignedToStaffId;
    }
    
    public void setAssignedToStaffId(String assignedToStaffId) {
        this.assignedToStaffId = assignedToStaffId;
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
    
    public boolean isForceAssignment() {
        return forceAssignment;
    }
    
    public void setForceAssignment(boolean forceAssignment) {
        this.forceAssignment = forceAssignment;
    }
    
    public boolean isRedistributeWorkload() {
        return redistributeWorkload;
    }
    
    public void setRedistributeWorkload(boolean redistributeWorkload) {
        this.redistributeWorkload = redistributeWorkload;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    @Override
    public String toString() {
        return "BatchAssignmentRequest{" +
                "orderIds=" + orderIds +
                ", assignedToStaffId='" + assignedToStaffId + '\'' +
                ", orderCount=" + getOrderCount() +
                ", forceAssignment=" + forceAssignment +
                ", redistributeWorkload=" + redistributeWorkload +
                '}';
    }
}