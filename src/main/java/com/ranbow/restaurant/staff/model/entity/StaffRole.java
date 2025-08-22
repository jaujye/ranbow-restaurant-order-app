package com.ranbow.restaurant.staff.model.entity;

/**
 * Staff Role Enumeration for Role-Based Access Control
 * Defines different roles with varying levels of access and responsibility
 */
public enum StaffRole {
    KITCHEN("Kitchen Staff", "Responsible for food preparation and cooking"),
    SERVICE("Service Staff", "Handles customer service and order delivery"),
    CASHIER("Cashier", "Manages payments and customer transactions"),
    MANAGER("Manager", "Supervises operations and manages staff"),
    ADMIN("Administrator", "Full system access and user management");
    
    private final String displayName;
    private final String description;
    
    StaffRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if this role has management privileges
     */
    public boolean isManagerRole() {
        return this == MANAGER || this == ADMIN;
    }
    
    /**
     * Check if this role can access kitchen functions
     */
    public boolean canAccessKitchen() {
        return this == KITCHEN || this == MANAGER || this == ADMIN;
    }
    
    /**
     * Check if this role can handle payments
     */
    public boolean canHandlePayments() {
        return this == CASHIER || this == MANAGER || this == ADMIN;
    }
    
    /**
     * Check if this role can manage staff
     */
    public boolean canManageStaff() {
        return this == MANAGER || this == ADMIN;
    }
    
    /**
     * Get role hierarchy level (higher number = more privileges)
     */
    public int getHierarchyLevel() {
        return switch (this) {
            case KITCHEN -> 1;
            case SERVICE -> 2;
            case CASHIER -> 3;
            case MANAGER -> 4;
            case ADMIN -> 5;
        };
    }
    
    /**
     * Check if this role has higher privileges than another role
     */
    public boolean hasHigherPrivilegesThan(StaffRole other) {
        return this.getHierarchyLevel() > other.getHierarchyLevel();
    }
}