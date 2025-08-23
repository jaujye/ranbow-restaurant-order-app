package com.ranbow.restaurant.models.kitchen;

import java.time.LocalDateTime;

/**
 * Station Assignment Response DTO
 * Response object for kitchen station assignment operations
 */
public class StationAssignmentResponse {
    private boolean success;
    private String message;
    private String errorCode;
    private String stationId;
    private String orderId;
    private String staffId;
    private LocalDateTime assignedAt;
    private LocalDateTime timestamp;
    private AssignmentDetails details;
    
    public StationAssignmentResponse() {
        this.timestamp = LocalDateTime.now();
        this.assignedAt = LocalDateTime.now();
    }
    
    public StationAssignmentResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public StationAssignmentResponse(boolean success, String message, String stationId, 
                                   String orderId, String staffId) {
        this(success, message);
        this.stationId = stationId;
        this.orderId = orderId;
        this.staffId = staffId;
    }
    
    // Static factory methods
    public static StationAssignmentResponse success(String stationId, String orderId, String staffId) {
        StationAssignmentResponse response = new StationAssignmentResponse(
            true, "Order assigned to station successfully", stationId, orderId, staffId);
        return response;
    }
    
    public static StationAssignmentResponse success(String message, String stationId, 
                                                   String orderId, String staffId) {
        StationAssignmentResponse response = new StationAssignmentResponse(
            true, message, stationId, orderId, staffId);
        return response;
    }
    
    public static StationAssignmentResponse error(String message) {
        StationAssignmentResponse response = new StationAssignmentResponse(false, message);
        response.setErrorCode("ASSIGNMENT_FAILED");
        return response;
    }
    
    public static StationAssignmentResponse error(String message, String errorCode) {
        StationAssignmentResponse response = new StationAssignmentResponse(false, message);
        response.setErrorCode(errorCode);
        return response;
    }
    
    // Business logic methods
    public boolean isAssignmentSuccessful() {
        return success && stationId != null && orderId != null;
    }
    
    public boolean hasStaffAssignment() {
        return staffId != null && !staffId.trim().isEmpty();
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    public String getStationId() {
        return stationId;
    }
    
    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public AssignmentDetails getDetails() {
        return details;
    }
    
    public void setDetails(AssignmentDetails details) {
        this.details = details;
    }
    
    @Override
    public String toString() {
        return "StationAssignmentResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", stationId='" + stationId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", assignedAt=" + assignedAt +
                '}';
    }
    
    /**
     * Assignment Details DTO
     * Additional details about the station assignment
     */
    public static class AssignmentDetails {
        private String stationName;
        private String stationType;
        private int estimatedCompletionMinutes;
        private double stationCapacityBefore;
        private double stationCapacityAfter;
        private String assignmentReason;
        private String priority;
        
        public AssignmentDetails() {}
        
        public AssignmentDetails(String stationName, String stationType, int estimatedCompletionMinutes) {
            this.stationName = stationName;
            this.stationType = stationType;
            this.estimatedCompletionMinutes = estimatedCompletionMinutes;
        }
        
        // Getters and Setters
        public String getStationName() { return stationName; }
        public void setStationName(String stationName) { this.stationName = stationName; }
        public String getStationType() { return stationType; }
        public void setStationType(String stationType) { this.stationType = stationType; }
        public int getEstimatedCompletionMinutes() { return estimatedCompletionMinutes; }
        public void setEstimatedCompletionMinutes(int estimatedCompletionMinutes) { 
            this.estimatedCompletionMinutes = estimatedCompletionMinutes; 
        }
        public double getStationCapacityBefore() { return stationCapacityBefore; }
        public void setStationCapacityBefore(double stationCapacityBefore) { 
            this.stationCapacityBefore = stationCapacityBefore; 
        }
        public double getStationCapacityAfter() { return stationCapacityAfter; }
        public void setStationCapacityAfter(double stationCapacityAfter) { 
            this.stationCapacityAfter = stationCapacityAfter; 
        }
        public String getAssignmentReason() { return assignmentReason; }
        public void setAssignmentReason(String assignmentReason) { this.assignmentReason = assignmentReason; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        
        @Override
        public String toString() {
            return String.format("AssignmentDetails{stationName='%s', type='%s', estimatedMinutes=%d}", 
                               stationName, stationType, estimatedCompletionMinutes);
        }
    }
}