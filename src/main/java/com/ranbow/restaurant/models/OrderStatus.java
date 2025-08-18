package com.ranbow.restaurant.models;

public enum OrderStatus {
    PENDING("等待確認"),
    PENDING_PAYMENT("等待付款"),
    CONFIRMED("已確認"),
    PREPARING("準備中"),
    READY("準備完成"),
    DELIVERED("已送達"),
    COMPLETED("已完成"),
    CANCELLED("已取消");
    
    private final String displayName;
    
    OrderStatus(String displayName) {
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