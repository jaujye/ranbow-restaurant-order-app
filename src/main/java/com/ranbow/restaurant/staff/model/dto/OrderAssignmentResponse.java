package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.entity.StaffMember;
import java.time.LocalDateTime;

/**
 * Order Assignment Response
 * Response DTO for order assignment operations
 */
public class OrderAssignmentResponse {
    
    private Long orderId;
    private String orderNumber;
    private String assignedToStaffId;
    private String assignedToStaffName;
    private StaffMember previousAssignedStaff;
    private LocalDateTime assignmentTime;
    private String assignedByStaffId;
    private String assignedByStaffName;
    private boolean wasSuccessful;
    private String errorMessage;
    private String reason;
    private LocalDateTime estimatedCompleteTime;
    private int staffCurrentWorkload;
    private int staffMaxCapacity;
    private String workloadStatus; // AVAILABLE, BUSY, OVERLOADED
    private String nextRequiredAction;
    
    // Constructors
    public OrderAssignmentResponse() {
        this.assignmentTime = LocalDateTime.now();
        this.wasSuccessful = false;
        this.workloadStatus = "UNKNOWN";
    }
    
    public OrderAssignmentResponse(Long orderId, String orderNumber, String assignedToStaffId, 
                                 String assignedToStaffName, String assignedByStaffId) {
        this();
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.assignedToStaffId = assignedToStaffId;
        this.assignedToStaffName = assignedToStaffName;
        this.assignedByStaffId = assignedByStaffId;
        this.wasSuccessful = true;
    }
    
    // Factory methods
    public static OrderAssignmentResponse success(Long orderId, String orderNumber, 
                                                String assignedToStaffId, String assignedToStaffName,
                                                String assignedByStaffId, String assignedByStaffName) {
        OrderAssignmentResponse response = new OrderAssignmentResponse(orderId, orderNumber, 
                                                                     assignedToStaffId, assignedToStaffName, 
                                                                     assignedByStaffId);
        response.setAssignedByStaffName(assignedByStaffName);
        response.setReason("Manual assignment");
        return response;
    }
    
    public static OrderAssignmentResponse autoAssignmentSuccess(Long orderId, String orderNumber,
                                                              String assignedToStaffId, String assignedToStaffName) {
        OrderAssignmentResponse response = new OrderAssignmentResponse(orderId, orderNumber,
                                                                     assignedToStaffId, assignedToStaffName, 
                                                                     "SYSTEM");
        response.setAssignedByStaffName("Auto Assignment System");
        response.setReason("Automatic assignment based on workload");
        return response;
    }
    
    public static OrderAssignmentResponse failure(Long orderId, String orderNumber, String errorMessage) {
        OrderAssignmentResponse response = new OrderAssignmentResponse();
        response.setOrderId(orderId);
        response.setOrderNumber(orderNumber);
        response.setErrorMessage(errorMessage);
        response.setWasSuccessful(false);
        return response;
    }
    
    // Business logic methods
    public boolean isReassignment() {
        return previousAssignedStaff != null;
    }
    
    public boolean isAutoAssignment() {
        return "SYSTEM".equals(assignedByStaffId);
    }
    
    public boolean isStaffOverloaded() {
        return "OVERLOADED".equals(workloadStatus);
    }
    
    public void updateWorkloadStatus(int currentWorkload, int maxCapacity) {
        this.staffCurrentWorkload = currentWorkload;
        this.staffMaxCapacity = maxCapacity;
        
        if (maxCapacity == 0) {
            this.workloadStatus = "UNKNOWN";
        } else {
            double percentage = ((double) currentWorkload / maxCapacity) * 100;
            if (percentage < 70) {
                this.workloadStatus = "AVAILABLE";
            } else if (percentage < 100) {
                this.workloadStatus = "BUSY";
            } else {
                this.workloadStatus = "OVERLOADED";
            }
        }
    }
    
    public String getAssignmentDescription() {
        if (isReassignment()) {
            return "Order #" + orderNumber + " reassigned from " + 
                   previousAssignedStaff.getFullName() + " to " + assignedToStaffName;
        } else {
            return "Order #" + orderNumber + " assigned to " + assignedToStaffName;
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
    
    public StaffMember getPreviousAssignedStaff() {
        return previousAssignedStaff;
    }
    
    public void setPreviousAssignedStaff(StaffMember previousAssignedStaff) {
        this.previousAssignedStaff = previousAssignedStaff;
    }
    
    public LocalDateTime getAssignmentTime() {
        return assignmentTime;
    }
    
    public void setAssignmentTime(LocalDateTime assignmentTime) {
        this.assignmentTime = assignmentTime;
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
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public LocalDateTime getEstimatedCompleteTime() {
        return estimatedCompleteTime;
    }
    
    public void setEstimatedCompleteTime(LocalDateTime estimatedCompleteTime) {
        this.estimatedCompleteTime = estimatedCompleteTime;
    }
    
    public int getStaffCurrentWorkload() {
        return staffCurrentWorkload;
    }
    
    public void setStaffCurrentWorkload(int staffCurrentWorkload) {
        this.staffCurrentWorkload = staffCurrentWorkload;
    }
    
    public int getStaffMaxCapacity() {
        return staffMaxCapacity;
    }
    
    public void setStaffMaxCapacity(int staffMaxCapacity) {
        this.staffMaxCapacity = staffMaxCapacity;
    }
    
    public String getWorkloadStatus() {
        return workloadStatus;
    }
    
    public void setWorkloadStatus(String workloadStatus) {
        this.workloadStatus = workloadStatus;
    }
    
    public String getNextRequiredAction() {
        return nextRequiredAction;
    }
    
    public void setNextRequiredAction(String nextRequiredAction) {
        this.nextRequiredAction = nextRequiredAction;
    }
    
    @Override
    public String toString() {
        return "OrderAssignmentResponse{" +
                "orderId=" + orderId +
                ", orderNumber='" + orderNumber + '\'' +
                ", assignedToStaffId='" + assignedToStaffId + '\'' +
                ", assignedToStaffName='" + assignedToStaffName + '\'' +
                ", wasSuccessful=" + wasSuccessful +
                ", assignmentTime=" + assignmentTime +
                '}';
    }
}