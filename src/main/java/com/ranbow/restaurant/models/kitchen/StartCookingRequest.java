package com.ranbow.restaurant.models.kitchen;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Start Cooking Request DTO
 * Request to start a cooking session with timer
 */
public class StartCookingRequest {
    
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @NotNull(message = "Estimated duration is required")
    @Positive(message = "Duration must be positive")
    private Integer estimatedDurationSeconds;
    
    private String workstationId;
    private String notes;
    
    // Constructors
    public StartCookingRequest() {}
    
    public StartCookingRequest(String orderId, Integer estimatedDurationSeconds) {
        this.orderId = orderId;
        this.estimatedDurationSeconds = estimatedDurationSeconds;
    }
    
    public StartCookingRequest(String orderId, Integer estimatedDurationSeconds, String workstationId) {
        this.orderId = orderId;
        this.estimatedDurationSeconds = estimatedDurationSeconds;
        this.workstationId = workstationId;
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
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "StartCookingRequest{" +
                "orderId='" + orderId + '\'' +
                ", estimatedDurationSeconds=" + estimatedDurationSeconds +
                ", workstationId='" + workstationId + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}