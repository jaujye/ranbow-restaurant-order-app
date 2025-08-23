package com.ranbow.restaurant.staff.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Batch Assignment Response
 * Response DTO for batch order assignment operations
 */
public class BatchAssignmentResponse {
    
    private int totalOrders;
    private int successfulAssignments;
    private int failedAssignments;
    private String assignedToStaffId;
    private String assignedToStaffName;
    private String assignedByStaffId;
    private String assignedByStaffName;
    private LocalDateTime assignmentTime;
    private boolean wasPartiallySuccessful;
    private List<OrderAssignmentResult> results;
    private Map<String, Integer> assignmentSummary;
    private String overallStatus; // SUCCESS, PARTIAL_SUCCESS, FAILURE
    private List<String> warnings;
    private String recommendation;
    private int newStaffWorkload;
    private int staffMaxCapacity;
    private String staffWorkloadStatus;
    private List<String> failedOrderIds;
    private List<String> successfulOrderIds; // List of successful order IDs
    private String staffId; // Alias for assignedToStaffId
    private LocalDateTime assignedAt; // Alias for assignmentTime
    
    // Constructors
    public BatchAssignmentResponse() {
        this.assignmentTime = LocalDateTime.now();
        this.successfulAssignments = 0;
        this.failedAssignments = 0;
        this.overallStatus = "FAILURE";
    }
    
    public BatchAssignmentResponse(int totalOrders, String assignedToStaffId, String assignedByStaffId) {
        this();
        this.totalOrders = totalOrders;
        this.assignedToStaffId = assignedToStaffId;
        this.assignedByStaffId = assignedByStaffId;
    }
    
    // Nested class for individual assignment results
    public static class OrderAssignmentResult {
        private Long orderId;
        private String orderNumber;
        private boolean wasSuccessful;
        private String errorMessage;
        private String reason;
        
        public OrderAssignmentResult() {}
        
        public OrderAssignmentResult(Long orderId, String orderNumber, boolean wasSuccessful) {
            this.orderId = orderId;
            this.orderNumber = orderNumber;
            this.wasSuccessful = wasSuccessful;
        }
        
        public static OrderAssignmentResult success(Long orderId, String orderNumber) {
            return new OrderAssignmentResult(orderId, orderNumber, true);
        }
        
        public static OrderAssignmentResult failure(Long orderId, String orderNumber, String errorMessage) {
            OrderAssignmentResult result = new OrderAssignmentResult(orderId, orderNumber, false);
            result.setErrorMessage(errorMessage);
            return result;
        }
        
        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        
        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
        
        public boolean isWasSuccessful() { return wasSuccessful; }
        public void setWasSuccessful(boolean wasSuccessful) { this.wasSuccessful = wasSuccessful; }
        
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    // Business logic methods
    public void calculateSummary() {
        if (results != null) {
            this.successfulAssignments = (int) results.stream().mapToLong(r -> r.wasSuccessful ? 1 : 0).sum();
            this.failedAssignments = totalOrders - successfulAssignments;
            
            if (successfulAssignments == totalOrders) {
                this.overallStatus = "SUCCESS";
                this.wasPartiallySuccessful = false;
            } else if (successfulAssignments > 0) {
                this.overallStatus = "PARTIAL_SUCCESS";
                this.wasPartiallySuccessful = true;
            } else {
                this.overallStatus = "FAILURE";
                this.wasPartiallySuccessful = false;
            }
        }
    }
    
    public double getSuccessRate() {
        return totalOrders > 0 ? ((double) successfulAssignments / totalOrders) * 100 : 0;
    }
    
    public boolean isCompletelySuccessful() {
        return "SUCCESS".equals(overallStatus);
    }
    
    public boolean hasFailures() {
        return failedAssignments > 0;
    }
    
    public String getBatchSummaryDescription() {
        return String.format("Batch assignment completed: %d/%d orders successfully assigned to %s", 
                           successfulAssignments, totalOrders, assignedToStaffName);
    }
    
    public void addWarning(String warning) {
        if (warnings == null) {
            warnings = new java.util.ArrayList<>();
        }
        warnings.add(warning);
    }
    
    public void updateWorkloadStatus(int newWorkload, int maxCapacity) {
        this.newStaffWorkload = newWorkload;
        this.staffMaxCapacity = maxCapacity;
        
        if (maxCapacity == 0) {
            this.staffWorkloadStatus = "UNKNOWN";
            this.recommendation = "Unable to determine staff capacity";
        } else {
            double percentage = ((double) newWorkload / maxCapacity) * 100;
            if (percentage < 70) {
                this.staffWorkloadStatus = "OPTIMAL";
                this.recommendation = "Staff has available capacity for additional orders";
            } else if (percentage < 90) {
                this.staffWorkloadStatus = "BUSY";
                this.recommendation = "Staff is approaching capacity limit";
                addWarning("Staff workload is at " + String.format("%.1f", percentage) + "%");
            } else {
                this.staffWorkloadStatus = "OVERLOADED";
                this.recommendation = "Consider redistributing some orders to other staff members";
                addWarning("Staff is overloaded at " + String.format("%.1f", percentage) + "% capacity");
            }
        }
    }
    
