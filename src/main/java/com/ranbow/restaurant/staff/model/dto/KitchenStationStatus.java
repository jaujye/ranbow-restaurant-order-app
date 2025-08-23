package com.ranbow.restaurant.staff.model.dto;

import java.util.List;

/**
 * DTO representing the status of a kitchen station
 */
public class KitchenStationStatus {
    
    private String stationId;
    private String stationName;
    private double capacityPercentage;
    private int activeOrders;
    private List<String> assignedStaffIds;
    private List<CookingTimerSummary> activeTimers;
    private double averageEfficiency;
    
    // Constructors
    public KitchenStationStatus() {}
    
    public KitchenStationStatus(String stationId, String stationName, double capacityPercentage, 
                               int activeOrders, List<String> assignedStaffIds, 
                               List<CookingTimerSummary> activeTimers, double averageEfficiency) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.capacityPercentage = capacityPercentage;
        this.activeOrders = activeOrders;
        this.assignedStaffIds = assignedStaffIds;
        this.activeTimers = activeTimers;
        this.averageEfficiency = averageEfficiency;
    }
    
    // Getters and Setters
    public String getStationId() {
        return stationId;
    }
    
    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
    
    public String getStationName() {
        return stationName;
    }
    
    public void setStationName(String stationName) {
        this.stationName = stationName;
    }
    
    public double getCapacityPercentage() {
        return capacityPercentage;
    }
    
    public void setCapacityPercentage(double capacityPercentage) {
        this.capacityPercentage = capacityPercentage;
    }
    
    public int getActiveOrders() {
        return activeOrders;
    }
    
    public void setActiveOrders(int activeOrders) {
        this.activeOrders = activeOrders;
    }
    
    public List<String> getAssignedStaffIds() {
        return assignedStaffIds;
    }
    
    public void setAssignedStaffIds(List<String> assignedStaffIds) {
        this.assignedStaffIds = assignedStaffIds;
    }
    
    public List<CookingTimerSummary> getActiveTimers() {
        return activeTimers;
    }
    
    public void setActiveTimers(List<CookingTimerSummary> activeTimers) {
        this.activeTimers = activeTimers;
    }
    
    public double getAverageEfficiency() {
        return averageEfficiency;
    }
    
    public void setAverageEfficiency(double averageEfficiency) {
        this.averageEfficiency = averageEfficiency;
    }
    
    @Override
    public String toString() {
        return "KitchenStationStatus{" +
                "stationId='" + stationId + '\'' +
                ", stationName='" + stationName + '\'' +
                ", capacityPercentage=" + capacityPercentage +
                ", activeOrders=" + activeOrders +
                ", averageEfficiency=" + averageEfficiency +
                '}';
    }
}