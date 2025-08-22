package com.ranbow.restaurant.staff.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Kitchen Timer Request DTO
 * Data Transfer Object for starting/managing cooking timers
 */
public class KitchenTimerRequest {
    
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @NotBlank(message = "Staff ID is required")
    private String staffId;
    
    @NotBlank(message = "Menu item ID is required")
    private String menuItemId;
    
    @NotBlank(message = "Menu item name is required")
    private String menuItemName;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @NotNull(message = "Estimated duration is required")
    @Positive(message = "Estimated duration must be positive")
    private Integer estimatedDurationMinutes;
    
    private String specialInstructions;
    private String cookingMethod;
    private Integer temperatureCelsius;
    private Integer alertThresholdMinutes;
    private String notes;
    
    // Constructors
    public KitchenTimerRequest() {}
    
    public KitchenTimerRequest(String orderId, String staffId, String menuItemId, 
                              String menuItemName, Integer quantity, Integer estimatedDurationMinutes) {
        this.orderId = orderId;
        this.staffId = staffId;
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.quantity = quantity;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }
    
    // Getters and Setters
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
    
    public String getMenuItemId() {
        return menuItemId;
    }
    
    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }
    
    public String getMenuItemName() {
        return menuItemName;
    }
    
    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }
    
    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    public String getCookingMethod() {
        return cookingMethod;
    }
    
    public void setCookingMethod(String cookingMethod) {
        this.cookingMethod = cookingMethod;
    }
    
    public Integer getTemperatureCelsius() {
        return temperatureCelsius;
    }
    
    public void setTemperatureCelsius(Integer temperatureCelsius) {
        this.temperatureCelsius = temperatureCelsius;
    }
    
    public Integer getAlertThresholdMinutes() {
        return alertThresholdMinutes;
    }
    
    public void setAlertThresholdMinutes(Integer alertThresholdMinutes) {
        this.alertThresholdMinutes = alertThresholdMinutes;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "KitchenTimerRequest{" +
                "orderId='" + orderId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", menuItemId='" + menuItemId + '\'' +
                ", menuItemName='" + menuItemName + '\'' +
                ", quantity=" + quantity +
                ", estimatedDurationMinutes=" + estimatedDurationMinutes +
                ", cookingMethod='" + cookingMethod + '\'' +
                ", temperatureCelsius=" + temperatureCelsius +
                '}';
    }
}