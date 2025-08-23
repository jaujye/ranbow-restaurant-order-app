package com.ranbow.restaurant.staff.model.dto;

/**
 * Request DTO for starting cooking session
 */
public class StartCookingRequest {
    
    private String orderId;
    private Integer estimatedDurationSeconds;
    private String workstationId;
    private String specialInstructions;
    
    // Constructors
    public StartCookingRequest() {}
    
    public StartCookingRequest(String orderId, Integer estimatedDurationSeconds) {
        this.orderId = orderId;
        this.estimatedDurationSeconds = estimatedDurationSeconds;
    }
    
    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public Integer getEstimatedDurationSeconds() {
        return estimatedDurationSeconds;
    }
    
    public void setEstimatedDurationSeconds(Integer estimatedDurationSeconds) {
        this.estimatedDurationSeconds = estimatedDurationSeconds;
    }
    
    public String getWorkstationId() {
        return workstationId;
    }
    
    public void setWorkstationId(String workstationId) {
        this.workstationId = workstationId;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    @Override
    public String toString() {
        return "StartCookingRequest{" +
                "orderId='" + orderId + '\'' +
                ", estimatedDurationSeconds=" + estimatedDurationSeconds +
                ", workstationId='" + workstationId + '\'' +
                '}';
    }
}