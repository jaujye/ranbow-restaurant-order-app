package com.ranbow.restaurant.models;

public enum PaymentStatus {
    PENDING("等待付款"),
    PROCESSING("處理中"),
    COMPLETED("付款完成"),
    FAILED("付款失敗"),
    REFUNDED("已退款"),
    CANCELLED("已取消");
    
    private final String displayName;
    
    PaymentStatus(String displayName) {
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