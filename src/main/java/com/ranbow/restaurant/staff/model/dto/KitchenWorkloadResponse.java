package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.entity.CookingStage;
import com.ranbow.restaurant.staff.model.entity.TimerStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Kitchen Workload Response DTO
 * Data Transfer Object for kitchen capacity and workload information
 */
public class KitchenWorkloadResponse {
    
    private List<ActiveTimer> activeTimers;
    private List<StaffWorkload> staffWorkloads;
    private KitchenStatistics statistics;
    private List<Alert> alerts;
    private LocalDateTime lastUpdated;
    private Integer currentCapacity;
    private Integer activeOrderCount;
    private String status;
    
    // Constructors
    public KitchenWorkloadResponse() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    public KitchenWorkloadResponse(List<ActiveTimer> activeTimers, 
                                  List<StaffWorkload> staffWorkloads,
                                  KitchenStatistics statistics) {
        this.activeTimers = activeTimers;
        this.staffWorkloads = staffWorkloads;
        this.statistics = statistics;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Nested ActiveTimer Class
    public static class ActiveTimer {
        private String timerId;
        private String orderId;
        private String menuItemName;
        private Integer quantity;
        private String staffId;
        private String staffName;
        private TimerStatus status;
        private CookingStage cookingStage;
        private LocalDateTime startedAt;
        private LocalDateTime estimatedCompletionTime;
        private Integer remainingMinutes;
        private Double progressPercentage;
        private String cookingMethod;
        private Integer temperatureCelsius;
        private boolean isOverdue;
        private boolean needsAlert;
        
        // Constructors
        public ActiveTimer() {}
        
        public ActiveTimer(String timerId, String orderId, String menuItemName, 
                          Integer quantity, String staffName) {
            this.timerId = timerId;
            this.orderId = orderId;
            this.menuItemName = menuItemName;
            this.quantity = quantity;
            this.staffName = staffName;
        }
        
        // Getters and Setters
        public String getTimerId() {
            return timerId;
        }
        
        public void setTimerId(String timerId) {
            this.timerId = timerId;
        }
        
        public String getOrderId() {
            return orderId;
        }
        
        public void setOrderId(String orderId) {
            this.orderId = orderId;
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
        
        public String getStaffId() {
            return staffId;
        }
        
        public void setStaffId(String staffId) {
            this.staffId = staffId;
        }
        
        public String getStaffName() {
            return staffName;
        }
        
        public void setStaffName(String staffName) {
            this.staffName = staffName;
        }
        
        public TimerStatus getStatus() {
            return status;
        }
        
        public void setStatus(TimerStatus status) {
            this.status = status;
        }
        
        public CookingStage getCookingStage() {
            return cookingStage;
        }
        
        public void setCookingStage(CookingStage cookingStage) {
            this.cookingStage = cookingStage;
        }
        
        public LocalDateTime getStartedAt() {
            return startedAt;
        }
        
        public void setStartedAt(LocalDateTime startedAt) {
            this.startedAt = startedAt;
        }
        
        public LocalDateTime getEstimatedCompletionTime() {
            return estimatedCompletionTime;
        }
        
        public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
            this.estimatedCompletionTime = estimatedCompletionTime;
        }
        
        public Integer getRemainingMinutes() {
            return remainingMinutes;
        }
        
        public void setRemainingMinutes(Integer remainingMinutes) {
            this.remainingMinutes = remainingMinutes;
        }
        
        public Double getProgressPercentage() {
            return progressPercentage;
        }
        
        public void setProgressPercentage(Double progressPercentage) {
            this.progressPercentage = progressPercentage;
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
        
        public boolean isOverdue() {
            return isOverdue;
        }
        
        public void setOverdue(boolean overdue) {
            isOverdue = overdue;
        }
        
        public boolean isNeedsAlert() {
            return needsAlert;
        }
        
        public void setNeedsAlert(boolean needsAlert) {
            this.needsAlert = needsAlert;
        }
    }
    
    // Nested StaffWorkload Class
    public static class StaffWorkload {
        private String staffId;
        private String staffName;
        private String role;
        private boolean isOnDuty;
        private Integer activeTimers;
        private Integer completedToday;
        private Double averageCompletionTime;
        private Double efficiencyScore;
        private String currentTask;
        private Integer workloadPercentage;
        
        // Constructors
        public StaffWorkload() {}
        
        public StaffWorkload(String staffId, String staffName, String role, boolean isOnDuty) {
            this.staffId = staffId;
            this.staffName = staffName;
            this.role = role;
            this.isOnDuty = isOnDuty;
        }
        
        // Getters and Setters
        public String getStaffId() {
            return staffId;
        }
        
        public void setStaffId(String staffId) {
            this.staffId = staffId;
        }
        
        public String getStaffName() {
            return staffName;
        }
        
        public void setStaffName(String staffName) {
            this.staffName = staffName;
        }
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
        
        public boolean isOnDuty() {
            return isOnDuty;
        }
        
        public void setOnDuty(boolean onDuty) {
            isOnDuty = onDuty;
        }
        
        public Integer getActiveTimers() {
            return activeTimers;
        }
        
        public void setActiveTimers(Integer activeTimers) {
            this.activeTimers = activeTimers;
        }
        
        public Integer getCompletedToday() {
            return completedToday;
        }
        
        public void setCompletedToday(Integer completedToday) {
            this.completedToday = completedToday;
        }
        
        public Double getAverageCompletionTime() {
            return averageCompletionTime;
        }
        
        public void setAverageCompletionTime(Double averageCompletionTime) {
            this.averageCompletionTime = averageCompletionTime;
        }
        
        public Double getEfficiencyScore() {
            return efficiencyScore;
        }
        
        public void setEfficiencyScore(Double efficiencyScore) {
            this.efficiencyScore = efficiencyScore;
        }
        
        public String getCurrentTask() {
            return currentTask;
        }
        
        public void setCurrentTask(String currentTask) {
            this.currentTask = currentTask;
        }
        
        public Integer getWorkloadPercentage() {
            return workloadPercentage;
        }
        
        public void setWorkloadPercentage(Integer workloadPercentage) {
            this.workloadPercentage = workloadPercentage;
        }
    }
    
    // Nested KitchenStatistics Class
    public static class KitchenStatistics {
        private Integer totalActiveTimers;
        private Integer overdueTimers;
        private Integer completedToday;
        private Double averageWaitTime;
        private Double kitchenEfficiency;
        private Integer staffOnDuty;
        private Integer maxCapacity;
        private Integer currentCapacityUsed;
        private String busyLevel; // LOW, MEDIUM, HIGH, CRITICAL
        
        // Constructors
        public KitchenStatistics() {}
        
        // Getters and Setters
        public Integer getTotalActiveTimers() {
            return totalActiveTimers;
        }
        
        public void setTotalActiveTimers(Integer totalActiveTimers) {
            this.totalActiveTimers = totalActiveTimers;
        }
        
        public Integer getOverdueTimers() {
            return overdueTimers;
        }
        
        public void setOverdueTimers(Integer overdueTimers) {
            this.overdueTimers = overdueTimers;
        }
        
        public Integer getCompletedToday() {
            return completedToday;
        }
        
        public void setCompletedToday(Integer completedToday) {
            this.completedToday = completedToday;
        }
        
        public Double getAverageWaitTime() {
            return averageWaitTime;
        }
        
        public void setAverageWaitTime(Double averageWaitTime) {
            this.averageWaitTime = averageWaitTime;
        }
        
        public Double getKitchenEfficiency() {
            return kitchenEfficiency;
        }
        
        public void setKitchenEfficiency(Double kitchenEfficiency) {
            this.kitchenEfficiency = kitchenEfficiency;
        }
        
        public Integer getStaffOnDuty() {
            return staffOnDuty;
        }
        
        public void setStaffOnDuty(Integer staffOnDuty) {
            this.staffOnDuty = staffOnDuty;
        }
        
        public Integer getMaxCapacity() {
            return maxCapacity;
        }
        
        public void setMaxCapacity(Integer maxCapacity) {
            this.maxCapacity = maxCapacity;
        }
        
        public Integer getCurrentCapacityUsed() {
            return currentCapacityUsed;
        }
        
        public void setCurrentCapacityUsed(Integer currentCapacityUsed) {
            this.currentCapacityUsed = currentCapacityUsed;
        }
        
        public String getBusyLevel() {
            return busyLevel;
        }
        
        public void setBusyLevel(String busyLevel) {
            this.busyLevel = busyLevel;
        }
    }
    
    // Nested Alert Class
    public static class Alert {
        private String type; // OVERDUE, QUALITY_CHECK, EQUIPMENT, STAFF
        private String message;
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
        private String timerId;
        private String orderId;
        private LocalDateTime alertTime;
        
        // Constructors
        public Alert() {}
        
        public Alert(String type, String message, String severity) {
            this.type = type;
            this.message = message;
            this.severity = severity;
            this.alertTime = LocalDateTime.now();
        }
        
        // Getters and Setters
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public String getSeverity() {
            return severity;
        }
        
        public void setSeverity(String severity) {
            this.severity = severity;
        }
        
        public String getTimerId() {
            return timerId;
        }
        
        public void setTimerId(String timerId) {
            this.timerId = timerId;
        }
        
        public String getOrderId() {
            return orderId;
        }
        
        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }
        
        public LocalDateTime getAlertTime() {
            return alertTime;
        }
        
        public void setAlertTime(LocalDateTime alertTime) {
            this.alertTime = alertTime;
        }
    }
    
    // Main class getters and setters
    public List<ActiveTimer> getActiveTimers() {
        return activeTimers;
    }
    
    public void setActiveTimers(List<ActiveTimer> activeTimers) {
        this.activeTimers = activeTimers;
    }
    
    public List<StaffWorkload> getStaffWorkloads() {
        return staffWorkloads;
    }
    
    public void setStaffWorkloads(List<StaffWorkload> staffWorkloads) {
        this.staffWorkloads = staffWorkloads;
    }
    
    public KitchenStatistics getStatistics() {
        return statistics;
    }
    
    public void setStatistics(KitchenStatistics statistics) {
        this.statistics = statistics;
    }
    
    public List<Alert> getAlerts() {
        return alerts;
    }
    
    public void setAlerts(List<Alert> alerts) {
        this.alerts = alerts;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public Integer getCurrentCapacity() {
        return currentCapacity;
    }
    
    public void setCurrentCapacity(Integer currentCapacity) {
        this.currentCapacity = currentCapacity;
    }
    
    public Integer getActiveOrderCount() {
        return activeOrderCount;
    }
    
    public void setActiveOrderCount(Integer activeOrderCount) {
        this.activeOrderCount = activeOrderCount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "KitchenWorkloadResponse{" +
                "activeTimers=" + (activeTimers != null ? activeTimers.size() : 0) +
                ", staffWorkloads=" + (staffWorkloads != null ? staffWorkloads.size() : 0) +
                ", alerts=" + (alerts != null ? alerts.size() : 0) +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}