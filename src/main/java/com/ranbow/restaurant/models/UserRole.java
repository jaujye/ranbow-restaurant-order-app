package com.ranbow.restaurant.models;

public enum UserRole {
    CUSTOMER("顧客"),
    ADMIN("管理員"),
    STAFF("員工");
    
    private final String displayName;
    
    UserRole(String displayName) {
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