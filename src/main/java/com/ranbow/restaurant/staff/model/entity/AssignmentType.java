package com.ranbow.restaurant.staff.model.entity;

/**
 * Assignment Type Enumeration
 * Defines different types of order assignments
 */
public enum AssignmentType {
    /**
     * Order preparation assignment - cooking, food preparation
     */
    PREPARATION("Preparation", "Cooking and food preparation tasks"),
    
    /**
     * Order service assignment - serving, customer interaction
     */
    SERVICE("Service", "Customer service and order delivery"),
    
    /**
     * Order management assignment - coordination, monitoring
     */
    MANAGEMENT("Management", "Order coordination and monitoring"),
    
    /**
     * Quality control assignment - final checks, packaging
     */
    QUALITY_CONTROL("Quality Control", "Final quality checks and packaging"),
    
    /**
     * Customer support assignment - handling special requests, complaints
     */
    CUSTOMER_SUPPORT("Customer Support", "Handling customer requests and issues"),
    
    /**
     * Cleanup assignment - post-order cleanup and sanitization
     */
    CLEANUP("Cleanup", "Post-order cleanup and sanitization");
    
    private final String displayName;
    private final String description;
    
    AssignmentType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}