    // Factory methods
    public static BatchAssignmentResponse success(int totalOrders, String assignedToStaffId, 
                                                String assignedToStaffName, String assignedByStaffId,
                                                String assignedByStaffName, List<OrderAssignmentResult> results) {
        BatchAssignmentResponse response = new BatchAssignmentResponse(totalOrders, assignedToStaffId, assignedByStaffId);
        response.setAssignedToStaffName(assignedToStaffName);
        response.setAssignedByStaffName(assignedByStaffName);
        response.setResults(results);
        response.calculateSummary();
        return response;
    }
    
    public static BatchAssignmentResponse failure(int totalOrders, String errorMessage) {
        BatchAssignmentResponse response = new BatchAssignmentResponse();
        response.setTotalOrders(totalOrders);
        response.setFailedAssignments(totalOrders);
        response.setOverallStatus("FAILURE");
        response.addWarning(errorMessage);
        return response;
    }
    
    // Getters and Setters
    public int getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public int getSuccessfulAssignments() {
        return successfulAssignments;
    }
    
    public void setSuccessfulAssignments(int successfulAssignments) {
        this.successfulAssignments = successfulAssignments;
    }
    
    public int getFailedAssignments() {
        return failedAssignments;
    }
    
    public void setFailedAssignments(int failedAssignments) {
        this.failedAssignments = failedAssignments;
    }
    
    public String getAssignedToStaffId() {
        return assignedToStaffId;
    }
    
    public void setAssignedToStaffId(String assignedToStaffId) {
        this.assignedToStaffId = assignedToStaffId;
    }
    
    public String getAssignedToStaffName() {
        return assignedToStaffName;
    }
    
    public void setAssignedToStaffName(String assignedToStaffName) {
        this.assignedToStaffName = assignedToStaffName;
    }
    
    public String getAssignedByStaffId() {
        return assignedByStaffId;
    }
    
    public void setAssignedByStaffId(String assignedByStaffId) {
        this.assignedByStaffId = assignedByStaffId;
    }
    
    public String getAssignedByStaffName() {
        return assignedByStaffName;
    }
    
    public void setAssignedByStaffName(String assignedByStaffName) {
        this.assignedByStaffName = assignedByStaffName;
    }
    
    public LocalDateTime getAssignmentTime() {
        return assignmentTime;
    }
    
    public void setAssignmentTime(LocalDateTime assignmentTime) {
        this.assignmentTime = assignmentTime;
    }
    
    public boolean isWasPartiallySuccessful() {
        return wasPartiallySuccessful;
    }
    
    public void setWasPartiallySuccessful(boolean wasPartiallySuccessful) {
        this.wasPartiallySuccessful = wasPartiallySuccessful;
    }
    
    public List<OrderAssignmentResult> getResults() {
        return results;
    }
    
    public void setResults(List<OrderAssignmentResult> results) {
        this.results = results;
    }
    
    public Map<String, Integer> getAssignmentSummary() {
        return assignmentSummary;
    }
    
    public void setAssignmentSummary(Map<String, Integer> assignmentSummary) {
        this.assignmentSummary = assignmentSummary;
    }
    
    public String getOverallStatus() {
        return overallStatus;
    }
    
    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }
    
    public List<String> getWarnings() {
        return warnings;
    }
    
    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
    
    public String getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
    
    public int getNewStaffWorkload() {
        return newStaffWorkload;
    }
    
    public void setNewStaffWorkload(int newStaffWorkload) {
        this.newStaffWorkload = newStaffWorkload;
    }
    
    public int getStaffMaxCapacity() {
        return staffMaxCapacity;
    }
    
    public void setStaffMaxCapacity(int staffMaxCapacity) {
        this.staffMaxCapacity = staffMaxCapacity;
    }
    
    public String getStaffWorkloadStatus() {
        return staffWorkloadStatus;
    }
    
    public void setStaffWorkloadStatus(String staffWorkloadStatus) {
        this.staffWorkloadStatus = staffWorkloadStatus;
    }
    
    public List<String> getFailedOrderIds() {
        return failedOrderIds;
    }
    
    public void setFailedOrderIds(List<String> failedOrderIds) {
        this.failedOrderIds = failedOrderIds;
    }
    
    public List<String> getSuccessfulOrderIds() {
        return successfulOrderIds;
    }
    
    public void setSuccessfulOrderIds(List<String> successfulOrderIds) {
        this.successfulOrderIds = successfulOrderIds;
    }
    
    public String getStaffId() {
        return staffId != null ? staffId : assignedToStaffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
        // Keep consistency with assignedToStaffId
        if (this.assignedToStaffId == null) {
            this.assignedToStaffId = staffId;
        }
    }
    
    public LocalDateTime getAssignedAt() {
        return assignedAt != null ? assignedAt : assignmentTime;
    }
    
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
        // Keep consistency with assignmentTime
        if (this.assignmentTime == null) {
            this.assignmentTime = assignedAt;
        }
    }
    
    @Override
    public String toString() {
        return "BatchAssignmentResponse{" +
                "totalOrders=" + totalOrders +
                ", successfulAssignments=" + successfulAssignments +
                ", failedAssignments=" + failedAssignments +
                ", assignedToStaffName='" + assignedToStaffName + '\'' +
                ", overallStatus='" + overallStatus + '\'' +
                ", assignmentTime=" + assignmentTime +
                '}';
    }
}