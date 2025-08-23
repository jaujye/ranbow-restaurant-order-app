package com.ranbow.restaurant.models.kitchen;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Kitchen Station Status DTO
 * Represents the current status of a kitchen workstation
 */
public class KitchenStationStatus {
    private String stationId;
    private String stationName;
    private String stationType;
    private double capacityPercentage;
    private int activeOrders;
    private int maxCapacity;
    private List<String> assignedStaffIds;
    private List<CookingTimerSummary> activeTimers;
    private double averageEfficiency;
    private StationAlert alert;
    private LocalDateTime lastUpdated;
    private boolean isOperational;
    private String status; // AVAILABLE, BUSY, OVERLOADED, MAINTENANCE
    
    public KitchenStationStatus() {
        this.assignedStaffIds = new ArrayList<>();
        this.activeTimers = new ArrayList<>();
        this.lastUpdated = LocalDateTime.now();
        this.isOperational = true;
        this.status = "AVAILABLE";
    }
    
    public KitchenStationStatus(String stationId, String stationName, double capacityPercentage, 
                               int activeOrders, List<String> assignedStaffIds, 
                               List<CookingTimerSummary> activeTimers, double averageEfficiency) {
        this();
        this.stationId = stationId;
        this.stationName = stationName;
        this.capacityPercentage = capacityPercentage;
        this.activeOrders = activeOrders;
        this.assignedStaffIds = assignedStaffIds != null ? assignedStaffIds : new ArrayList<>();
        this.activeTimers = activeTimers != null ? activeTimers : new ArrayList<>();
        this.averageEfficiency = averageEfficiency;
        this.status = determineStatus(capacityPercentage);
    }
    
    private String determineStatus(double capacityPercentage) {
        if (!isOperational) return "MAINTENANCE";
        if (capacityPercentage >= 100) return "OVERLOADED";
        if (capacityPercentage >= 80) return "BUSY";
        return "AVAILABLE";
    }
    
    // Business logic methods
    public boolean isAvailable() {
        return isOperational && capacityPercentage < 100;
    }
    
    public boolean isOverloaded() {
        return capacityPercentage >= 100;
    }
    
    public boolean needsAttention() {
        return !isOperational || capacityPercentage >= 90 || 
               (alert != null && alert.getPriority().equals("HIGH"));
    }
    
    public int getAvailableCapacity() {
        return Math.max(0, maxCapacity - activeOrders);
    }
    
    public double getUtilizationRate() {
        return maxCapacity > 0 ? (double) activeOrders / maxCapacity : 0.0;
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
    
    public String getStationType() {
        return stationType;
    }
    
    public void setStationType(String stationType) {
        this.stationType = stationType;
    }
    
    public double getCapacityPercentage() {
        return capacityPercentage;
    }
    
    public void setCapacityPercentage(double capacityPercentage) {
        this.capacityPercentage = capacityPercentage;
        this.status = determineStatus(capacityPercentage);
    }
    
    public int getActiveOrders() {
        return activeOrders;
    }
    
    public void setActiveOrders(int activeOrders) {
        this.activeOrders = activeOrders;
    }
    
    public int getMaxCapacity() {
        return maxCapacity;
    }
    
    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }
    
    public List<String> getAssignedStaffIds() {
        return assignedStaffIds;
    }
    
    public void setAssignedStaffIds(List<String> assignedStaffIds) {
        this.assignedStaffIds = assignedStaffIds != null ? assignedStaffIds : new ArrayList<>();
    }
    
    public List<CookingTimerSummary> getActiveTimers() {
        return activeTimers;
    }
    
    public void setActiveTimers(List<CookingTimerSummary> activeTimers) {
        this.activeTimers = activeTimers != null ? activeTimers : new ArrayList<>();
    }
    
    public double getAverageEfficiency() {
        return averageEfficiency;
    }
    
    public void setAverageEfficiency(double averageEfficiency) {
        this.averageEfficiency = averageEfficiency;
    }
    
    public StationAlert getAlert() {
        return alert;
    }
    
    public void setAlert(StationAlert alert) {
        this.alert = alert;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public boolean isOperational() {
        return isOperational;
    }
    
    public void setOperational(boolean operational) {
        isOperational = operational;
        this.status = determineStatus(capacityPercentage);
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "KitchenStationStatus{" +
                "stationId='" + stationId + '\'' +
                ", stationName='" + stationName + '\'' +
                ", status='" + status + '\'' +
                ", capacityPercentage=" + capacityPercentage +
                ", activeOrders=" + activeOrders +
                ", assignedStaff=" + assignedStaffIds.size() +
                ", averageEfficiency=" + averageEfficiency +
                ", isOperational=" + isOperational +
                '}';
    }
    
    /**
     * Station Alert DTO
     * Represents alerts or issues with a kitchen station
     */
    public static class StationAlert {
        private String type;
        private String message;
        private String priority; // LOW, MEDIUM, HIGH, CRITICAL
        private LocalDateTime createdAt;
        private boolean acknowledged;
        
        public StationAlert() {
            this.createdAt = LocalDateTime.now();
            this.acknowledged = false;
        }
        
        public StationAlert(String type, String message, String priority) {
            this();
            this.type = type;
            this.message = message;
            this.priority = priority;
        }
        
        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public boolean isAcknowledged() { return acknowledged; }
        public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
        
        @Override
        public String toString() {
            return String.format("StationAlert{type='%s', priority='%s', message='%s'}", 
                               type, priority, message);
        }
    }
}

/**
 * Cooking Timer Summary DTO
 * Summarized information about an active cooking timer
 */
class CookingTimerSummary {
    private String timerId;
    private String orderId;
    private int elapsedSeconds;
    private int remainingSeconds;
    private String stage;
    private double progressPercentage;
    
    public CookingTimerSummary() {}
    
    public CookingTimerSummary(String timerId, String orderId, int elapsedSeconds, 
                              int remainingSeconds, String stage, double progressPercentage) {
        this.timerId = timerId;
        this.orderId = orderId;
        this.elapsedSeconds = elapsedSeconds;
        this.remainingSeconds = remainingSeconds;
        this.stage = stage;
        this.progressPercentage = progressPercentage;
    }
    
    // Getters and Setters
    public String getTimerId() { return timerId; }
    public void setTimerId(String timerId) { this.timerId = timerId; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public int getElapsedSeconds() { return elapsedSeconds; }
    public void setElapsedSeconds(int elapsedSeconds) { this.elapsedSeconds = elapsedSeconds; }
    public int getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(int remainingSeconds) { this.remainingSeconds = remainingSeconds; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }
    
    @Override
    public String toString() {
        return String.format("CookingTimerSummary{timerId='%s', orderId='%s', stage='%s', progress=%.1f%%}", 
                           timerId, orderId, stage, progressPercentage);
    }
}