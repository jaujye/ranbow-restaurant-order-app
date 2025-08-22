package com.ranbow.restaurant.staff.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Staff Quick Switch Request DTO
 * Used for PIN-based staff switching functionality
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 */
public class StaffQuickSwitchRequest {
    
    @NotBlank(message = "Current staff ID is required")
    private String currentStaffId;
    
    @NotBlank(message = "Target staff ID is required")
    private String targetStaffId;
    
    @NotBlank(message = "PIN is required")
    @Size(min = 4, max = 6, message = "PIN must be between 4 and 6 digits")
    private String pin;
    
    // Constructors
    public StaffQuickSwitchRequest() {}
    
    public StaffQuickSwitchRequest(String currentStaffId, String targetStaffId, String pin) {
        this.currentStaffId = currentStaffId;
        this.targetStaffId = targetStaffId;
        this.pin = pin;
    }
    
    // Getters and Setters
    public String getCurrentStaffId() {
        return currentStaffId;
    }
    
    public void setCurrentStaffId(String currentStaffId) {
        this.currentStaffId = currentStaffId;
    }
    
    public String getTargetStaffId() {
        return targetStaffId;
    }
    
    public void setTargetStaffId(String targetStaffId) {
        this.targetStaffId = targetStaffId;
    }
    
    public String getPin() {
        return pin;
    }
    
    public void setPin(String pin) {
        this.pin = pin;
    }
    
    @Override
    public String toString() {
        return "StaffQuickSwitchRequest{" +
                "currentStaffId='" + currentStaffId + '\'' +
                ", targetStaffId='" + targetStaffId + '\'' +
                ", pin=***" + // Hide PIN in logs
                '}';
    }
}