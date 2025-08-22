package com.ranbow.restaurant.staff.model.entity;

/**
 * Order Priority Enumeration
 * Defines priority levels for order processing
 */
public enum OrderPriority {
    LOW("Low", "Low priority order, can be processed when time allows", 1),
    NORMAL("Normal", "Standard priority order for regular processing", 2),
    HIGH("High", "High priority order requiring faster processing", 3),
    URGENT("Urgent", "Urgent order requiring immediate attention", 4),
    EMERGENCY("Emergency", "Emergency priority for special circumstances", 5);
    
    private final String displayName;
    private final String description;
    private final int priorityLevel;
    
    OrderPriority(String displayName, String description, int priorityLevel) {
        this.displayName = displayName;
        this.description = description;
        this.priorityLevel = priorityLevel;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getPriorityLevel() {
        return priorityLevel;
    }
    
    /**
     * Check if this priority is higher than another
     */
    public boolean isHigherThan(OrderPriority other) {
        return this.priorityLevel > other.priorityLevel;
    }
    
    /**
     * Check if this priority is lower than another
     */
    public boolean isLowerThan(OrderPriority other) {
        return this.priorityLevel < other.priorityLevel;
    }
    
    /**
     * Get the maximum allowed processing time in minutes
     */
    public int getMaxProcessingTimeMinutes() {
        return switch (this) {
            case LOW -> 45;
            case NORMAL -> 30;
            case HIGH -> 20;
            case URGENT -> 10;
            case EMERGENCY -> 5;
        };
    }
    
    /**
     * Get the notification threshold in minutes (when to alert staff)
     */
    public int getNotificationThresholdMinutes() {
        return switch (this) {
            case LOW -> 35;
            case NORMAL -> 25;
            case HIGH -> 15;
            case URGENT -> 7;
            case EMERGENCY -> 3;
        };
    }
    
    /**
     * Check if this priority requires immediate notification
     */
    public boolean requiresImmediateNotification() {
        return this == URGENT || this == EMERGENCY;
    }
    
    /**
     * Get CSS class for UI styling
     */
    public String getCssClass() {
        return switch (this) {
            case LOW -> "priority-low";
            case NORMAL -> "priority-normal";
            case HIGH -> "priority-high";
            case URGENT -> "priority-urgent";
            case EMERGENCY -> "priority-emergency";
        };
    }
    
    /**
     * Get color code for UI display
     */
    public String getColorCode() {
        return switch (this) {
            case LOW -> "#28a745";        // Green
            case NORMAL -> "#6c757d";     // Gray
            case HIGH -> "#ffc107";       // Yellow
            case URGENT -> "#fd7e14";     // Orange
            case EMERGENCY -> "#dc3545";  // Red
        };
    }
    
    /**
     * Automatically determine priority based on order age and other factors
     */
    public static OrderPriority calculateAutoPriority(int orderAgeMinutes, boolean isVip, 
                                                     boolean hasComplaints, int customerWaitTime) {
        // Emergency cases
        if (hasComplaints && customerWaitTime > 45) {
            return EMERGENCY;
        }
        
        // Urgent cases
        if (orderAgeMinutes > 40 || (isVip && orderAgeMinutes > 20)) {
            return URGENT;
        }
        
        // High priority cases
        if (orderAgeMinutes > 25 || (isVip && orderAgeMinutes > 10)) {
            return HIGH;
        }
        
        // VIP customers get at least normal priority
        if (isVip) {
            return NORMAL;
        }
        
        // Default to normal, low priority for very quiet periods
        return orderAgeMinutes < 5 ? LOW : NORMAL;
    }
}