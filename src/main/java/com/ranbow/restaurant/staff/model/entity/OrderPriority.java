package com.ranbow.restaurant.staff.model.entity;

/**
 * Order Priority Enumeration
 * Defines priority levels for order processing and queue management
 */
public enum OrderPriority {
    LOW(1, "Low Priority", "Standard processing order"),
    NORMAL(2, "Normal Priority", "Regular orders with standard timing"),
    HIGH(3, "High Priority", "Orders requiring faster processing"),
    URGENT(4, "Urgent Priority", "Time-sensitive orders"),
    EMERGENCY(5, "Emergency Priority", "Critical orders requiring immediate attention");
    
    private final int level;
    private final String displayName;
    private final String description;
    
    OrderPriority(int level, String displayName, String description) {
        this.level = level;
        this.displayName = displayName;
        this.description = description;
    }
    
    public int getLevel() {
        return level;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Determine priority based on order age and other factors
     */
    public static OrderPriority determinePriority(java.time.LocalDateTime orderTime, 
                                                String specialInstructions, 
                                                int itemCount) {
        if (orderTime == null) {
            return NORMAL;
        }
        
        long ageInMinutes = java.time.Duration.between(orderTime, java.time.LocalDateTime.now()).toMinutes();
        
        // Emergency: Orders over 45 minutes old
        if (ageInMinutes > 45) {
            return EMERGENCY;
        }
        
        // Urgent: Orders over 30 minutes old or with special requirements
        if (ageInMinutes > 30 || (specialInstructions != null && specialInstructions.toLowerCase().contains("urgent"))) {
            return URGENT;
        }
        
        // High: Orders over 20 minutes old or complex orders
        if (ageInMinutes > 20 || itemCount > 5) {
            return HIGH;
        }
        
        // Normal: Standard orders within time limits
        if (ageInMinutes > 10) {
            return NORMAL;
        }
        
        // Low: Fresh orders
        return LOW;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}