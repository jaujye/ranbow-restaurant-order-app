package com.ranbow.restaurant.models;

/**
 * Enumeration for statistics reporting periods
 */
public enum StatisticsPeriod {
    DAILY("每日"),
    WEEKLY("每週"),
    MONTHLY("每月");
    
    private final String displayName;
    
    StatisticsPeriod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}