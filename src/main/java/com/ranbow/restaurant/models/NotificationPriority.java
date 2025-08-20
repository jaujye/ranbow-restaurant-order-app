package com.ranbow.restaurant.models;

/**
 * Enumeration for notification priority levels
 */
public enum NotificationPriority {
    LOW("低優先級"),
    NORMAL("一般"),
    HIGH("高優先級"),
    EMERGENCY("緊急");
    
    private final String displayName;
    
    NotificationPriority(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getPriorityLevel() {
        return switch (this) {
            case LOW -> 1;
            case NORMAL -> 2;
            case HIGH -> 3;
            case EMERGENCY -> 4;
        };
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}