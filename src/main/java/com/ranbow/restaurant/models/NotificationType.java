package com.ranbow.restaurant.models;

/**
 * Enumeration for different types of staff notifications
 */
public enum NotificationType {
    NEW_ORDER("新訂單"),
    ORDER_STATUS_CHANGE("訂單狀態變更"),
    ORDER_OVERTIME("訂單超時"),
    EMERGENCY("緊急通知"),
    SHIFT_REMINDER("排班提醒"),
    SYSTEM("系統通知"),
    CUSTOMER_FEEDBACK("顧客回饋"),
    ANNOUNCEMENT("公告");
    
    private final String displayName;
    
    NotificationType(String displayName) {
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