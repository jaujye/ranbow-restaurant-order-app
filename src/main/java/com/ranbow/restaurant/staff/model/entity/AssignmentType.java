package com.ranbow.restaurant.staff.model.entity;

/**
 * Assignment Type Enumeration
 * Defines different types of order assignments based on work function
 */
public enum AssignmentType {
    COOKING("Cooking", "Responsible for preparing/cooking the order"),
    PREPARATION("Preparation", "Responsible for food preparation and plating"),
    SERVING("Serving", "Responsible for delivering order to customer"),
    CASHIER("Cashier", "Responsible for payment processing"),
    PACKAGING("Packaging", "Responsible for packaging takeaway orders"),
    QUALITY_CHECK("Quality Check", "Responsible for final quality inspection"),
    CLEANUP("Cleanup", "Responsible for cleaning after order completion");
    
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
    
    /**
     * Get the typical duration in minutes for this assignment type
     */
    public int getTypicalDurationMinutes() {
        return switch (this) {
            case COOKING -> 15;
            case PREPARATION -> 8;
            case SERVING -> 3;
            case CASHIER -> 2;
            case PACKAGING -> 5;
            case QUALITY_CHECK -> 2;
            case CLEANUP -> 5;
        };
    }
    
    /**
     * Check if this assignment type requires kitchen access
     */
    public boolean requiresKitchenAccess() {
        return switch (this) {
            case COOKING, PREPARATION, QUALITY_CHECK -> true;
            case SERVING, CASHIER, PACKAGING, CLEANUP -> false;
        };
    }
    
    /**
     * Get the priority order for assignment scheduling
     */
    public int getPriorityOrder() {
        return switch (this) {
            case COOKING -> 1;        // Highest priority
            case PREPARATION -> 2;
            case QUALITY_CHECK -> 3;
            case PACKAGING -> 4;
            case SERVING -> 5;
            case CASHIER -> 6;
            case CLEANUP -> 7;        // Lowest priority
        };
    }
    
    /**
     * Check if this assignment can be done in parallel with others
     */
    public boolean canBeParallel() {
        return switch (this) {
            case COOKING -> false;    // Usually needs dedicated attention
            case PREPARATION -> false;
            case SERVING, CASHIER, PACKAGING, QUALITY_CHECK, CLEANUP -> true;
        };
    }
}