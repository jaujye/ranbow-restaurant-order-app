package com.ranbow.restaurant.models;

/**
 * Enumeration for kitchen-specific order status
 * Provides more granular status tracking for kitchen operations
 */
public enum KitchenStatus {
    QUEUED("排隊等待"),
    PREPARING("備料中"),
    COOKING("烹調中"),
    PLATING("裝盤中"),
    READY("準備完成"),
    SERVED("已出餐"),
    PAUSED("暫停"),
    CANCELLED("已取消");
    
    private final String displayName;
    
    KitchenStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isActive() {
        return this == PREPARING || this == COOKING || this == PLATING;
    }
    
    public boolean isCompleted() {
        return this == READY || this == SERVED;
    }
    
    public boolean isCancelled() {
        return this == CANCELLED;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}